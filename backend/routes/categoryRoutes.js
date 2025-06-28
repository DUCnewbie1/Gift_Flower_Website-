
import express from "express";
import { getAllCategories } from "../controllers/categoryController.js";
// import { verifyToken } from "../middlewares/authMiddleware.js"; // Nếu cần xác thực
const router = express.Router();

router.get("/", getAllCategories);

export default router;
