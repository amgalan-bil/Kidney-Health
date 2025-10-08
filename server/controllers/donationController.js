import userModel from "../models/userModel.js";
import donationModel from "../models/donationModel.js";
import axios from "axios";

// --- QPay Configuration ---
// IMPORTANT: Store these in environment variables (.env file) for security
const QPAY_API_URL = "https://merchant.qpay.mn/v2"; // Use sandbox URL for testing
const QPAY_USERNAME = process.env.QPAY_USERNAME;
const QPAY_PASSWORD = process.env.QPAY_PASSWORD;
const INVOICE_CODE = process.env.QPAY_INVOICE_CODE;

// --- Helper function to get QPay Auth Token ---
const getQpayToken = async () => {
  try {
    const response = await axios.post(`${QPAY_API_URL}/auth/token`, null, {
      auth: {
        username: QPAY_USERNAME,
        password: QPAY_PASSWORD,
      },
    });
    console.log("response", response.data);

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
    const { amount, userId, name, message } = req.body;

    if (!amount || !userId || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
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
      invoice_receiver_code: newDonation.userId.toString(),
      invoice_description: `Donation from ${name}`,
      amount: newDonation.amount,
      callback_url: `https://smile-for-mongolia.onrender.com/api/v1/donation/qpay?donationId=${newDonation._id.toString()}`,
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
      const donation = await donationModel.findById(donationId);

      if (donation && donation.status !== "paid") {
        donation.status = "paid";
        // You can store more details from the webhook body if needed
        // donation.paymentId = req.body.payment_id;
        await donation.save();

        console.log(`Donation ${donationId} successfully marked as PAID.`);

        // Optionally, increment a user's total raised amount here
        await userModel.findByIdAndUpdate(donation.userId, {
          $inc: { totalDonatedAmount: donation.amount },
        });
      } else if (donation && donation.status === "paid") {
        console.log(`Donation ${donationId} was already marked as PAID.`);
      } else if (!donation) {
        console.error(`Webhook for non-existent donation ID: ${donationId}`);
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

      if (donation && donation.status === "pending") {
        donation.status = "paid";
        donation.paymentId = data.rows[0].payment_id;
        await donation.save();

        await userModel.findByIdAndUpdate(donation.userId, {
          $inc: { totalDonatedAmount: donation.amount },
        });

        return res.json({
          success: true,
          status: "PAID",
          message: "Payment confirmed and updated.",
        });
      } else if (donation && donation.status === "paid") {
        return res.json({
          success: true,
          status: "PAID",
          message: "Payment was already confirmed.",
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

  if (!donationId) {
    return res.redirect("/payment/failed?reason=invalid_callback");
  }

  try {
    const token = await getQpayToken();
    const { data } = await axios.post(
      `${QPAY_API_URL}/payment/check`,
      {
        object_type: "INVOICE",
        object_id: donationId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const donation = await donationModel.findById(donationId);
    if (!donation) {
      return res.redirect("/payment/failed?reason=donation_not_found");
    }

    // Check if payment was successful and donation is still pending
    if (data.count > 0 && donation.status === "pending") {
      const paymentInfo = data.rows[0]; // Get the first successful payment
      if (paymentInfo.payment_status === "PAID") {
        donation.status = "paid";
        donation.paymentId = paymentInfo.payment_id; // Store QPay's payment ID
        await donation.save();

        await userModel.findByIdAndUpdate(donation.userId, {
          $inc: { totalDonatedAmount: donation.amount },
        });

        // Redirect to the user's profile page on success
        return res.redirect(`/profile/${donation.userId}?payment=success`);
      }
    } else if (donation.status === "paid") {
      // Already paid, just redirect
      return res.redirect(
        `/profile/${donation.userId}?payment=already_completed`
      );
    }

    // If payment was not successful, redirect to a failure page
    res.redirect(`/payment/failed?reason=payment_not_verified`);
  } catch (error) {
    console.error(
      "Error verifying QPay payment:",
      error.response ? error.response.data : error.message
    );
    res.redirect("/payment/failed?reason=server_error");
  }
};
