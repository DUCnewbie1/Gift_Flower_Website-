import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import crypto from "crypto";

import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import { login } from "./controllers/authController.js";
import { syncCart } from "./controllers/cartController.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
import Cart from "./models/Cart.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "public/images")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB Atlas"))
  .catch((err) => console.error("❌ Lỗi MongoDB:", err));

const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMOOJOI20210710";
const accessKey = process.env.MOMO_ACCESS_KEY || "iPXneGmrJH0G8FOP";
const secretKey =
  process.env.MOMO_SECRET_KEY || "sFcbSGRSJjwGxwhhcEktCHWYUuTuPNDB";
const momoEndpoint = "https://test-payment.momo.vn/v2/gateway/api/create";

const baseNgrokUrl = "http://localhost:5000";
const notifyUrl = `${baseNgrokUrl}/momo-webhook`;
const defaultReturnUrl = "http://localhost:5173/order-success";

app.post("/api/create-momo-payment", async (req, res) => {
  const { orderId, requestId, amount, cartItems, customerInfo, userId } =
    req.body;
  const amountInt = parseInt(amount);
  if (isNaN(amountInt) || amountInt <= 0)
    return res.status(400).json({ error: "Số tiền không hợp lệ" });

  const redirectUrl = defaultReturnUrl;
  const orderInfo = `Thanh toan don hang ${orderId}`;
  const extra = {
    userId,
    phone: customerInfo?.phone,
    email: customerInfo?.email,
  };
  const extraData = Buffer.from(JSON.stringify(extra)).toString("base64");

  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${amountInt}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${notifyUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=captureWallet`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode,
    accessKey,
    requestId,
    amount: amountInt,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl: notifyUrl,
    requestType: "captureWallet",
    signature,
    extraData,
  };

  console.log("MoMo Request Body:", requestBody);
  console.log("Raw Signature:", rawSignature);
  console.log("Signature:", signature);

  try {
    const response = await axios.post(momoEndpoint, requestBody);
    res.json(response.data);
  } catch (error) {
    console.error("Lỗi khi gọi MoMo API:", error);
    if (axios.isAxiosError(error) && error.response) {
      res.status(error.response.status).json({
        error: "Không thể tạo thanh toán MoMo",
        details: error.response.data,
      });
    } else {
      res.status(500).json({ error: "Không thể tạo thanh toán MoMo" });
    }
  }
});

app.post("/api/save-order", async (req, res) => {
  const {
    orderId,
    amount,
    paymentMethod,
    status,
    userId,
    cartItems,
    customerInfo,
  } = req.body;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "userId không hợp lệ" });
  }

  try {
    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder) {
      return res
        .status(200)
        .json({ message: "Đơn hàng đã tồn tại", cartCleared: true });
    }

    await Order.create({
      orderId,
      amount,
      paymentMethod,
      status,
      userId,
      cartItems,
      customerInfo,
      transactionId: "N/A",
    });

    await Cart.deleteMany({ userId });

    res
      .status(201)
      .json({ message: "Đơn hàng đã được lưu", cartCleared: true });
  } catch (error) {
    console.error("Lỗi khi lưu đơn hàng:", error);
    res
      .status(500)
      .json({ error: "Không thể lưu đơn hàng", details: error.message });
  }
});

app.post("/api/create-order", async (req, res) => {
  const {
    orderId,
    cartItems,
    totalAmount,
    customerInfo,
    paymentMethod,
    status,
  } = req.body;
  try {
    const order = new Order({
      orderId,
      amount: totalAmount,
      customerInfo,
      cartItems,
      paymentMethod,
      status,
    });
    await order.save();
    res.status(201).json({ message: "Đơn hàng đã được tạo thành công" });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ error: "Không thể tạo đơn hàng" });
  }
});

app.post("/api/update-product-quantity", async (req, res) => {
  const { cartItems } = req.body;
  try {
    for (const item of cartItems) {
      const product = await Product.findById(item._id);
      if (!product)
        return res
          .status(404)
          .json({ error: `Sản phẩm ${item.name} không tồn tại` });
      if (product.stock < item.quantity)
        return res.status(400).json({
          error: `Số lượng tồn kho không đủ cho sản phẩm ${item.name}`,
        });
      product.stock -= item.quantity;
      await product.save();
    }
    res.status(200).json({ message: "Đã cập nhật số lượng sản phẩm" });
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng sản phẩm:", error);
    res.status(500).json({ error: "Không thể cập nhật số lượng sản phẩm" });
  }
});

app.post("/momo-webhook", async (req, res) => {
  const { orderId, resultCode, transId, amount, signature } = req.body;
  const extraData = req.body.extraData
    ? JSON.parse(Buffer.from(req.body.extraData, "base64").toString())
    : {};
  const { userId } = extraData;

  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${req.body.extraData}` +
    `&message=${req.body.message}` +
    `&orderId=${orderId}` +
    `&orderInfo=${req.body.orderInfo}` +
    `&orderType=${req.body.orderType}` +
    `&partnerCode=${partnerCode}` +
    `&requestId=${req.body.requestId}` +
    `&responseTime=${req.body.responseTime}` +
    `&resultCode=${resultCode}` +
    `&transId=${transId}`;
  const calculatedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");
  if (calculatedSignature !== signature)
    return res.status(400).send("Invalid signature");

  if (resultCode === 0) {
    await Order.create({
      orderId,
      transactionId: transId,
      amount,
      paymentMethod: "TRANSFER",
      status: "SUCCESS",
      userId,
    });
    if (userId) await Cart.deleteMany({ userId });
  } else {
    await Order.create({
      orderId,
      transactionId: transId,
      amount,
      paymentMethod: "TRANSFER",
      status: "FAILED",
      userId,
    });
  }
  res.status(200).send("Webhook received");
});

app.get("/api/order/:orderId", async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: "Đơn hàng không tồn tại" });
    }
    res.json(order);
  } catch (error) {
    console.error("Lỗi khi kiểm tra đơn hàng:", error);
    res.status(500).json({ error: "Không thể kiểm tra đơn hàng" });
  }
});

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", userRoutes);
app.post("/api/auth/login", login);
app.post("/api/cart/sync", syncCart);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend đang chạy tại http://localhost:${PORT}`);
});
