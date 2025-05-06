import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  isVerified: boolean;
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  // Khởi tạo formData
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Đồng bộ formData với user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const userId = (user as any)?._id || (user as any)?.id;

  if (!user || !userId) {
    return <div>Vui lòng đăng nhập để xem thông tin cá nhân.</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Cập nhật thất bại");
      }

      setMessage("Cập nhật thông tin thành công!");
      setIsEditing(false); // Tắt chế độ chỉnh sửa sau khi lưu
    } catch (error: any) {
      setError(error.message || "Lỗi không xác định");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/users/${userId}/change-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đổi mật khẩu thất bại");
      }

      setMessage(data.message || "Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setError(error.message || "Lỗi không xác định");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-4">Thông tin cá nhân</h2>
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Họ tên"
          className="w-full p-2 border rounded"
          readOnly={!isEditing} // Chỉ đọc khi không ở chế độ chỉnh sửa
          style={{ backgroundColor: !isEditing ? "#f5f5f5" : "white" }} // Mờ khi chỉ đọc
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email"
          className="w-full p-2 border rounded"
          readOnly={!isEditing}
          style={{ backgroundColor: !isEditing ? "#f5f5f5" : "white" }}
        />
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Lưu thay đổi
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
            >
              Hủy
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Chỉnh sửa
          </button>
        )}
      </form>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Đổi mật khẩu</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input
            type="password"
            placeholder="Mật khẩu cũ"
            className="w-full p-2 border rounded"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu mới"
            className="w-full p-2 border rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            className="w-full p-2 border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Cập nhật mật khẩu
          </button>
        </form>
      </div>

      {message && (
        <p className="text-center text-sm text-green-600 mt-4">{message}</p>
      )}
      {error && (
        <p className="text-center text-sm text-red-600 mt-4">{error}</p>
      )}

      <div className="mt-6 text-sm text-gray-500">
        <p>
          <strong>Đã xác minh:</strong> {user.isVerified ? "Có" : "Chưa"}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
