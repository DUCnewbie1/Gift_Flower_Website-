import React, { useState, useEffect } from "react";
import { registerUser } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.firstName || !formData.lastName) {
      setError("Họ và tên không được để trống");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ");
      return false;
    }
    if (formData.phone && !/^\d{10,11}$/.test(formData.phone)) {
      setError("Số điện thoại không hợp lệ (10-11 chữ số)");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const payload = {
        name: fullName,
        email: formData.email,
        password: formData.password,
      };

      const res = await registerUser(payload);
      setShowSuccessToast(true);
      setMessage(res.data.message || "Đăng ký thành công!");

      setTimeout(() => {
        navigate("/verify-code", { state: { email: formData.email } });
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-50">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-700 text-white rounded-lg shadow-lg px-4 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-semibold">Đăng ký thành công!</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-lg shadow p-8 mt-6">
        <h2 className="text-2xl font-bold mb-2 text-center">ĐĂNG KÝ</h2>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-pink-500 hover:underline">
            Đăng nhập tại đây
          </a>
        </p>

        {message && !showSuccessToast && (
          <p className="text-green-600 text-sm mb-2 text-center">{message}</p>
        )}
        {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            name="firstName"
            type="text"
            placeholder="Họ"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <input
            name="lastName"
            type="text"
            placeholder="Tên"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <input
            name="phone"
            type="tel"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-pink-500 text-white rounded px-4 py-2 font-semibold hover:bg-pink-600 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

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
