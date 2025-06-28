import Category from "../models/Category.js";

// Lấy toàn bộ danh sách category
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Thêm mới category (nếu muốn dùng POST)
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "Tên danh mục không được để trống" });

    const exist = await Category.findOne({ name });
    if (exist) return res.status(400).json({ message: "Danh mục đã tồn tại" });

    const newCategory = await Category.create({ name });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: "Thêm danh mục thất bại", error: error.message });
  }
};
