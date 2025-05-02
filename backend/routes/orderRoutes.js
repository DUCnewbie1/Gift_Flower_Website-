import express from "express";
import { getOrdersByEmail } from "../controllers/orderController.js";

const router = express.Router();

router.get("/by-email", getOrdersByEmail); // 👈 route mới

export default router;
