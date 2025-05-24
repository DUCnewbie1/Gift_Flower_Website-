import express from 'express';
import { addReview, getReviews, getReviewSummary } from '../controllers/reviewController.js';
const router = express.Router();
router.post('/', addReview);
router.get('/product/:productId', getReviews); 
router.get('/summary/:productId', getReviewSummary);
export default router;