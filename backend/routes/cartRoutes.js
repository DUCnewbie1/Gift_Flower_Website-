import express from 'express';
import { addToCart, getCartByUserId, removeFromCart, updateCartItemQuantity, syncCart, clearCart } from '../controllers/cartController.js';

const router = express.Router();

router.post('/add', addToCart);
router.get('/:userId', getCartByUserId); 
router.delete('/:userId/:productId', removeFromCart); 
router.put('/update', updateCartItemQuantity); // Thêm route này
router.post('/sync', syncCart); // Thêm route này
router.delete('/:userId', clearCart); // Thêm route này

export default router;
