import express from "express";
import {
  qpayPaid,
  createQpayInvoice,
} from "../controllers/donationController.js";

const donationRouter = express.Router();

// Route for the frontend to create a QPay invoice
donationRouter.post("/create-invoice", createQpayInvoice);

// Callback route that QPay redirects to after payment
donationRouter.get("/qpay", qpayPaid);

export default donationRouter;
