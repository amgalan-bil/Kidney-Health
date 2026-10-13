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

    // Short code that never changes (e.g. HB-007). Donors pick it on the
    // Donorbox form, so renaming a student doesn't break crediting.
    donorCode: {
      type: String,
      unique: true,
      sparse: true,
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

// Gives every fundraiser without one the next code (HB-001, HB-002, ...), oldest
// first. Safe to call often; if two calls race, the unique index stops a
// duplicate and the skipped student gets a code on the next call.
userSchema.statics.ensureDonorCodes = async function () {
  const missing = await this.find(
    { isFundraiser: true, donorCode: { $exists: false } },
    { _id: 1 }
  )
    .sort({ createdAt: 1, _id: 1 })
    .lean();
  if (!missing.length) return 0;

  const existing = await this.find({ donorCode: { $exists: true } }, { donorCode: 1 }).lean();
  let next =
    existing.reduce((max, u) => {
      const n = parseInt(String(u.donorCode).replace(/\D/g, ""), 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0) + 1;

  let assigned = 0;
  for (const { _id } of missing) {
    const code = `HB-${String(next).padStart(3, "0")}`;
    try {
      const res = await this.updateOne(
        { _id, donorCode: { $exists: false } },
        { $set: { donorCode: code } }
      );
      if (res.modifiedCount) {
        assigned++;
        next++;
      }
    } catch (error) {
      if (error.code !== 11000) throw error;
      return assigned; // another call took this code; try again next time
    }
  }
  return assigned;
};

const userModel = mongoose.model.user || mongoose.model("User", userSchema);

export default userModel;
