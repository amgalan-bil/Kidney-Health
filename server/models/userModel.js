import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
    },
    donations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Donation",
      },
    ],

    // The total amount this user has donated
    totalDonatedAmount: {
      type: Number,
      default: 0,
    },

    goal: {
      type: Number,
      default: 1800000,
    },

    // What the fundraiser is raising money for, shown on their public page
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    verifyOtp: {
      type: String,
      default: "",
    },
    verifyOtpExpireAt: {
      type: Number,
      default: 0,
    },

    resetOtp: {
      type: String,
      default: "",
    },
    resetOtpExpireAt: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model.user || mongoose.model("User", userSchema);

export default userModel;
