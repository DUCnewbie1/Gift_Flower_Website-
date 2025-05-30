import User from "../models/User.js";

// [GET] /api/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email role isVerified createdAt").sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tài khoản:", error);
    res.status(500).json({ error: "Không thể lấy danh sách tài khoản" });
  }
};
