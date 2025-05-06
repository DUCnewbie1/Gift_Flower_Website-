import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // backend
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
}) => API.post("/users/register", data);

export const loginUser = (data: { email: string; password: string }) =>
  API.post("/users/login", data);

export const verifyCode = (email: string, code: string) =>
  API.post("/users/verify-code", { email, code });

export const getCategories = () =>
  API.get("/categories"); 