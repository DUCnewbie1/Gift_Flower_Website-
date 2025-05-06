import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Đăng nhập người dùng
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email và mật khẩu không hợp lệ' });
  }

  try {
    // Kiểm tra email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra xác minh tài khoản
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Tài khoản chưa được xác minh' });
    }

    // Trả về thông tin người dùng
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error('Lỗi khi đăng nhập:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};