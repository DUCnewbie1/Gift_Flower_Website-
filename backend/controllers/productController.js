import Product from '../models/Product.js';

const BASE_URL = "http://localhost:5000";

// [GET] /api/products
export const getAllProducts = async (req, res) => {
  try {
    const { isHot, minDiscount, category } = req.query;
    
    let query = {};
    
    // Filter by isHot if provided
    if (isHot !== undefined) {
      query.isHot = isHot === 'true';
    }

    if (category) {
      query.category = category;
    }

    let products = await Product.find(query).sort({ createdAt: -1 });

    if (minDiscount) {
      const min = parseInt(minDiscount);
      products = products.filter(p => {
        const disc = parseInt((p.discount || "0").replace("%", ""));
        return disc >= min;
      });
    }

    // enrich lại
    const enriched = products.map(p => {
      const isNew = Date.now() - new Date(p.importedAt).getTime() <= 7 * 24 * 60 * 60 * 1000;
      return {
        ...p.toObject(),
        isNew,
        image: p.image ? (p.image.startsWith("http") ? p.image : `${BASE_URL}${p.image}`) : `${BASE_URL}/placeholder.png`,
        images: (p.images || []).map(img => img.startsWith("http") ? img : `${BASE_URL}${img}`)
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

    const image = product.image ? (product.image.startsWith("http") ? product.image : `${BASE_URL}${product.image}`) : `${BASE_URL}/placeholder.png`;
    const images = (product.images || []).map(img => img.startsWith("http") ? img : `${BASE_URL}${img}`);

    res.json({
      ...product.toObject(),
      image,
      images
    });
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
    
    const products = await Product.find({
      importedAt: { $gte: oneWeekAgo } 
    }).sort({ importedAt: -1 });

    const enriched = products.map(p => {
      const isNew = Date.now() - new Date(p.importedAt).getTime() <= 7 * 24 * 60 * 60 * 1000;
      return {
        ...p.toObject(),
        isNew, 
        image: p.image ? (p.image.startsWith("http") ? p.image : `${BASE_URL}${p.image}`) : `${BASE_URL}/placeholder.png`,
        images: (p.images || []).map(img => img.startsWith("http") ? img : `${BASE_URL}${img}`)
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy sản phẩm mới' });
  }
};


// [GET] /api/products/search
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Vui lòng cung cấp từ khóa tìm kiếm" });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Tìm theo tên, không phân biệt hoa thường
        { category: { $regex: query, $options: "i" } }, // Tìm theo danh mục
      ],
    })
      .limit(10) // Giới hạn 10 gợi ý
      .select("name category price image"); // Chỉ lấy các trường cần thiết

    const enriched = products.map((p) => {
      return {
        ...p.toObject(),
        image: p.image ? (p.image.startsWith("http") ? p.image : `${BASE_URL}${p.image}`) : `${BASE_URL}/placeholder.png`,
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi tìm kiếm sản phẩm", details: err.message });
  }
};