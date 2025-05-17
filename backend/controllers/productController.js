import Product from '../models/Product.js';
import Store from '../models/Store.js';
import RegionalPrice from '../models/RegionalPrice.js';

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
        const rawDiscount = typeof p.discount === 'string' ? p.discount : "0%";
        const disc = parseInt(rawDiscount.replace("%", ""));
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


// Lấy danh sách sản phẩm theo khu vực
export const getProductsByRegion = async (req, res) => {
  try {
    const { district, storeId } = req.query;
    const decodedDistrict = district ? decodeURIComponent(district) : null;

    if (!district && !storeId) {
      return res.status(400).json({ error: 'Cần cung cấp district hoặc storeId' });
    }
    
    // Tìm các cửa hàng trong khu vực
    let storeIds = [];
    if (storeId) {
      storeIds = [storeId];
    } else if (district) {
      const stores = await Store.find({ district: decodedDistrict, isActive: true });

      storeIds = stores.map(store => store._id);
    }
    
    if (storeIds.length === 0) {
      return res.json([]);
    }
    
    // Tìm các sản phẩm có tồn kho ở ít nhất 1 cửa hàng trong khu vực
    const products = await Product.find({
      'stockByStore': {
        $elemMatch: {
          'storeId': { $in: storeIds },
          'quantity': { $gt: 0 }
        }
      }
    });
    
    // Lấy giá theo khu vực
    // Lấy giá thêm của toàn bộ quận (một giá cho tất cả sản phẩm trong quận)
    const regionalPrice = district 
      ? await RegionalPrice.findOne({ district }) 
      : null;
    const additionalPrice = regionalPrice?.additionalPrice || 0;  

    
    // Làm giàu dữ liệu sản phẩm
    const enrichedProducts = products.map(product => {
    const productObj = product.toObject();

    const basePrice = productObj.price;
    const finalPrice = basePrice + additionalPrice;

    const regionalStock = productObj.stockByStore
      .filter(s => storeIds.includes(s.storeId.toString()))
      .reduce((total, s) => total + s.quantity, 0);

    const image = productObj.image?.startsWith("http") ? 
      productObj.image : 
      `${BASE_URL}${productObj.image}`;

    return {
      ...productObj,
      price: finalPrice,
      basePrice,
      additionalPrice,
      regionalStock,
      image
    };
  });

    
    res.json(enrichedProducts);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách sản phẩm', details: err.message });
  }
};

// Cập nhật tồn kho theo cửa hàng
export const updateProductStock = async (req, res) => {
  try {
    const { productId, storeId, quantity } = req.body;
    
    if (!productId || !storeId || quantity === undefined) {
      return res.status(400).json({ error: 'Thiếu thông tin cần thiết' });
    }
    
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    
    // Tìm và cập nhật tồn kho cho cửa hàng cụ thể
    const storeStockIndex = product.stockByStore.findIndex(
      s => s.storeId.toString() === storeId
    );
    
    if (storeStockIndex >= 0) {
      // Cập nhật nếu đã tồn tại
      product.stockByStore[storeStockIndex].quantity = quantity;
    } else {
      // Thêm mới nếu chưa có
      product.stockByStore.push({ storeId, quantity });
    }
    
    // Cập nhật tổng tồn kho
    product.stock = product.stockByStore.reduce((total, s) => total + s.quantity, 0);
    
    await product.save();
    res.json({ message: 'Cập nhật tồn kho thành công', product });
  } catch (err) {
    res.status(500).json({ error: 'Không thể cập nhật tồn kho', details: err.message });
  }
};

