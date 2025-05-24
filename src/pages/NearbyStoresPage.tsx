import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useMemo } from 'react';

interface LocationState {
  latitude: number;
  longitude: number;
}

interface Store {
  _id: string;
  name: string;
  address: string;
  district: string;
  ward: string;
  phone: string;
  location: {
    type: string;
    coordinates: number[];
  };
  distance?: number; // Khoảng cách tính bằng km
}

const NearbyStoresPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<any[]>([]); // hoặc AdvancedMarkerElement[] nếu đã có type
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [regions, setRegions] = useState<{ [district: string]: string[] }>({});
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  
  // Lấy tọa độ từ state của location
  const state = location.state as LocationState;
  const userLocation = useMemo(() => {
    return state ? { lat: state.latitude, lng: state.longitude } : null;
  }, [state]);

  // Hàm tính khoảng cách giữa hai điểm tọa độ
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Bán kính trái đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Hàm tải script Google Maps API
  const loadGoogleMapsScript = useCallback(() => {
    if (window.google && window.google.maps) return Promise.resolve();
  
    return new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector('#google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        return;
      }
  
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBtpdiUWpftUWmvyXDBt3wwocDOzPiv2qw&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Không thể tải Google Maps API'));
      document.head.appendChild(script);
    });
  }, []);  

  // Hàm khởi tạo bản đồ
  const initMap = useCallback(() => {
    if (typeof window.google === 'undefined' || typeof window.google.maps === 'undefined') {
        console.error("Google Maps chưa được tải");
        return;
      }      
      if (!mapContainerRef.current) {
        console.error("Phần tử bản đồ chưa sẵn sàng");
        return;
      }
    
      if (!userLocation) {
        console.error("Không có userLocation");
        return;
      }
    
      console.log("✅ Bắt đầu khởi tạo Google Map với tọa độ:", userLocation);
  
    const mapElement = mapContainerRef.current;
    if (!(mapElement instanceof HTMLElement)) {
      console.error("Không tìm thấy phần tử mapContainerRef hợp lệ");
      return;
    }
  
    console.log("Đã sẵn sàng khởi tạo map tại", mapContainerRef.current);

    const map = new google.maps.Map(mapElement, {
      center: userLocation,
      zoom: 14,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true,
    });
  
    mapRef.current = map;
  
    new google.maps.Marker({
      position: userLocation,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      title: 'Vị trí của bạn',
    });
  
    infoWindowRef.current = new google.maps.InfoWindow();
  
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  
    stores.forEach((store) => {
      if (store.location && store.location.coordinates) {
        const [lng, lat] = store.location.coordinates;
        const marker = new google.maps.Marker({
            position: { lat, lng },
            map: mapRef.current,
            title: store.name,
          });
  
        (marker as any).storeId = store._id; 
        markersRef.current.push(marker);
        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(
              `<div class="p-2">
                <h3 class="font-bold">${store.name}</h3>
                <p>${store.address}, ${store.ward}, ${store.district}</p>
                ${store.phone ? `<p>SĐT: ${store.phone}</p>` : ''}
                ${store.distance ? `<p>Khoảng cách: ${store.distance.toFixed(2)} km</p>` : ''}
              </div>`
            );
            infoWindowRef.current.open(map, marker);
          }
          setSelectedStore(store);
        });
      }
    });
  }, [stores, userLocation]);
  
  // Hàm lấy danh sách cửa hàng gần nhất
  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
  
      if (selectedDistrict) {
        // Nếu đã chọn quận → lấy tất cả cửa hàng ở quận đó
        const res = await axios.get('http://localhost:5000/api/stores', {
          params: { district: selectedDistrict }
        });
        setStores(res.data);
      } else if (userLocation) {
        // Nếu chưa chọn quận → lấy các cửa hàng gần nhất
        const res = await axios.get('http://localhost:5000/api/stores/nearest', {
          params: {
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            maxDistance: 7000
          }
        });
  
        const storeList = Array.isArray(res.data) ? res.data : [];
  
        const storesWithDistance = storeList.map((store: Store) => {
          if (store.location?.coordinates?.length === 2) {
            const [lng, lat] = store.location.coordinates;
            const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
            return { ...store, distance };
          }
          return store;
        });
  
        storesWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        setStores(storesWithDistance);
      } else {
        toast.error("Không có tọa độ hoặc quận để tìm cửa hàng");
        setStores([]);
      }
  
    } catch (err) {
      console.error("Lỗi khi lấy cửa hàng:", err);
      toast.error("Không thể tải danh sách cửa hàng");
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDistrict, userLocation]);
  
  
    useEffect(() => {
        loadGoogleMapsScript()
          .then(() => console.log("✅ Script Maps đã tải xong"))
          .catch(() => toast.error("Không thể tải Google Maps"));
      }, [loadGoogleMapsScript]);

      useEffect(() => {
        fetchStores();
      }, [fetchStores]);
      

      useEffect(() => {
        if (stores.length > 0 && userLocation && window.google && window.google.maps) {
            initMap();
        }
      }, [stores, userLocation, initMap]);

      useEffect(() => {
        return () => {
          markersRef.current.forEach((marker) => marker.setMap(null));
          markersRef.current = [];
        };
      }, []);
      
      useEffect(() => {
        axios.get('http://localhost:5000/api/stores/regions')
          .then(res => setRegions(res.data))
          .catch(() => toast.error('Không thể tải danh sách khu vực'));
      }, []);
      

  // Xử lý khi click vào cửa hàng trong danh sách
  const handleStoreClick = (store: Store) => {
    setSelectedStore(store);
    
    if (mapRef.current && store.location && store.location.coordinates) {
      const [lng, lat] = store.location.coordinates;
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
      
    const marker = markersRef.current.find(m => (m as any).storeId === store._id);
      
      if (marker && infoWindowRef.current) {
        infoWindowRef.current.setContent(
          `<div class="p-2">
            <h3 class="font-bold">${store.name}</h3>
            <p>${store.address}, ${store.ward}, ${store.district}</p>
            ${store.phone ? `<p>SĐT: ${store.phone}</p>` : ''}
            ${store.distance ? `<p>Khoảng cách: ${store.distance.toFixed(2)} km</p>` : ''}
          </div>`
        );
        infoWindowRef.current.open(mapRef.current, marker);
      }
    }
  };

  const filteredStores = selectedDistrict
  ? stores.filter((s) => s.district === selectedDistrict)
  : stores;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cửa hàng gần bạn</h1>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Bản đồ */}
        <div className="w-full md:w-2/3 h-[400px] md:h-[600px] bg-gray-100 rounded-lg overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
        
        {/* Danh sách cửa hàng */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-lg font-semibold p-4 bg-pink-600 text-white">Danh sách cửa hàng</h2>
            <div className="p-4">
                <select
                    className="w-full p-2 border rounded mb-2"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                    <option value="">Cửa hàng gần bạn</option>
                    {Object.keys(regions).map((district) => (
                    <option key={district} value={district}>{district}</option>
                    ))}
                </select>
                </div>

            {loading ? (
              <div className="p-4 text-center">Đang tải...</div>
            ) : stores.length === 0 ? (
              <div className="p-4 text-center">Không tìm thấy cửa hàng nào gần đây</div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                {filteredStores.map((store) => (
                  <div 
                    key={store._id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${selectedStore?._id === store._id ? 'bg-pink-50' : ''}`}
                    onClick={() => handleStoreClick(store)}
                  >
                    <h3 className="font-bold text-pink-600">{store.name}</h3>
                    <p className="text-sm text-gray-600">{store.address}, {store.ward}, {store.district}</p>
                    {store.phone && <p className="text-sm">SĐT: {store.phone}</p>}
                    {store.distance && (
                      <p className="text-sm font-semibold mt-1">
                        Khoảng cách: {store.distance.toFixed(2)} km
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyStoresPage;