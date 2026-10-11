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

    // Accounts are for giving by default; a fundraiser page is opt-in.
    isFundraiser: {
      type: Boolean,
      default: false,
    },

    goal: {
      type: Number,
      default: 2700000,
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

// Compares strings ignoring case (Latin and Cyrillic alike), so "Bat@Gmail.com"
// and "bat@gmail.com", or "Saraa" and "saraa", count as the same.
const caseInsensitive = { locale: "en", strength: 2 };

// Emails were stored as typed, so lookups ignore case rather than lowercasing
// the query, which would miss older accounts saved with capitals.
// Anything other than a string (missing field, or an object like {"$ne": null})
// matches no one instead of throwing or reaching the query.
userSchema.statics.findByEmail = async function (email) {
  if (typeof email !== "string") return null;
  return this.findOne({ email: email.trim() }).collation(caseInsensitive);
};

// True when another account already uses this name. `exceptId` lets someone
// keep (or re-case) their own name when renaming.
userSchema.statics.isNameTaken = async function (name, exceptId) {
  if (typeof name !== "string") return false;
  const query = { name: name.trim() };
  if (exceptId) query._id = { $ne: exceptId };
  return Boolean(await this.exists(query).collation(caseInsensitive));
};

const userModel = mongoose.model.user || mongoose.model("User", userSchema);

export default userModel;
