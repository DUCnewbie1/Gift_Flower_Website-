import express from 'express';
import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getNewProducts,
  searchProducts, 
  getProductsByRegion,
  updateProductStock
} from '../controllers/productController.js';

const router = express.Router();

router.get("/", getAllProducts);
router.post("/", createProduct);
router.get("/new", getNewProducts);
router.get("/search", searchProducts); 
router.get('/by-region', getProductsByRegion);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post('/stock', updateProductStock);

export default router;