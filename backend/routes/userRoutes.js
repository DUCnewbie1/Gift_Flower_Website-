import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
// Thư viện nodemailer để gửi email
// Cấu hình nodemailer để gửi email
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("👉 Nhận dữ liệu đăng ký:", { name, email });
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      console.log("⚠️ Email đã tồn tại:", email);
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("✅ Mã xác nhận được tạo:", verificationCode);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      verificationCode,
      isVerified: false,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã xác nhận tài khoản của bạn",
      html: `
        <h2>Xác nhận tài khoản</h2>
        <p>Xin chào ${name},</p>
        <p>Mã xác nhận của bạn là:</p>
        <h3 style="color: #ec4899;">${verificationCode}</h3>
        <p>Vui lòng nhập mã này để xác nhận tài khoản. Mã có hiệu lực trong 10 phút.</p>
        <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
      `,
    };

    console.log("📧 Đang gửi email đến:", email);
    console.log("🔐 Email user:", process.env.EMAIL_USER);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Lỗi gửi email:", error);
      } else {
        console.log("✅ Email đã được gửi:", info.response);
      }
    });

    res.status(201).json({
      message: "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác nhận.",
      user: { name: newUser.name, email: newUser.email, isVerified: newUser.isVerified },
    });
  } catch (err) {
    console.error("🔥 Lỗi trong endpoint /register:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// Xác minh mã
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    console.log("📥 Nhận verify:", { email, code });
    const user = await User.findOne({ email, verificationCode: code });
    if (!user) {
      return res.status(400).json({ message: "Mã xác nhận không hợp lệ" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.status(200).json({ message: "Xác nhận tài khoản thành công! Bạn có thể đăng nhập." });
  } catch (err) {
    res.status(500).json({ message: "Xác nhận thất bại", error: err.message });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Không tìm thấy người dùng" });

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Tài khoản chưa được xác minh. Vui lòng nhập mã xác nhận từ email.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    res.status(200).json({
      message: "Đăng nhập thành công",
      user: { name: user.name, email: user.email, isVerified: user.isVerified },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

export default router;