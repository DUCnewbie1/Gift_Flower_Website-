import axios from "axios";

// Khởi tạo instance axios
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: tự động thêm Authorization nếu có token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Các API exports
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

// GỌN: Không cần truyền token nữa
export const getOrdersByEmail = (email: string) => API.get(`/orders/by-email?email=${email}`);
       