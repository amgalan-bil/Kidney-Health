import express from "express";
import { qpayPaid } from "../controllers/donationController.js";

const donationRouter = express.Router();

donationRouter.get("/qpay", qpayPaid);

export default donationRouter;
