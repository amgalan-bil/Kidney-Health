import express from "express";
import {
  requireAdmin,
  adminPage,
  listFundraisers,
  listDonations,
  assignDonation,
  checkTotals,
  fixTotal,
  syncDonorboxNow,
  addOfflineGift,
  removeOfflineGift,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// Express 5 passes errors from async handlers on to the error handler for us.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// The page is public; everything it loads needs the admin key.
adminRouter.get("/", adminPage);

adminRouter.use(requireAdmin);
adminRouter.get("/fundraisers", wrap(listFundraisers));
adminRouter.get("/donations", wrap(listDonations));
adminRouter.post("/donations/:id/assign", wrap(assignDonation));
adminRouter.get("/totals", wrap(checkTotals));
adminRouter.post("/totals/fix", wrap(fixTotal));
adminRouter.post("/sync-donorbox", wrap(syncDonorboxNow));
adminRouter.post("/offline", wrap(addOfflineGift));
adminRouter.delete("/offline/:id", wrap(removeOfflineGift));

// Keep admin errors as JSON for the page.
adminRouter.use((error, req, res, next) => {
  console.error("Admin error:", error);
  res.status(500).json({ success: false, message: "Server error." });
});

export default adminRouter;
