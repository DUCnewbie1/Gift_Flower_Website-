// backend/routes/productRoutes.js
import express from "express";
import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getNewProducts,
  searchProducts, 
} from "../controllers/productController.js";

// import { verifyToken } from "../middlewares/authMiddleware.js"; // Nếu cần xác thực
const router = express.Router();

router.get("/", getAllProducts);
router.post("/", createProduct);
router.get("/new", getNewProducts);
router.get("/search", searchProducts); 
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;