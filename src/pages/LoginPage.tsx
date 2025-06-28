import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      setTimeout(() => {
        navigate("/");
      }, 1000); // Chuyển hướng sau 1 giây để người dùng thấy thông báo
    } catch (err) {
      // Lỗi đã được xử lý trong AuthContext bằng toast, không cần setError ở đây
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-50">
      <div className="w-full bg-gray-100 flex items-center px-6 py-3 border-b">
        <nav className="flex items-center gap-2 text-sm">
          <a href="/" className="flex items-center gap-1 text-gray-700 hover:text-pink-500 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4" />
            </svg>
            <span className="font-semibold">Trang chủ</span>
          </a>
          <span className="text-gray-400">›</span>
          <span className="text-pink-600 font-medium">Đăng nhập tài khoản</span>
        </nav>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow p-8 mt-6">
        <h2 className="text-2xl font-bold mb-2 text-center">ĐĂNG NHẬP</h2>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Nếu bạn chưa có tài khoản,{" "}
          <a href="/register" className="text-pink-500 hover:underline">
            đăng ký tại đây
          </a>
        </p>

        {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            aria-label="Nhập địa chỉ email"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
            required
            aria-label="Nhập mật khẩu"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-pink-500 text-white rounded px-4 py-2 font-semibold hover:bg-pink-600 transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <a href="/forgot-password" className="text-xs text-pink-500 mt-3 hover:underline block text-center">
          Quên mật khẩu
        </a>

        <div className="my-3 text-xs text-gray-400 text-center">Hoặc đăng nhập bằng</div>
        <div className="flex gap-2 w-full">
          <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded px-3 py-2 text-sm hover:bg-blue-700 transition-colors">
            Facebook
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white rounded px-3 py-2 text-sm hover:bg-red-600 transition-colors">
            Google
          </button>
        </div>
      </div>
    </div>
  );
}