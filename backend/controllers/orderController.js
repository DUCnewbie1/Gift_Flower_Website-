import Order from "../models/Order.js";

export const getOrdersByEmail = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ message: "Thiếu email" });

    const orders = await Order.find({ "customerInfo.email": email });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
