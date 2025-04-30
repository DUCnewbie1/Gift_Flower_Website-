import Product from '../models/Product.js';

// [GET] /api/products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const enriched = products.map(p => {
      const isNew = Date.now() - new Date(p.importedAt).getTime() <= 7 * 24 * 60 * 60 * 1000;
      return {
        ...p.toObject(),
        isNew 
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách sản phẩm' });
  }
};


// [POST] /api/products
export const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ message: 'Tạo sản phẩm thành công', product: newProduct });
  } catch (err) {
    res.status(400).json({ error: 'Không thể tạo sản phẩm', details: err.message });
  }
};

// [GET] /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// [PUT] /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy sản phẩm để cập nhật' });
    res.json({ message: 'Cập nhật thành công', product: updated });
  } catch (err) {
    res.status(400).json({ error: 'Không thể cập nhật', details: err.message });
  }
};

// [DELETE] /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Không tìm thấy sản phẩm để xoá' });
    res.json({ message: 'Đã xoá sản phẩm' });
  } catch (err) {
    res.status(500).json({ error: 'Không thể xoá sản phẩm' });
  }
};

export const getNewProducts = async (req, res) => {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    console.log("🕒 Now:", now.toISOString());
    console.log("📅 Ngày giới hạn (7 ngày trước):", oneWeekAgo.toISOString());

    const products = await Product.find({
      importedAt: { $gte: oneWeekAgo } // đảm bảo dùng đúng field bạn có
    }).sort({ importedAt: -1 });

    console.log("📦 Sản phẩm tìm được:", products.length);
    products.forEach(p => {
      console.log(`👉 ${p.name}: importedAt = ${p.importedAt}`);
    });

    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi khi lấy sản phẩm mới:", err);
    res.status(500).json({ error: 'Không thể lấy sản phẩm mới' });
  }
};
