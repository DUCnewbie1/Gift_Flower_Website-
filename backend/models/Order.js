import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  transactionId: { type: String },
  amount: { type: Number, required: true },
  customerInfo: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    province: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    note: { type: String },
  },
  cartItems: [
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  paymentMethod: { type: String, enum: ['TRANSFER', 'CASH'], required: true },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', orderSchema);