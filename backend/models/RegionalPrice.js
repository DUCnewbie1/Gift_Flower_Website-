import mongoose from 'mongoose';

const regionalPriceSchema = new mongoose.Schema({
  district: { type: String, required: true, unique: true },  // Quận áp dụng - giờ là unique
  additionalPrice: { type: Number, default: 0 },           // Giá thêm cho khu vực này
}, {
  timestamps: true
});

const RegionalPrice = mongoose.model('RegionalPrice', regionalPriceSchema);
export default RegionalPrice;