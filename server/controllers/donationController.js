import userModel from "../models/userModel.js";
import donationModel from "../models/donationModel.js";
import axios from "axios";

// --- QPay Configuration ---
// IMPORTANT: Store these in environment variables (.env file) for security
const QPAY_API_URL = "https://api.qpay.mn/v2"; // Use sandbox URL for testing
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
    await newDonation.save();

    const token = await getQpayToken();

    const invoicePayload = {
      invoice_code: INVOICE_CODE,
      sender_invoice_no: newDonation._id.toString(),
      invoice_receiver_code: newDonation.userId.toString(), // Can be any identifier
      invoice_description: `Donation for user ${userId}`,
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
