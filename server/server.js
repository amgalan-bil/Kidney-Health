import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import { processPendingQpayPayments } from "./controllers/donationController.js";
import {
  donorboxConfigured,
  syncDonorboxDonations,
} from "./controllers/donorboxController.js";

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
const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("\nFailed to connect to MongoDB:", error.message);
    console.error(
      "Check MONGODB_URI in server/.env, and that this machine's IP is on the\n" +
        "Atlas cluster's Network Access list.\n"
    );
    process.exit(1);
  }

  app.listen(port, () => {
    console.log("Server is listening on port " + port);
  });
};

// CLIENT_URL is a comma-separated list; localhost and 127.0.0.1 are different
// origins to the browser, so both spellings have to be present.
const allowedOrigins = [
  ...(process.env.CLIENT_URL || "")
    .split(",")
    // Browsers send Origin without a trailing slash, so "https://site.app/" would never match.
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean),
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Outside production, accept any localhost port: `next dev` moves to 3001
      // (and upward) whenever 3000 is already taken.
      if (
        process.env.NODE_ENV !== "production" &&
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }

      // Check if the origin is in the allowed list
      if (allowedOrigins.indexOf(origin) === -1) {
        console.warn(`CORS: blocked origin ${origin}`);
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow cookies to be sent
  })
);
app.get("/", (req, res) => {
  res.send("API Working");
});

// Catches payments the browser never confirmed (donor closed the tab, or the
// QPay callback never landed). Polling handles the happy path; this is backstop.
cron.schedule("*/5 * * * *", async () => {
  try {
    const { updates, errors } = await processPendingQpayPayments();
    if (updates.length || errors.length) {
      console.log(
        `Payment sweep: ${updates.length} settled, ${errors.length} errored.`
      );
    }
  } catch (error) {
    console.error("Payment sweep failed:", error.message);
  }
});

// Same backstop for Donorbox: picks up gifts whose webhook never arrived, and
// on its first run backfills everything given before the webhook existed.
if (donorboxConfigured()) {
  cron.schedule("*/10 * * * *", async () => {
    try {
      const recorded = await syncDonorboxDonations();
      if (recorded) console.log(`Donorbox sweep: ${recorded} gifts recorded.`);
    } catch (error) {
      console.error(
        "Donorbox sweep failed:",
        error.response ? error.response.data : error.message
      );
    }
  });
} else {
  console.warn("DONORBOX_EMAIL / DONORBOX_API_KEY not set: Donorbox gifts won't be recorded.");
}

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/donation", paymentRouter);

startServer();
