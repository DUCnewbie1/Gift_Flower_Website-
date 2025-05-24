// routes/bannerRoutes.js
import express from 'express';
import { getAllBanners } from '../controllers/bannerController.js';

const router = express.Router();
router.get('/', getAllBanners);

export default router;
