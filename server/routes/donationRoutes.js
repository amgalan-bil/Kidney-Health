import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getUserData } from "../controllers/userController.js";

const donationRouter = express.Router();

donationRouter.get("/data", userAuth, getUserData);

export default donationRouter;
