import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { getAllUsers } from "../controllers/userController.js";

dotenv.config();

const router = express.Router();
router.get("/", getAllUsers); 
// Cấu hình gửi email
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📌 Đăng ký tài khoản
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Dữ liệu nhận được từ request register:", { name, email, password });

    if (!name || !email || !password) {
      console.log("Lỗi: Thiếu thông tin đăng ký");
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      console.log("Lỗi: Email đã tồn tại:", email);
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      isVerified: false,
      role: "customer", // Mặc định là customer
    });
    console.log("Người dùng mới được tạo:", newUser);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã xác nhận tài khoản",
      html: `
        <h2>Xác nhận tài khoản</h2>
        <p>Xin chào ${name},</p>
        <p>Mã xác nhận của bạn là:</p>
        <h3 style="color: #ec4899;">${verificationCode}</h3>
        <p>Vui lòng nhập mã này để xác nhận tài khoản. Mã có hiệu lực trong 10 phút.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Lỗi gửi email:", error);
      } else {
        console.log("✅ Email đã được gửi:", info.response);
      }
    });

    res.status(201).json({
      message: "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác nhận.",
      user: {
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified,
        role: newUser.role,
      },
    });
    console.log("Response gửi đi:", res.statusCode, res.statusMessage, {
      message: "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác nhận.",
      user: {
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("🔥 Lỗi đăng ký:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// 📌 Xác minh tài khoản
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    console.log("Dữ liệu nhận được từ request verify-code:", { email, code });

    const user = await User.findOne({ email, verificationCode: code });
    if (!user) {
      console.log("Lỗi: Không tìm thấy user với email và mã xác nhận:", { email, code });
      return res.status(400).json({ message: "Mã xác nhận không hợp lệ" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();
    console.log("User sau khi xác minh:", user);

    res.status(200).json({ message: "Xác nhận tài khoản thành công!" });
    console.log("Response gửi đi:", res.statusCode, res.statusMessage, { message: "Xác nhận tài khoản thành công!" });
  } catch (err) {
    console.error("🔥 Lỗi xác minh:", err);
    res.status(500).json({ message: "Lỗi xác minh", error: err.message });
  }
});

// 📌 Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Dữ liệu nhận được từ request login:", { email, password });

    if (!email || !password) {
      console.log("Lỗi: Thiếu email hoặc mật khẩu");
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("Lỗi: Không tìm thấy người dùng với email:", email);
      return res.status(400).json({ message: "Không tìm thấy người dùng" });
    }
    console.log("User từ DB:", user);

    if (!user.isVerified) {
      console.log("Lỗi: Tài khoản chưa được xác minh:", email);
      return res.status(403).json({ message: "Tài khoản chưa được xác minh" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Lỗi: Sai mật khẩu cho email:", email);
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      console.error("❌ JWT_SECRET không được thiết lập trong .env");
      return res.status(500).json({ message: "Lỗi server: Thiếu JWT_SECRET" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role || "customer" }, // Đảm bảo role luôn có
      secretKey,
      { expiresIn: "1h" }
    );
    console.log("Token được tạo:", token);

    const responseData = {
      message: "Đăng nhập thành công",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role || "customer", // Đảm bảo role có giá trị
      },
      token,
    };
    res.status(200).json(responseData);
    console.log("Response gửi đi:", res.statusCode, res.statusMessage, responseData);
  } catch (err) {
    console.error("🔥 Lỗi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

export default router;