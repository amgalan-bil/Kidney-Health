import express from "express";
import {
  qpayPaid,
  createQpayInvoice,
  checkQpayPayment,
} from "../controllers/donationController.js";

const donationRouter = express.Router();

// Route for the frontend to create a QPay invoice
donationRouter.post("/create-invoice", createQpayInvoice);

// New route to manually check a payment's status
donationRouter.post("/check-payment/:invoiceId", checkQpayPayment);

// Callback route that QPay redirects to after payment
donationRouter.get("/qpay", qpayPaid);

export default donationRouter;
