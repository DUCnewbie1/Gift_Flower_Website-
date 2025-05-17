import Promotion from '../models/Promotion.js';

// Lấy danh sách khuyến mãi theo khu vực hoặc cửa hàng
export const getPromotions = async (req, res) => {
  try {
    const { district, storeId } = req.query;
    const now = new Date();
    
    // Tìm các khuyến mãi đang hoạt động và phù hợp với khu vực/cửa hàng
    let query = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    };
    
    if (district && storeId) {
      // Tìm khuyến mãi áp dụng cho cả khu vực và cửa hàng cụ thể
      query.$or = [
        { applicationType: 'ALL' },
        { applicationType: 'DISTRICT', districts: district },
        { applicationType: 'STORE', storeIds: storeId }
      ];
    } else if (district) {
      // Tìm khuyến mãi áp dụng cho khu vực
      query.$or = [
        { applicationType: 'ALL' },
        { applicationType: 'DISTRICT', districts: district }
      ];
    } else if (storeId) {
      // Tìm khuyến mãi áp dụng cho cửa hàng cụ thể
      query.$or = [
        { applicationType: 'ALL' },
        { applicationType: 'STORE', storeIds: storeId }
      ];
    } else {
      // Nếu không có district hoặc storeId, chỉ lấy khuyến mãi áp dụng cho tất cả
      query.applicationType = 'ALL';
    }
    
    const promotions = await Promotion.find(query);
    res.json(promotions);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách khuyến mãi', details: err.message });
  }
};

// Tạo khuyến mãi mới
export const createPromotion = async (req, res) => {
  try {
    const newPromotion = new Promotion(req.body);
    await newPromotion.save();
    res.status(201).json({ message: 'Tạo khuyến mãi thành công', promotion: newPromotion });
  } catch (err) {
    res.status(400).json({ error: 'Không thể tạo khuyến mãi', details: err.message });
  }
};

// Cập nhật khuyến mãi
export const updatePromotion = async (req, res) => {
  try {
    const updatedPromotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPromotion) return res.status(404).json({ error: 'Không tìm thấy khuyến mãi' });
    res.json({ message: 'Cập nhật khuyến mãi thành công', promotion: updatedPromotion });
  } catch (err) {
    res.status(400).json({ error: 'Không thể cập nhật khuyến mãi', details: err.message });
  }
};

// Xóa khuyến mãi
export const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) return res.status(404).json({ error: 'Không tìm thấy khuyến mãi' });
    res.json({ message: 'Xóa khuyến mãi thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Không thể xóa khuyến mãi' });
  }
};