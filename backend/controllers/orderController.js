import Order from "../models/Order.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng:", error);
    res.status(500).json({ error: "Không thể lấy đơn hàng" });
  }
};
