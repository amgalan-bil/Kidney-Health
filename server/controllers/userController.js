import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      userData: { userId: userId, name: user.name, role: user.role },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const becomeInstructor = async (req, res) => {
  try {
    const userId = req.body.userId;

    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.role === "instructor") {
      return res
        .status(400)
        .json({ success: false, message: "User is already an instructor." });
    }

    // Update the user's role
    user.role = "instructor";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Congratulations! You are now an instructor.",
      user, // Send back the updated user data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
