import express from "express";
import {
  qpayPaid,
  createQpayInvoice,
  checkQpayPayment,
  checkAllQpayPayments,
} from "../controllers/donationController.js";

const donationRouter = express.Router();

// Route for the frontend to create a QPay invoice
donationRouter.post("/create-invoice", createQpayInvoice);

// New route to manually check a payment's status
donationRouter.post("/check-payment/:invoiceId", checkQpayPayment);
router.get("/check-all-payments", checkAllQpayPayments); // New route for checking all payments

// Callback route that QPay redirects to after payment
donationRouter.get("/qpay", qpayPaid);

export default donationRouter;
