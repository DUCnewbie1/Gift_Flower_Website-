import RegionalPrice from '../models/RegionalPrice.js';

// Lấy giá theo khu vực
export const getRegionalPrices = async (req, res) => {
  try {
    const { district } = req.query;
    let query = {};
    
    if (district) query.district = district;
    
    const prices = await RegionalPrice.find(query);
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy giá theo khu vực' });
  }
};

// Tạo hoặc cập nhật giá theo khu vực
export const setRegionalPrice = async (req, res) => {
  try {
    const { district, additionalPrice } = req.body;
    
    if (!district || additionalPrice === undefined) {
      return res.status(400).json({ error: 'Thiếu thông tin cần thiết' });
    }
    
    // Tìm và cập nhật hoặc tạo mới
    const result = await RegionalPrice.findOneAndUpdate(
      { district },
      { additionalPrice },
      { new: true, upsert: true }
    );
    
    res.json({ message: 'Cập nhật giá theo khu vực thành công', regionalPrice: result });
  } catch (err) {
    res.status(400).json({ error: 'Không thể cập nhật giá theo khu vực', details: err.message });
  }
};

// Xóa giá theo khu vực
export const deleteRegionalPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await RegionalPrice.findByIdAndDelete(id);
    
    if (!result) return res.status(404).json({ error: 'Không tìm thấy giá theo khu vực' });
    res.json({ message: 'Xóa giá theo khu vực thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Không thể xóa giá theo khu vực' });
  }
};