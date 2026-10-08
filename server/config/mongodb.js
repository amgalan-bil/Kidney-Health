import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on(`connected`, () => console.log("Connected to DB"));
  await mongoose.connect(`${process.env.MONGODB_URI}`);

  // Accounts made before fundraisers became opt-in all had a page already, so
  // they keep it. New accounts are saved with isFundraiser set, so this only
  // ever touches those older records.
  await mongoose.connection
    .collection("users")
    .updateMany({ isFundraiser: { $exists: false } }, { $set: { isFundraiser: true } });
};

export default connectDB;