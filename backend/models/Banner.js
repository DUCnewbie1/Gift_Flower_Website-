import mongoose from 'mongoose';

// Mô hình Banner
const bannerSchema = new mongoose.Schema({
  image: { type: String, required: true }, // đường dẫn ảnh
  link: { type: String }, // nếu muốn chuyển trang khi click
  active: { type: Boolean, default: true }, // có hiển thị không
}, { timestamps: true });

export default mongoose.model('Banner', bannerSchema);
