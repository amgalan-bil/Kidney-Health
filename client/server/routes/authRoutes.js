import express from "express";
import {
  isAuthenticated,
  login,
  logout,
  register,
  resetPassword,
  sendResetOtp,
  sendVerifyOtp,
  verifyEmail,
} from "../controllers/authcontroller.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

authRouter
  .post("/register", register)
  .post("/login", login)
  .post("/logout", logout)
  .post("/send-verify-otp", userAuth, sendVerifyOtp)
  .post("/verify-account", userAuth, verifyEmail)
  .get("/is-auth", userAuth, isAuthenticated)
  .post("/send-reset-otp", sendResetOtp)
  .post("/reset-password", resetPassword);

export default authRouter;
