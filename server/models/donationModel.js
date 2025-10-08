import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    // The user receiving the donation
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Donation amount is required."],
    },
    // Name of the person donating (can be 'Anonymous')
    name: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    // Status of the payment transaction
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    // QPay's internal transaction ID, received after payment check
    paymentId: {
      type: String,
      unique: true,
      sparse: true, // This is the fix. It allows multiple documents to have a null value.
    },
  },
  {
    timestamps: true,
  }
);

const Donation =
  mongoose.models.Donation || mongoose.model("Donation", donationSchema);

export default Donation;
