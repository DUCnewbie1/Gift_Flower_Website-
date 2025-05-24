import express from 'express';
import { calculateShippingFee } from '../controllers/shippingController.js';

const router = express.Router();

router.post('/calculate', calculateShippingFee);

export default router;