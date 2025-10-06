import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  becomeInstructor,
  getUserData,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);
userRouter.put("/become-instructor", userAuth, becomeInstructor);

export default userRouter;
