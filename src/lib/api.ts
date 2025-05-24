import axios from "axios";

/**
 * Lấy URL API từ biến môi trường của Vite.
 *  - Khi chạy dev: lấy trong `.env` (hoặc .env.local) → thường là http://localhost:5000
 *  - Khi build prod: lấy trong `.env.production` → ví dụ http://52.77.32.101:8080
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",   // ✅ duy nhất dòng này thay đổi
  headers: { "Content-Type": "application/json" },
});

/* --------- API wrappers ---------- */

export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
}) => API.post("/users/register", data);

export const loginUser = (data: { email: string; password: string }) =>
  API.post("/users/login", data);

export const verifyCode = (email: string, code: string) =>
  API.post("/users/verify-code", { email, code });

export const getCategories = () => API.get("/categories");
