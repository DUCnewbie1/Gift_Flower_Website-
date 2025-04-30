import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },               // Tên sản phẩm
  price: { type: Number, required: true },              // Giá bán
  image: { type: String },
  category: { type: String },

  stock: { type: Number, default: 0 },                  // Số lượng còn trong kho
  importedAt: { type: Date, default: Date.now },        // Ngày nhập hàng
  isHot: { type: Boolean, default: false },             // Đánh dấu hàng bán chạy
  discount: { type: String, default: "0%" },            // Giảm giá
  rating: { type: Number, default: 5.0 },               // Đánh giá trung bình
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
