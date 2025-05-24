import mongoose from 'mongoose';

const stockByStoreSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  quantity: { type: Number, default: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },               // Tên sản phẩm
  price: { type: Number, required: true },              // Giá bán cơ bản
  image: { type: String },
  category: { type: String },

  stock: { type: Number, default: 0 },                  // Tổng số lượng còn trong kho
  stockByStore: [stockByStoreSchema],                   // Tồn kho theo từng cửa hàng
  importedAt: { type: Date, default: Date.now },        // Ngày nhập hàng
  isHot: { type: Boolean, default: false },             // Đánh dấu hàng bán chạy
  discount: { type: String, default: "0%" },            // Giảm giá
  rating: { type: Number, default: 5.0 },               // Đánh giá trung bình
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
