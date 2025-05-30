import Promotion from "../models/Promotion.js";

// [GET] /api/promotions - Lấy tất cả mã giảm giá
export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.json(promotions);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách khuyến mãi:", err);
    res.status(500).json({ error: "Không thể lấy danh sách khuyến mãi" });
  }
};

// [POST] /api/promotions - Tạo mã khuyến mãi mới
export const createPromotion = async (req, res) => {
  try {
    const newPromotion = new Promotion(req.body);
    await newPromotion.save();
    res.status(201).json({ message: "Tạo mã khuyến mãi thành công", promotion: newPromotion });
  } catch (err) {
    console.error("Lỗi khi tạo khuyến mãi:", err);
    res.status(400).json({ error: "Không thể tạo mã khuyến mãi", details: err.message });
  }
};

// [DELETE] /api/promotions/:id - Xoá khuyến mãi
export const deletePromotion = async (req, res) => {
  try {
    const deleted = await Promotion.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Không tìm thấy khuyến mãi" });
    res.json({ message: "Đã xoá khuyến mãi" });
  } catch (err) {
    console.error("Lỗi khi xoá khuyến mãi:", err);
    res.status(500).json({ error: "Không thể xoá khuyến mãi" });
  }
};

// [PUT] /api/promotions/:id - Cập nhật khuyến mãi
export const updatePromotion = async (req, res) => {
  try {
    const updated = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Không tìm thấy khuyến mãi" });
    res.json({ message: "Cập nhật thành công", promotion: updated });
  } catch (err) {
    console.error("Lỗi khi cập nhật khuyến mãi:", err);
    res.status(400).json({ error: "Không thể cập nhật", details: err.message });
  }
};
