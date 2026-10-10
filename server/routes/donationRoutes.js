import express from "express";
import {
  qpayPaid,
  createQpayInvoice,
  checkQpayPayment,
  checkAllQpayPayments,
  handleQpayWebhook,
} from "../controllers/donationController.js";
import { handleDonorboxWebhook } from "../controllers/donorboxController.js";

const donationRouter = express.Router();

// Route for the frontend to create a QPay invoice
donationRouter.post("/create-invoice", createQpayInvoice);

// New route to manually check a payment's status
donationRouter.post("/check-payment/:invoiceId", checkQpayPayment);
donationRouter.get("/check-all-payments", checkAllQpayPayments); // New route for checking all payments

// Callback route that QPay redirects to after payment
donationRouter.get("/qpay", qpayPaid);

// Server-to-server webhook from QPay (fires even if the donor closed the tab)
donationRouter.post("/qpay", handleQpayWebhook);

// Webhook from Donorbox for international card gifts
donationRouter.post("/donorbox", handleDonorboxWebhook);

export default donationRouter;