import Store from '../models/Store.js';
import Product from '../models/Product.js';

// Tính phí giao hàng dựa trên khoảng cách
export const calculateShippingFee = async (req, res) => {
  try {
    const { 
      longitude, 
      latitude, 
      district, 
      productIds = [], 
      baseShippingFee = 15000 // Phí giao hàng cơ bản
    } = req.body;
    
    if ((!longitude || !latitude) && !district) {
      return res.status(400).json({ 
        error: 'Cần cung cấp tọa độ (longitude, latitude) hoặc district' 
      });
    }
    
    // Tìm các cửa hàng trong khu vực hoặc gần vị trí
    let stores = [];
    if (district) {
      stores = await Store.find({ district, isActive: true });
    } else {
      stores = await Store.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: 10000 // 10km
          }
        },
        isActive: true
      }).limit(5);
    }
    
    if (stores.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy cửa hàng phù hợp trong khu vực' });
    }
    
    // Nếu có sản phẩm, tìm cửa hàng có đủ tồn kho
    let selectedStore = stores[0]; // Mặc định lấy cửa hàng đầu tiên
    let distance = 0;
    
    if (productIds.length > 0 && longitude && latitude) {
      // Lấy thông tin sản phẩm
      const products = await Product.find({ _id: { $in: productIds } });
      
      // Tìm cửa hàng gần nhất có đủ tồn kho
      for (const store of stores) {
        const hasStock = products.every(product => {
          const storeStock = product.stockByStore.find(
            s => s.storeId.toString() === store._id.toString()
          );
          return storeStock && storeStock.quantity > 0;
        });
        
        if (hasStock) {
          selectedStore = store;
          break;
        }
      }
      
      // Tính khoảng cách từ cửa hàng đến địa điểm giao hàng
      const storeCoords = selectedStore.location.coordinates;
      distance = calculateDistance(
        storeCoords[1], storeCoords[0], // lat, lng của cửa hàng
        parseFloat(latitude), parseFloat(longitude) // lat, lng của địa điểm giao
      );
    }
    
    // Tính phí giao hàng dựa trên khoảng cách
    // Công thức: phí cơ bản + (khoảng cách * 5000 VND/km nếu > 2km)
    let shippingFee = baseShippingFee;
    if (distance > 2) {
      shippingFee += (distance - 2) * 5000;
    }
    
    // Làm tròn phí giao hàng đến 1000 VND
    shippingFee = Math.ceil(shippingFee / 1000) * 1000;
    
    // Ước tính thời gian giao hàng (30 phút cơ bản + 10 phút/km)
    const estimatedDeliveryTime = 30 + Math.ceil(distance * 10);
    
    res.json({
      shippingFee,
      distance: parseFloat(distance.toFixed(2)),
      unit: 'km',
      estimatedDeliveryTime,
      timeUnit: 'minutes',
      store: {
        _id: selectedStore._id,
        name: selectedStore.name,
        address: selectedStore.address
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Không thể tính phí giao hàng', details: err.message });
  }
};

// Hàm tính khoảng cách giữa hai điểm dựa trên công thức Haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}