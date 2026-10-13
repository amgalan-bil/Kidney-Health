import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import donationModel from "../models/donationModel.js";
import {
  donorboxConfigured,
  syncDonorboxDonations,
} from "./donorboxController.js";

// --- Admin access ---
// Every admin call must send the ADMIN_KEY (set on the server) in the
// x-admin-key header. With no key configured, the admin tools stay switched off.
const ADMIN_KEY = process.env.ADMIN_KEY;
const MIN_KEY_LENGTH = 16;

const keyMatches = (given) => {
  if (!ADMIN_KEY || ADMIN_KEY.length < MIN_KEY_LENGTH) return false;
  if (typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(ADMIN_KEY);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const requireAdmin = (req, res, next) => {
  if (!ADMIN_KEY || ADMIN_KEY.length < MIN_KEY_LENGTH) {
    return res.status(503).json({
      success: false,
      message: `Admin tools are off. Set ADMIN_KEY (at least ${MIN_KEY_LENGTH} characters) on the server.`,
    });
  }
  if (!keyMatches(req.get("x-admin-key"))) {
    return res.status(401).json({ success: false, message: "Wrong admin key." });
  }
  next();
};

// The admin page itself is plain HTML; it holds no data until the key is entered.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const adminPage = (req, res) => {
  res.set("Cache-Control", "no-store");
  res.set("X-Robots-Tag", "noindex");
  res.sendFile(path.join(__dirname, "..", "admin.html"));
};

// --- Lists ---

export const listFundraisers = async (req, res) => {
  const users = await userModel
    .find({ isFundraiser: true }, { name: 1, totalDonatedAmount: 1 })
    .sort({ name: 1 })
    .lean();
  res.json({ success: true, fundraisers: users });
};

// Paid gifts, newest first. ?scope=unassigned (default) shows the General-fund
// gifts that may belong to a student; ?scope=all shows everything.
export const listDonations = async (req, res) => {
  const scope = req.query.scope === "all" ? "all" : "unassigned";
  const query = { status: "paid" };
  if (scope === "unassigned") query.userId = null;

  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: safe, $options: "i" } },
      { message: { $regex: safe, $options: "i" } },
    ];
  }

  const donations = await donationModel
    .find(query, {
      name: 1,
      message: 1,
      amount: 1,
      currency: 1,
      originalAmount: 1,
      source: 1,
      userId: 1,
      createdAt: 1,
      reassignments: 1,
    })
    .sort({ createdAt: -1 })
    .limit(1000)
    .populate("userId", "name")
    .lean();

  const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  res.json({ success: true, scope, count: donations.length, totalAmount, donations });
};

// --- Moving a gift to the right student ---
// Body: { userId } — a fundraiser's id, or null to send it back to the General fund.
// The move only goes through if the gift is still where the admin saw it, so two
// people clicking at once can't count it twice. Every move is kept on the gift.
export const assignDonation = async (req, res) => {
  const { id } = req.params;
  const target = req.body?.userId || null;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid gift id." });
  }
  if (target && !mongoose.isValidObjectId(target)) {
    return res.status(400).json({ success: false, message: "Invalid student id." });
  }

  const donation = await donationModel.findById(id).lean();
  if (!donation || donation.status !== "paid") {
    return res
      .status(404)
      .json({ success: false, message: "Paid gift not found." });
  }

  const from = donation.userId ? donation.userId.toString() : null;
  if (from === target) {
    return res.json({ success: true, message: "Gift is already there.", donation });
  }

  if (target && !(await userModel.exists({ _id: target, isFundraiser: true }))) {
    return res
      .status(404)
      .json({ success: false, message: "Student fundraiser not found." });
  }

  const moved = await donationModel.findOneAndUpdate(
    { _id: id, status: "paid", userId: from },
    {
      $set: { userId: target },
      $push: { reassignments: { from, to: target, at: new Date() } },
    },
    { new: true }
  );
  if (!moved) {
    return res.status(409).json({
      success: false,
      message: "This gift was just changed by someone else. Reload and try again.",
    });
  }

  if (from) {
    await userModel.findByIdAndUpdate(from, {
      $inc: { totalDonatedAmount: -donation.amount },
    });
  }
  if (target) {
    await userModel.findByIdAndUpdate(target, {
      $inc: { totalDonatedAmount: donation.amount },
    });
  }

  console.log(
    `Admin moved gift ${id} (${donation.amount}₮) from ${from || "general fund"} to ${target || "general fund"}.`
  );
  res.json({ success: true, message: "Gift moved.", donation: moved });
};

// --- Totals check ---
// Adds up each student's paid gifts and compares that with the total shown on
// the site. GET only reports; POST { userId } fixes one student's total.
const paidSums = async () => {
  const rows = await donationModel.aggregate([
    { $match: { status: "paid", userId: { $ne: null } } },
    { $group: { _id: "$userId", sum: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [r._id.toString(), r]));
};

export const checkTotals = async (req, res) => {
  const sums = await paidSums();
  const users = await userModel
    .find(
      { $or: [{ isFundraiser: true }, { totalDonatedAmount: { $ne: 0 } }] },
      { name: 1, totalDonatedAmount: 1 }
    )
    .lean();

  const rows = users.map((u) => {
    const s = sums.get(u._id.toString());
    const fromGifts = s ? s.sum : 0;
    const shown = u.totalDonatedAmount || 0;
    return {
      _id: u._id,
      name: u.name,
      shown,
      fromGifts,
      gifts: s ? s.count : 0,
      difference: shown - fromGifts,
    };
  });

  const mismatched = rows.filter((r) => r.difference !== 0);
  res.json({ success: true, mismatched, checked: rows.length });
};

export const fixTotal = async (req, res) => {
  const { userId } = req.body || {};
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ success: false, message: "Invalid student id." });
  }
  const sums = await paidSums();
  const total = sums.get(userId)?.sum || 0;
  const user = await userModel.findByIdAndUpdate(
    userId,
    { $set: { totalDonatedAmount: total } },
    { new: true, projection: { name: 1, totalDonatedAmount: 1 } }
  );
  if (!user) {
    return res.status(404).json({ success: false, message: "Student not found." });
  }
  console.log(`Admin reset total for ${user.name} to ${total}₮.`);
  res.json({ success: true, user });
};

// --- Donorbox ---
export const syncDonorboxNow = async (req, res) => {
  if (!donorboxConfigured()) {
    return res
      .status(503)
      .json({ success: false, message: "Donorbox is not configured on the server." });
  }
  try {
    const recorded = await syncDonorboxDonations();
    res.json({ success: true, recorded });
  } catch (error) {
    console.error(
      "Admin Donorbox sync failed:",
      error.response ? error.response.data : error.message
    );
    res.status(502).json({ success: false, message: "Donorbox sync failed." });
  }
};
