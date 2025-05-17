import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const addToCart = async (req, res) => {
  const { userId, productId, name, price, image, quantity } = req.body;

  if (!userId || !productId || !name || !price || !image || quantity < 1) {
    console.log('Request body:', req.body);

    return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ error: 'Sản phẩm không tồn tại' });
    }

    const totalStock = product.stockByStore?.reduce((sum, s) => sum + s.quantity, 0) || 0;
    if (totalStock < quantity) {
      return res.status(400).json({ error: 'Sản phẩm không đủ hàng' });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const index = cart.items.findIndex(item => item.productId.toString() === productId);
    if (index >= 0) {
      cart.items[index].quantity += quantity;
    } else {
      cart.items.push({ productId, name, price, image, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error('Lỗi khi lưu giỏ hàng:', err);
    res.status(500).json({ error: 'Lỗi khi lưu giỏ hàng' });
  }
};

export const getCartByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(200).json({ items: [] });
    }
    res.status(200).json({ items: cart.items });
  } catch (err) {
    console.error('Lỗi khi lấy giỏ hàng:', err);
    res.status(500).json({ error: 'Lỗi khi lấy giỏ hàng' });
  }
};

export const removeFromCart = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'userId hoặc productId không hợp lệ' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Không tìm thấy giỏ hàng' });
    }

    const initialItemCount = cart.items.length;
    console.log(`Xóa sản phẩm ${productId} khỏi giỏ hàng của user ${userId}`);
    console.log('Trước khi xóa:', cart.items);

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    if (cart.items.length === initialItemCount) {
      return res.status(404).json({ error: 'Sản phẩm không có trong giỏ hàng' });
    }

    console.log('Sau khi xóa:', cart.items);
    await cart.save();
    res.status(200).json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng', items: cart.items });
  } catch (err) {
    console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', err);
    res.status(500).json({ error: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng' });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || quantity < 1) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Không tìm thấy giỏ hàng' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex < 0) {
      return res.status(404).json({ error: 'Sản phẩm không có trong giỏ hàng' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ error: 'Sản phẩm không tồn tại' });
    }
    
    // Sử dụng stockByStore thay vì stock
    const totalStock = product.stockByStore?.reduce((sum, s) => sum + s.quantity, 0) || 0;
    if (totalStock < quantity) {
      return res.status(400).json({ error: 'Sản phẩm không đủ hàng' });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    res.status(200).json({ items: cart.items });
  } catch (err) {
    console.error('Lỗi khi cập nhật số lượng:', err);
    res.status(500).json({ error: 'Lỗi khi cập nhật số lượng' });
  }
};

export const syncCart = async (req, res) => {
  const { userId, items } = req.body;

  if (!userId || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Sản phẩm ${item.name} không tồn tại` });
      }
      
      // Sử dụng stockByStore thay vì stock
      const totalStock = product.stockByStore?.reduce((sum, s) => sum + s.quantity, 0) || 0;
      if (totalStock < item.quantity) {
        return res.status(400).json({ error: `Sản phẩm ${item.name} không đủ hàng` });
      }
    }

    cart.items = items.map(item => ({
      productId: item.productId, // <-- use productId from frontend
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
    }));

    await cart.save();
    res.status(200).json({ items: cart.items });
  } catch (err) {
    console.error('Lỗi khi đồng bộ giỏ hàng:', err);
    res.status(500).json({ error: 'Lỗi khi đồng bộ giỏ hàng' });
  }
};

export const clearCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Không tìm thấy giỏ hàng' });
    }

    cart.items = []; 
    await cart.save();
    res.status(200).json({ message: 'Đã xóa toàn bộ giỏ hàng' });
  } catch (err) {
    console.error('Lỗi khi xóa toàn bộ giỏ hàng:', err);
    res.status(500).json({ error: 'Lỗi server khi xóa giỏ hàng' });
  }
};
