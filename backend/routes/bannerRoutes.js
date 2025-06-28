// routes/bannerRoutes.js 0
import express from 'express';
import { getAllBanners } from '../controllers/bannerController.js';

const router = express.Router();
router.get('/', getAllBanners);

export default router;
