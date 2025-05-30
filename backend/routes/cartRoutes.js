import express from 'express';
import { addToCart, getCartByUserId, removeFromCart } from '../controllers/cartController.js';


const router = express.Router();

router.post('/add', addToCart);
router.get('/:userId', getCartByUserId); // ✅ Thêm dòng này
router.delete('/:userId/:productId', removeFromCart); 

export default router;
