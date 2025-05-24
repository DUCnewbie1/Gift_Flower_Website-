import Banner from '../models/Banner.js';

const BASE_URL = import.meta.env.VITE_API_URL;

export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ createdAt: -1 });

    const enriched = banners.map(b => {
      const image = b.image?.startsWith("http") ? b.image : `${BASE_URL}${b.image}`;
      return {
        ...b.toObject(),
        image
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách banner' });
  }
};

export const createBanner = async (req, res) => {
  try {
    const newBanner = new Banner(req.body);
    await newBanner.save();
    res.status(201).json({ message: 'Tạo banner thành công', banner: newBanner });
  } catch (err) {
    res.status(400).json({ error: 'Không thể tạo banner', details: err.message });
  }
};
