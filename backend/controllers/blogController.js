import Blog from '../models/Blog.js';

// Lấy tất cả bài viết
export async function getAllBlogs(req, res) {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    // Loại bỏ tất cả * trong content của từng blog
    const modifiedBlogs = blogs.map(blog => {
      blog.content = blog.content.replace(/\*/g, '');
      return blog;
    });
    res.status(200).json(modifiedBlogs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết', error });
  }
}

// Lấy bài viết theo ID
// Chỉ dành cho admin
// Loại bỏ tất cả * trong content của bài viết
export async function getBlogById(req, res) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
    // Loại bỏ tất cả * trong content
    blog.content = blog.content.replace(/\*/g, '');
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy bài viết', error });
  }
}

// Tạo bài viết mới (dành cho admin)
export async function createBlog(req, res) {
  try {
    const { title, content, image, author, category } = req.body;
    const newBlog = new Blog({ title, content, image, author, category });
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo bài viết', error });
  }
}