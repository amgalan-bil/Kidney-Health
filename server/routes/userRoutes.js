import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  getUserData,
  getAllUsers,
  getUserById,
  updateUserGoal,
  updateUserDescription,
  getUserDonors,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", getUserData);
userRouter.patch("/goal", updateUserGoal);
userRouter.patch("/description", updateUserDescription);
userRouter.get("/all", getAllUsers);
userRouter.get("/:id", getUserById);
userRouter.get("/userDonors/:id", getUserDonors);

export default userRouter;
