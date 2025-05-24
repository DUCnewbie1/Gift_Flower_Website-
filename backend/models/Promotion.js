import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true },                // Tên khuyến mãi
  description: { type: String },                         // Mô tả
  discountType: { 
    type: String, 
    enum: ['PERCENTAGE', 'FIXED_AMOUNT'], 
    required: true 
  },                                                     // Loại giảm giá (% hoặc số tiền cố định)
  discountValue: { type: Number, required: true },       // Giá trị giảm giá
  
  // Phạm vi áp dụng (khu vực hoặc cửa hàng cụ thể)
  applicationType: { 
    type: String, 
    enum: ['DISTRICT', 'STORE', 'ALL'], 
    default: 'ALL' 
  },
  districts: [{ type: String }],                         // Danh sách quận áp dụng
  storeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }], // Danh sách cửa hàng áp dụng
  
  // Sản phẩm áp dụng
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  
  // Thời gian áp dụng
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;