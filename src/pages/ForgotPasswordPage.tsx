import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        {
          email,
        }
      );
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8 mt-6">
        <h2 className="text-2xl font-bold mb-2 text-center">QUÊN MẬT KHẨU</h2>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Nhập địa chỉ email đã đăng ký để nhận mật khẩu mới.
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}
        {message && (
          <p className="text-green-500 text-sm text-center mb-3">{message}</p>
        )}

        {!message ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              name="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
            <button
              type="submit"
              disabled={loading}
              className={`bg-pink-500 text-white rounded px-4 py-2 font-semibold hover:bg-pink-600 transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </form>
        ) : (
          <button
            onClick={handleBackToLogin}
            className="bg-pink-500 text-white rounded px-4 py-2 font-semibold hover:bg-pink-600 transition-colors"
          >
            Quay lại trang đăng nhập
          </button>
        )}
      </div>
    </div>
  );
}
