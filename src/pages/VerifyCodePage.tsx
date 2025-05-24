import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyCode } from "../lib/api";

const VerifyCodePage = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await verifyCode(email, code);
      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      if (err instanceof Error && (err as any).response?.data?.message) {
        setError((err as any).response.data.message);
      } else {
        setError("Xác nhận thất bại");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Nhập mã xác nhận</h2>
        <p className="text-center mb-4">
          Một mã xác nhận đã được gửi đến <strong>{email}</strong>. Vui lòng kiểm tra email (bao gồm thư mục Spam).
        </p>
        <form onSubmit={handleVerify}>
          <div className="mb-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Nhập mã xác nhận"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              maxLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600"
          >
            Xác nhận
          </button>
        </form>
        {message && <p className="text-green-500 mt-4 text-center">{message}</p>}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default VerifyCodePage;