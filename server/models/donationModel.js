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
    // How it was paid: QPay from Mongolia, or a card on Donorbox from abroad.
    source: {
      type: String,
      enum: ["qpay", "donorbox"],
      default: "qpay",
    },
    // Donorbox's donation ID; unique so a gift seen twice is stored once.
    donorboxId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // What the donor actually paid on Donorbox (e.g. 50 USD). `amount` is
    // always that converted to tugriks.
    currency: {
      type: String,
    },
    originalAmount: {
      type: Number,
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
