import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 }
});
// Mô hình giỏ hàng
// Giỏ hàng sẽ chứa các sản phẩm đã thêm vào, mỗi sản phẩm có thể có
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);
