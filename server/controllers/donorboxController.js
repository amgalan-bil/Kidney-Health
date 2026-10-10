import crypto from "crypto";
import axios from "axios";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import donationModel from "../models/donationModel.js";
import { markDonationPaid } from "./donationController.js";

// --- Donorbox Configuration ---
// The API uses basic auth: the organisation's login email and its API key.
const DONORBOX_API_URL = "https://donorbox.org/api/v1";
const DONORBOX_EMAIL = process.env.DONORBOX_EMAIL;
const DONORBOX_API_KEY = process.env.DONORBOX_API_KEY;
// Optional: only count gifts to this campaign, if the account runs others.
const DONORBOX_CAMPAIGN_ID = process.env.DONORBOX_CAMPAIGN_ID;
// Shared secret carried in the webhook URL (?secret=...).
const DONORBOX_WEBHOOK_SECRET = process.env.DONORBOX_WEBHOOK_SECRET;

// Totals are kept in tugriks. Must match MNT_PER_USD in client/src/lib/utils.ts,
// so a $50 gift reads back as $50 on the English site.
const MNT_PER_USD = 3_500;

export const donorboxConfigured = () => Boolean(DONORBOX_EMAIL && DONORBOX_API_KEY);

const fetchDonations = async (params) => {
  const { data } = await axios.get(`${DONORBOX_API_URL}/donations`, {
    auth: { username: DONORBOX_EMAIL, password: DONORBOX_API_KEY },
    params: {
      per_page: 100,
      ...(DONORBOX_CAMPAIGN_ID && { campaign_id: DONORBOX_CAMPAIGN_ID }),
      ...params,
    },
  });
  return Array.isArray(data) ? data : [];
};

// What the gift is worth in tugriks, after refunds. Null if it can't be priced.
const toMnt = (gift) => {
  const refunded = parseFloat(gift.amount_refunded) || 0;
  const currency = (gift.currency || "").toUpperCase();

  if (currency === "MNT") return Math.round(parseFloat(gift.amount) - refunded);
  if (currency === "USD") {
    return Math.round((parseFloat(gift.amount) - refunded) * MNT_PER_USD);
  }
  // Other currencies: fall back to Donorbox's own conversion, if that is USD.
  if ((gift.converted_currency || "").toUpperCase() === "USD") {
    const share = 1 - refunded / parseFloat(gift.amount);
    return Math.round(parseFloat(gift.converted_amount) * share * MNT_PER_USD);
  }
  return null;
};

// The site tags each Donorbox link with utm_content=<fundraiser id>. Anything
// else, or a fundraiser that no longer exists, goes to the campaign.
const fundraiserFor = async (gift) => {
  const id = gift.utm_content;
  if (!id || !mongoose.isValidObjectId(id)) return null;
  return (await userModel.exists({ _id: id, isFundraiser: true })) ? id : null;
};

const donorName = (gift) => {
  if (gift.anonymous_donation) return "Anonymous";
  const donor = gift.donor || {};
  const name =
    donor.name || [donor.first_name, donor.last_name].filter(Boolean).join(" ");
  return name.trim() || "Anonymous";
};

// Records one Donorbox gift and credits it, exactly once. The unique
// donorboxId stops a second copy being inserted, and markDonationPaid's
// pending guard stops a second credit, however often the gift is seen.
const recordGift = async (gift) => {
  if (gift.status !== "paid") return null;

  const amount = toMnt(gift);
  if (!amount || amount <= 0) {
    if (amount === null) {
      console.warn(`Donorbox gift ${gift.id}: can't price ${gift.currency}, skipped.`);
    }
    return null;
  }

  const donorboxId = String(gift.id);
  const givenAt = gift.donation_date ? new Date(gift.donation_date) : new Date();

  let donation;
  try {
    donation = await donationModel.findOneAndUpdate(
      { donorboxId },
      {
        $setOnInsert: {
          source: "donorbox",
          donorboxId,
          amount,
          currency: gift.currency,
          originalAmount: parseFloat(gift.amount),
          userId: await fundraiserFor(gift),
          name: donorName(gift),
          message: gift.comment || undefined,
          status: "pending",
          // When it was given, not when we heard about it, so the donor list
          // stays in order when old gifts are backfilled.
          createdAt: givenAt,
          updatedAt: givenAt,
        },
      },
      { upsert: true, new: true, timestamps: false }
    );
  } catch (error) {
    // Webhook and sweep inserted the same gift at once; the other one has it.
    if (error.code === 11000) return null;
    throw error;
  }

  return markDonationPaid(donation._id, `donorbox_${donorboxId}`);
};

// Pulls gifts from the Donorbox API and records any we haven't seen. The very
// first run reads the whole history, which backfills gifts made before this
// existed; after that the last week is enough to catch a missed webhook.
export const syncDonorboxDonations = async () => {
  const seenAny = await donationModel.exists({ source: "donorbox" });
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const params = seenAny ? { date_from: since.toISOString().slice(0, 10) } : {};

  let recorded = 0;
  for (let page = 1; ; page++) {
    const gifts = await fetchDonations({ ...params, page });
    for (const gift of gifts) {
      if (await recordGift(gift)) recorded++;
    }
    if (gifts.length < 100) break;
  }
  return recorded;
};

const secretMatches = (given) => {
  if (!DONORBOX_WEBHOOK_SECRET || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(DONORBOX_WEBHOOK_SECRET);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Donorbox calls this on every new or updated donation. The body isn't
// trusted: we only take the id from it and read the gift back from the API.
export const handleDonorboxWebhook = async (req, res) => {
  if (!secretMatches(req.query.secret)) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }
  if (!donorboxConfigured()) {
    return res
      .status(503)
      .json({ success: false, message: "Donorbox is not configured." });
  }

  // Donorbox's event envelope isn't documented, so look for the donation in
  // the likely places; when it can't be found, sync recent gifts instead.
  const body = Array.isArray(req.body) ? req.body[0] : req.body;
  const id = (body?.data || body?.donation || body)?.id;

  try {
    const [gift] = id ? await fetchDonations({ id }) : [];
    if (gift && String(gift.id) === String(id)) {
      await recordGift(gift);
    } else {
      await syncDonorboxDonations();
    }
  } catch (error) {
    console.error(
      "Error processing Donorbox webhook:",
      error.response ? error.response.data : error.message
    );
    // Non-2xx so Donorbox retries; the cron sweep is the backstop either way.
    return res
      .status(500)
      .json({ success: false, message: "Server error processing webhook." });
  }

  res.status(200).json({ success: true, message: "Webhook acknowledged." });
};
