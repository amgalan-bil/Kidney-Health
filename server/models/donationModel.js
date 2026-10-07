import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    // The fundraiser this gift is credited to. Null for gifts made straight to
    // the campaign from the home page, which belong to no one student.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
    // QPay's internal invoice ID, received on creation
    qpayInvoiceId: {
      type: String,
    },
    // QPay's internal payment ID, received after payment check
    paymentId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

const Donation =
  mongoose.models.Donation || mongoose.model("Donation", donationSchema);

export default Donation;
