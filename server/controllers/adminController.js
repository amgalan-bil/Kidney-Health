import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import donationModel from "../models/donationModel.js";
import {
  codeIn,
  donorboxConfigured,
  syncDonorboxDonations,
} from "./donorboxController.js";

// Must match MNT_PER_USD in donorboxController.js and client/src/lib/utils.ts.
const MNT_PER_USD = 3_500;

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
  await userModel.ensureDonorCodes();
  const users = await userModel
    .find({ isFundraiser: true }, { name: 1, totalDonatedAmount: 1, donorCode: 1 })
    .sort({ name: 1 })
    .lean();
  res.json({ success: true, fundraisers: users });
};

// --- Accounts ---
// Finds sign-ups by name or email, including people who never started a
// fundraiser (they don't appear anywhere else). Emails are partly hidden: enough
// to tell two people apart, not enough to copy.
const maskEmail = (email) => {
  const [user = "", domain = ""] = String(email || "").split("@");
  return (user.length <= 2 ? user[0] || "" : user.slice(0, 2)) + "***@" + domain;
};

export const findAccounts = async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  if (search.length < 2) {
    return res
      .status(400)
      .json({ success: false, message: "Type at least 2 letters of a name or email." });
  }
  const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const users = await userModel
    .find(
      { $or: [{ name: { $regex: safe, $options: "i" } }, { email: { $regex: safe, $options: "i" } }] },
      { name: 1, email: 1, isFundraiser: 1, donorCode: 1, totalDonatedAmount: 1, createdAt: 1 }
    )
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();
  res.json({
    success: true,
    accounts: users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: maskEmail(u.email),
      isFundraiser: Boolean(u.isFundraiser),
      donorCode: u.donorCode || null,
      totalDonatedAmount: u.totalDonatedAmount || 0,
      createdAt: u.createdAt,
    })),
  });
};

// Starts the fundraiser page for a student who signed up but got stuck before
// pressing "Start my fundraiser". Same effect as them pressing it.
export const startFundraiserFor = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Unknown account." });
  }
  const user = await userModel.findByIdAndUpdate(id, { isFundraiser: true }, { new: true });
  if (!user) {
    return res.status(404).json({ success: false, message: "Unknown account." });
  }
  await userModel.ensureDonorCodes();
  const fresh = await userModel.findById(id, { name: 1, donorCode: 1 }).lean();
  res.json({ success: true, account: { _id: fresh._id, name: fresh.name, donorCode: fresh.donorCode || null } });
};

// --- Suggestions for General-fund gifts ---
// Looks for a student's code or name in the gift's message (or a donor name
// that is exactly a student's name). Only a single, clear match is suggested;
// an admin still has to confirm every move.
const normalize = (s) =>
  ` ${String(s || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()} `;

