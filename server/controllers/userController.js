import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import donationModel from "../models/donationModel.js";

export const getUserData = async (req, res) => {
  console.log(req.cookies);

  try {
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Calculate the total amount raised from successful donations

    const raisedAmount = user.totalDonatedAmount || 0;
    res.json({
      success: true,
      userData: {
        userId: user.id,
        name: user.name,
        goal: user.goal,
        raisedAmount: raisedAmount,
      },
    });
  } catch (error) {
    console.log(error);

    res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
};

export const updateUserGoal = async (req, res) => {
  try {
    // Authenticate the user from the token in cookies
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get and validate the goal from the request body
    const { goal } = req.body;
    if (goal === undefined || typeof goal !== "number" || goal < 0) {
      return res.status(400).json({
        success: false,
        message: "A valid, non-negative goal is required.",
      });
    }

    // Find the user and update their goal
    const updatedUser = await userModel
      .findByIdAndUpdate(userId, { goal }, { new: true })
      .select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.json({
      success: true,
      message: "Goal updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select(
        "-password -__v -resetOtp -resetOtpExpireAt -verifyOtp -verifyOtpExpireAt"
      );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserDonors = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const { id: userId } = req.params; // Get user ID from URL parameter

    console.log(req.params.id);
    

    const donations = await donationModel
      .find({ userId: userId, status:"paid" }) // Find donations for the specified user
      .select("name message amount createdAt") // Select only relevant donation fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalDonations = await donationModel.countDocuments({
      userId: req.params.id,
      status: "paid"
    });

    // The 'donations' array already contains the donor's name and message.
    // We can send it directly.
    res.json({
      success: true,
      donors: donations, // Each object in this array is a donation with donor's name
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalDonations / limit),
        totalItems: totalDonations,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await userModel
      .find(query)
      .select(
        "-password -__v -resetOtp -resetOtpExpireAt -verifyOtp -verifyOtpExpireAt"
      )
      .sort({ totalDonatedAmount: -1, _id: 1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await userModel.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
