import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import { processPendingQpayPayments } from "./controllers/donationController.js";

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import paymentRouter from "./routes/donationRoutes.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin like Postman or curl
      if (!origin) return callback(null, true);

      return callback(null, true);
    },
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.send("API Working");
});

cron.schedule("0 */3 * * *", async () => {
  console.log("Running scheduled job: Checking pending QPay payments...");
  try {
    await processPendingQpayPayments();
    console.log("Scheduled job finished successfully.");
  } catch (error) {
    console.error("Scheduled job failed:", error);
  }
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/donation", paymentRouter);

app.listen(port, () => {
  console.log("Server is listening on port " + port);
});
