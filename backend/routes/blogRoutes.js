// routes/blogRoutes.js
import express from 'express';
import {
  getAllBlogs,
  getBlogById,
  createBlog
} from '../controllers/blogController.js';

const router = express.Router();

// Lấy tất cả bài viết.
router.get('/', getAllBlogs);

// Lấy bài viết theo ID
router.get('/:id', getBlogById);

// Tạo bài viết mới
router.post('/', createBlog);

export default router;
