import userModel from "../models/userModel.js";
import donationModel from "../models/donationModel.js";
import axios from "axios";
import jwt from "jsonwebtoken";

// Who is giving, from the session cookie. Null when nobody is signed in.
// Deliberately not the userAuth middleware: that writes its id onto
// req.body.userId, which on this route means the fundraiser being paid.
const donorIdFrom = (req) => {
  const { token } = req.cookies || {};
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET).id ?? null;
  } catch {
    return null;
  }
};

// --- QPay Configuration ---
const QPAY_API_URL = process.env.QPAY_API_URL || "https://merchant.qpay.mn/v2";
const QPAY_USERNAME = process.env.QPAY_USERNAME;
const QPAY_PASSWORD = process.env.QPAY_PASSWORD;
const INVOICE_CODE = process.env.QPAY_INVOICE_CODE;

// Where QPay sends the donor back to, and where we bounce them afterwards.
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 4000}`;
const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:3000").split(",")[0].trim();

// Marks a donation paid and credits the fundraiser, exactly once.
// The { status: "pending" } filter is the guard: whichever of the three
// confirmation paths (poll, callback, cron) arrives first wins the update,
// and the losers match nothing, so the amount is never counted twice.
const markDonationPaid = async (donationId, paymentId) => {
  const donation = await donationModel.findOneAndUpdate(
    { _id: donationId, status: "pending" },
    { $set: { status: "paid", paymentId } },
    { new: true }
  );

  if (!donation) return null;

  // Campaign gifts belong to no one student, so there is no total to credit.
  if (donation.userId) {
    await userModel.findByIdAndUpdate(donation.userId, {
      $inc: { totalDonatedAmount: donation.amount },
    });
  }

  return donation;
};

// --- Helper function to get QPay Auth Token ---
const getQpayToken = async () => {
  try {
    const response = await axios.post(`${QPAY_API_URL}/auth/token`, null, {
      auth: {
        username: QPAY_USERNAME,
        password: QPAY_PASSWORD,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error getting QPay token:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Could not authenticate with QPay.");
  }
};

// --- Controller to Create QPay Invoice ---
export const createQpayInvoice = async (req, res) => {
  try {
    // userId is the fundraiser being credited; it is absent when the gift goes
    // straight to the campaign from the home page.
    const { amount, userId, name, message } = req.body;

    if (!amount || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    // Anyone can donate without an account. If the donor is signed in, though,
    // giving to yourself would raise your total without raising any money.
    const donorId = donorIdFrom(req);
    if (userId && donorId && donorId === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot donate to your own fundraiser.",
      });
    }

    if (userId && !(await userModel.exists({ _id: userId, isFundraiser: true }))) {
      return res
        .status(404)
        .json({ success: false, message: "Fundraiser not found." });
    }

    if (!INVOICE_CODE) {
      console.error("QPAY_INVOICE_CODE is not set - cannot create invoices.");
      return res.status(500).json({
        success: false,
        message: "Payments are not configured on the server.",
      });
    }

    const newDonation = new donationModel({
      amount,
      userId,
      name,
      message,
      status: "pending",
    });

    // We save first to get an _id for the callback_url
    await newDonation.save();

    const token = await getQpayToken();

    const invoicePayload = {
      invoice_code: INVOICE_CODE,
      sender_invoice_no: newDonation._id.toString(),
      invoice_receiver_code: newDonation.userId
        ? newDonation.userId.toString()
        : "CAMPAIGN",
      invoice_description: `Donation from ${name}`,
      amount: newDonation.amount,
      callback_url: `${SERVER_URL}/api/v1/donation/qpay?donationId=${newDonation._id.toString()}`,
    };

    const { data } = await axios.post(
      `${QPAY_API_URL}/invoice`,
      invoicePayload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Save the QPay invoice_id to our donation document
    newDonation.qpayInvoiceId = data.invoice_id;
    await newDonation.save();

    res.status(200).json({ success: true, qpayData: data });
  } catch (error) {
    console.error(
      "Failed to create QPay invoice:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({ success: false, message: "Failed to create QPay invoice." });
  }
};

export const handleQpayWebhook = async (req, res) => {
  // QPay sends payment data in the request body for callbacks
  const { object_id, payment_status } = req.body;

  console.log("QPay Webhook Received:", req.body);

  // The object_id from the webhook corresponds to your sender_invoice_no (donation._id)
  const donationId = object_id;

  if (!donationId) {
    console.error("Webhook received without an object_id.");
    return res
      .status(400)
      .json({ success: false, message: "Missing donation ID." });
  }

  if (payment_status === "PAID") {
    try {
      const donation = await markDonationPaid(donationId, req.body.payment_id);

      if (donation) {
        console.log(`Donation ${donationId} successfully marked as PAID.`);
      } else {
        console.log(`Donation ${donationId} was already settled or not found.`);
      }
    } catch (error) {
      console.error(
        `Error processing webhook for donation ${donationId}:`,
        error
      );
      // Return a 500 error, QPay might try to send the webhook again
      return res
        .status(500)
        .json({ success: false, message: "Server error processing webhook." });
    }
  }

  // IMPORTANT: Always send a 200 OK response to acknowledge receipt of the webhook
  res.status(200).json({ success: true, message: "Webhook acknowledged." });
};

// --- New Controller to manually check payment status ---
export const checkQpayPayment = async (req, res) => {
  const { invoiceId } = req.params;

  try {
    const token = await getQpayToken();
    const { data } = await axios.post(
      `${QPAY_API_URL}/payment/check`,
      {
        object_type: "INVOICE",
        object_id: invoiceId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (data.count > 0 && data.rows[0].payment_status === "PAID") {
      const donation = await donationModel.findOne({
        qpayInvoiceId: invoiceId,
      });

      if (donation) {
        const settled = await markDonationPaid(
          donation._id,
          data.rows[0].payment_id
        );

        return res.json({
          success: true,
          status: "PAID",
          message: settled
            ? "Payment confirmed and updated."
            : "Payment was already confirmed.",
        });
      }
    }

    return res.json({
      success: true,
      status: "PENDING",
      message: "Payment not confirmed yet.",
    });
  } catch (error) {
    console.error(
      "Error checking QPay payment:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({ success: false, message: "Failed to check payment status." });
  }
};

// --- Controller to handle QPay callback and verify payment ---
export const qpayPaid = async (req, res) => {
  const { donationId } = req.query;
  console.log(`QPay callback received for donationId: ${donationId}`);

  // Redirects go to the frontend; this route lives on the API host.
  const fail = (reason) =>
    res.redirect(`${CLIENT_URL}/payment/failed?reason=${reason}`);

  // Where to send the donor afterwards: the fundraiser they gave to, or the
  // campaign itself when the gift was not tied to one.
  const done = (donation, outcome) =>
    res.redirect(
      donation.userId
        ? `${CLIENT_URL}/profile/${donation.userId}?payment=${outcome}`
        : `${CLIENT_URL}/?payment=${outcome}`
    );

  if (!donationId) {
    return fail("invalid_callback");
  }

  try {
    const donation = await donationModel.findById(donationId);
    if (!donation) {
      return fail("donation_not_found");
    }

    if (donation.status === "paid") {
      return done(donation, "already_completed");
    }

    if (!donation.qpayInvoiceId) {
      return fail("invoice_not_created");
    }

    const token = await getQpayToken();
    const { data } = await axios.post(
      `${QPAY_API_URL}/payment/check`,
      {
        object_type: "INVOICE",
        // QPay knows this invoice by its own id, not by our Mongo _id.
        object_id: donation.qpayInvoiceId,
        offset: {
          page_number: 1,
          page_limit: 100,
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const paid = (data.rows || []).find((r) => r.payment_status === "PAID");
    if (!paid) {
      return fail("payment_not_verified");
    }

    await markDonationPaid(donation._id, paid.payment_id);

    return done(donation, "success");
  } catch (error) {
    console.error(
      "Error verifying QPay payment:",
      error.response ? error.response.data : error.message
    );
    return fail("server_error");
  }
};

export const processPendingQpayPayments = async () => {
  // Find all donations that are still pending and have a QPay invoice ID
  const pendingDonations = await donationModel.find({
    status: "pending",
    qpayInvoiceId: { $ne: null }, // Ensure we only get donations with an invoice ID
  });

  if (pendingDonations.length === 0) {
    console.log("No pending donations to check.");
    return { updates: [], errors: [] };
  }

  const token = await getQpayToken();
  const paymentStatusUpdates = [];
  const processingErrors = [];

  for (const donation of pendingDonations) {
    try {
      const { data } = await axios.post(
        `${QPAY_API_URL}/payment/check`,
        {
          object_type: "INVOICE",
          object_id: donation.qpayInvoiceId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.count > 0 && data.rows[0].payment_status === "PAID") {
        const settled = await markDonationPaid(
          donation._id,
          data.rows[0].payment_id
        );

        if (settled) {
          paymentStatusUpdates.push({
            donationId: donation._id,
            status: "UPDATED_TO_PAID",
          });
        }
      }
    } catch (err) {
      const errorMessage = err.response ? err.response.data : err.message;
      console.error(
        `Failed to check donation ${donation._id} (Invoice: ${donation.qpayInvoiceId}):`,
        errorMessage
      );
      processingErrors.push({
        donationId: donation._id,
        invoiceId: donation.qpayInvoiceId,
        error: errorMessage,
      });
    }
  }
  return { updates: paymentStatusUpdates, errors: processingErrors };
};

// Update the existing controller to use the new function
export const checkAllQpayPayments = async (req, res) => {
  try {
    const { updates, errors } = await processPendingQpayPayments();
    res.json({
      success: true,
      message: "Completed checking all pending donations.",
      updates,
      errors,
    });
  } catch (error) {
    console.error(
      "A critical error occurred in checkAllQpayPayments:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({ success: false, message: "Failed to check payment statuses." });
  }
};