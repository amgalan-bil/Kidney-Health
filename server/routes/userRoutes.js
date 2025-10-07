import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  getUserData,
  getAllUsers,
  getUserById,
  updateUserGoal,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", getUserData);
userRouter.patch("/goal", updateUserGoal);
userRouter.get("/all", getAllUsers);
userRouter.get("/:id", getUserById);

export default userRouter;