const buildMatcher = (fundraisers) => {
  const byCode = new Map(fundraisers.filter((f) => f.donorCode).map((f) => [f.donorCode, f]));
  const people = fundraisers
    .map((f) => ({ f, full: normalize(f.name), first: normalize(f.name).trim().split(" ")[0] }))
    .filter((p) => p.full.trim());
  const firstCounts = new Map();
  for (const p of people) firstCounts.set(p.first, (firstCounts.get(p.first) || 0) + 1);

  return (donation) => {
    const code = codeIn(donation.message);
    if (code && byCode.has(code)) {
      return { f: byCode.get(code), why: `message has ${code}` };
    }

    const msg = normalize(donation.message);
    const full = people.filter((p) => msg.includes(p.full));
    if (full.length === 1) return { f: full[0].f, why: "name in message" };
    if (full.length > 1) return null;

    const first = people.filter(
      (p) => p.first.length >= 4 && firstCounts.get(p.first) === 1 && msg.includes(` ${p.first} `)
    );
    if (first.length === 1) return { f: first[0].f, why: "first name in message" };
    if (first.length > 1) return null;

    const donor = normalize(donation.name);
    const same = people.filter((p) => donor === p.full);
    if (same.length === 1) return { f: same[0].f, why: "donor name is a student's name" };
    return null;
  };
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

  // Suggest a student for gifts still in the General fund.
  const unassigned = donations.filter((d) => !d.userId);
  if (unassigned.length) {
    const fundraisers = await userModel
      .find({ isFundraiser: true }, { name: 1, donorCode: 1 })
      .lean();
    const suggest = buildMatcher(fundraisers);
    for (const d of unassigned) {
      const hit = suggest(d);
      if (hit) d.suggestion = { _id: hit.f._id, name: hit.f.name, why: hit.why };
    }
  }

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

// --- Offline gifts (cash, bake sales, bank transfers) ---
// Recorded as paid gifts so they show on the student's page and the Totals
// check stays accurate. Body: { userId|null, amount, currency: "MNT"|"USD",
// name, message, date }.
const MAX_OFFLINE_MNT = 50_000_000; // a typo guard, about $14,000

export const addOfflineGift = async (req, res) => {
  const { userId = null, amount, currency = "MNT", name, message, date } = req.body || {};

  if (userId && !mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ success: false, message: "Invalid student id." });
  }
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    return res.status(400).json({ success: false, message: "Enter an amount above zero." });
  }
  const cur = String(currency).toUpperCase();
  if (cur !== "MNT" && cur !== "USD") {
    return res.status(400).json({ success: false, message: "Currency must be MNT or USD." });
  }
  const mnt = Math.round(cur === "USD" ? value * MNT_PER_USD : value);
  if (mnt > MAX_OFFLINE_MNT) {
    return res.status(400).json({
      success: false,
      message: "That amount is unusually large. Check it, or record it in parts.",
    });
  }
  const label = typeof name === "string" && name.trim() ? name.trim().slice(0, 100) : "Cash";
  // A plain date ("2026-10-05") is taken as midday UTC so it shows as that same
  // day in Mongolia and in the US.
  const givenAt = !date
    ? new Date()
    : /^\d{4}-\d{2}-\d{2}$/.test(String(date))
      ? new Date(`${date}T12:00:00Z`)
      : new Date(date);
  if (Number.isNaN(givenAt.getTime()) || givenAt.getTime() > Date.now() + 86_400_000) {
    return res.status(400).json({ success: false, message: "Invalid date." });
  }
  if (userId && !(await userModel.exists({ _id: userId, isFundraiser: true }))) {
    return res.status(404).json({ success: false, message: "Student fundraiser not found." });
  }

  const [gift] = await donationModel.create(
    [
      {
        source: "offline",
        status: "paid",
        userId,
        amount: mnt,
        currency: cur,
        originalAmount: value,
        name: label,
        message: typeof message === "string" && message.trim() ? message.trim().slice(0, 500) : undefined,
        createdAt: givenAt,
        updatedAt: givenAt,
      },
    ],
    { timestamps: false }
  );

  if (userId) {
    await userModel.findByIdAndUpdate(userId, { $inc: { totalDonatedAmount: mnt } });
  }
  console.log(`Admin recorded offline gift ${gift._id} (${mnt}₮) for ${userId || "general fund"}.`);
  res.json({ success: true, donation: gift });
};

// Removes an offline gift entered by mistake. Only offline gifts can be removed;
// QPay and Donorbox gifts are real payments and stay.
export const removeOfflineGift = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid gift id." });
  }
  const gift = await donationModel.findOneAndDelete({ _id: id, source: "offline", status: "paid" });
  if (!gift) {
    return res.status(404).json({ success: false, message: "Offline gift not found." });
  }
  if (gift.userId) {
    await userModel.findByIdAndUpdate(gift.userId, {
      $inc: { totalDonatedAmount: -gift.amount },
    });
  }
  console.log(`Admin removed offline gift ${id} (${gift.amount}₮).`);
  res.json({ success: true });
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
