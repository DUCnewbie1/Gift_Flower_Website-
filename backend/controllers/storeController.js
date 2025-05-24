import Store from '../models/Store.js';
import NodeGeocoder from 'node-geocoder';
import dotenv from 'dotenv';

const options = {
  provider: 'google',
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
  formatter: null
};

const geocoder = NodeGeocoder(options);

/**
 * Hàm helper để lấy tọa độ từ địa chỉ
 */
async function getCoordinatesFromAddress(address, district, ward) {
  try {
    const fullAddress = address + (district ? `, ${district}` : '') + (ward ? `, ${ward}` : '') + ', Việt Nam';
    
    const results = await geocoder.geocode(fullAddress);
    
    if (results && results.length > 0) {
      const { latitude, longitude } = results[0];
      return { latitude, longitude };
    }
    
    throw new Error('Không thể lấy tọa độ từ địa chỉ này');
  } catch (error) {
    console.error('Lỗi geocoding:', error);
    throw error;
  }
}

// Lấy danh sách cửa hàng
export const getAllStores = async (req, res) => {
  try {
    const { district, ward } = req.query;
    let query = { isActive: true };
    
    if (district) query.district = district;
    if (ward) query.ward = ward;
    
    const stores = await Store.find(query);
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách cửa hàng' });
  }
};

// Lấy cửa hàng theo ID
export const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ error: 'Không tìm thấy cửa hàng' });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Tìm cửa hàng gần nhất
export const getNearestStore = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance mặc định 10km
    
    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'Cần cung cấp tọa độ (longitude, latitude)' });
    }
    
    const stores = await Store.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      isActive: true
    }).limit(5);
    
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: 'Không thể tìm cửa hàng gần nhất', details: err.message });
  }
};

// Tạo cửa hàng mới
export const createStore = async (req, res) => {
  try {
    const { address, district, ward } = req.body;

    // Nếu không có tọa độ rõ ràng
    const needsGeocode =
      !req.body.location ||
      !Array.isArray(req.body.location.coordinates) ||
      req.body.location.coordinates.length !== 2;

    if (needsGeocode) {
      try {
        const { latitude, longitude } = await getCoordinatesFromAddress(address, district, ward);

        req.body.location = {
          type: 'Point',
          coordinates: [longitude, latitude]
        };
      } catch (geoError) {
        console.error('Không thể lấy tọa độ:', geoError);

        // 🛠 Nếu API lỗi, không thêm location để tránh MongoDB validate
        delete req.body.location;
      }
    }

    const newStore = new Store(req.body);
    await newStore.save();
    res.status(201).json({ message: 'Tạo cửa hàng thành công', store: newStore });

  } catch (err) {
    res.status(400).json({ error: 'Không thể tạo cửa hàng', details: err.message });
  }
};


// Cập nhật cửa hàng
export const updateStore = async (req, res) => {
  try {
    const { address, district, ward } = req.body;
    
    // Nếu có thay đổi địa chỉ, tự động cập nhật tọa độ
    if (address || district || ward) {
      try {
        // Lấy thông tin cửa hàng hiện tại để có đầy đủ thông tin địa chỉ
        const currentStore = await Store.findById(req.params.id);
        if (!currentStore) {
          return res.status(404).json({ error: 'Không tìm thấy cửa hàng' });
        }
        
        const storeAddress = address || currentStore.address;
        const storeDistrict = district || currentStore.district;
        const storeWard = ward || currentStore.ward;
        
        const { latitude, longitude } = await getCoordinatesFromAddress(storeAddress, storeDistrict, storeWard);
        
        // Cập nhật tọa độ
        req.body.location = {
          type: 'Point',
          coordinates: [longitude, latitude]
        };
      } catch (geoError) {
        console.error('Không thể cập nhật tọa độ:', geoError);
        // Vẫn tiếp tục cập nhật cửa hàng mà không thay đổi tọa độ
      }
    }
    
    const updatedStore = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedStore) {
      return res.status(404).json({ error: 'Không tìm thấy cửa hàng' });
    }
    
    res.json({ message: 'Cập nhật cửa hàng thành công', store: updatedStore });
  } catch (err) {
    res.status(400).json({ error: 'Không thể cập nhật cửa hàng', details: err.message });
  }
};

// Xóa cửa hàng
export const deleteStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ error: 'Không tìm thấy cửa hàng' });
    res.json({ message: 'Xóa cửa hàng thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Không thể xóa cửa hàng' });
  }
};

export const getAvailableRegions = async (req, res) => {
    try {
      const stores = await Store.find({ isActive: true });
  
      const regionMap = {};
      stores.forEach(s => {
        const { district, ward } = s.toObject(); // 👈 Quan trọng
        if (!district || !ward) return;
  
        if (!regionMap[district]) regionMap[district] = new Set();
        regionMap[district].add(ward);
      });
  
      const result = {};
      for (const [district, wardsSet] of Object.entries(regionMap)) {
        result[district] = Array.from(wardsSet);
      }
  
      res.json(result);
    } catch (err) {
      console.error("❌ Lỗi getAvailableRegions:", err);
      res.status(500).json({ error: 'Không thể lấy khu vực cửa hàng', details: err.message });
    }
  };
  
  