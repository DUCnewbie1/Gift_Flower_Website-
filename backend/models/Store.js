import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },                // Tên cửa hàng
  address: { type: String, required: true },             // Địa chỉ chi tiết
  district: { type: String, required: true },            // Quận
  ward: { type: String, required: true },                // Phường
  phone: { type: String },                               // Số điện thoại
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]                                // [longitude, latitude]
  },
  isActive: { type: Boolean, default: true }             // Trạng thái hoạt động
}, {
  timestamps: true
});

// Tạo index cho location để hỗ trợ tìm kiếm địa lý
storeSchema.index({ location: '2dsphere' });

const Store = mongoose.model('Store', storeSchema);
export default Store;