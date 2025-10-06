import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    // Amount of the donation
    amount: {
      type: Number,
      required: [true, "Donation amount is required."],
      min: [1, "Donation amount must be at least 1."],
    },
    // Currency of the donation
    currency: {
      type: String,
      required: [true, "Currency is required."],
      default: "MNT", // Or 'USD', depending on your primary currency
    },
    // Reference to the user who donated (if they were logged in)
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // This assumes you have a 'User' model
      required: false, // Allows for donations from non-registered users
    },
    // Fields for guest/anonymous donors who are not logged in
    donorName: {
      type: String,
      required: [true, "donor name is required."],
      trim: true,
    },
    donorEmail: {
      type: String,
      required: [true, "donor email is required."],
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email"],
    },
    // Optional message from the donor
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot be more than 500 characters."],
    },
    // Flag to hide the donor's name on public-facing pages
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    // Unique ID from the payment processor (e.g., Stripe, PayPal)
    transactionId: {
      type: String,
      required: [true, "A transaction ID is required."],
      unique: true,
    },
    // Status of the payment transaction
    status: {
      type: String,
      enum: ["succeeded", "pending", "failed"],
      required: true,
    },
  },
  {
    // Adds createdAt and updatedAt timestamps
    timestamps: true,
  }
);

const Donation =
  mongoose.models.Donation || mongoose.model("Donation", donationSchema);

export default Donation;
