import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(formData.email, formData.password);
      console.log("Đăng nhập thành công, user:", user);
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError("Đăng nhập thất bại: " + (err instanceof Error ? err.message : "Lỗi không xác định"));
    }
  };

  // Hàm kiểm tra API thủ công
  const checkApi = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "vanhai11203@gmail.com", password: "HAI123456abc" }),
      });
      const data = await response.json();
      console.log("Response từ API:", data);
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  useEffect(() => {
    console.log("User sau khi cập nhật:", user);
    if (user) {
      console.log("User role sau đăng nhập:", user.role);
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        setError("Bạn không có quyền truy cập admin");
      }
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Đăng nhập Quản Trị
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mật khẩu"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded"
          >
            Đăng nhập
          </button>
        </form>
        <button
          onClick={checkApi}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mt-4"
        >
          Kiểm tra API
        </button>
      </div>
    </div>
  );
}