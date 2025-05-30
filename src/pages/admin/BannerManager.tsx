import { useState, useEffect } from "react";

interface Banner {
  _id?: string;
  title: string;
  image: string;
  active: boolean;
}

export default function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    active: true
  });
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/banners");
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      console.error("Lỗi khi lấy banner:", error);
      // Giả lập toast message
      console.error("Không thể lấy danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "active" ? value === "true" : value
    });

    // Set preview for image URL
    if (name === "image" && value) {
      setPreview(value);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      image: "",
      active: true
    });
    setPreview(null);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await fetch("/api/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      // Giả lập toast message
      console.log("🎉 Banner đã được thêm thành công");
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error("Lỗi khi thêm banner:", error);
      // Giả lập toast message
      console.error("Không thể thêm banner");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Banner</h1>
        <button 
          onClick={fetchBanners}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột bên trái: Form thêm banner */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 py-4 px-6">
              <h2 className="text-xl font-bold text-white">Thêm Banner Mới</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block font-medium text-gray-700 mb-2">Tiêu đề banner</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: Ưu đãi mùa hè"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block font-medium text-gray-700 mb-2">URL hình ảnh</label>
                <input
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                  placeholder="https://example.com/banner.jpg"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              
              {preview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Xem trước:</p>
                  <div className="border rounded-lg overflow-hidden">
                    <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block font-medium text-gray-700 mb-2">Trạng thái</label>
                <select 
                  name="active" 
                  value={formData.active.toString()}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="true">Hiển thị</option>
                  <option value="false">Ẩn</option>
                </select>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium px-6 py-3 rounded-lg hover:opacity-90 transition flex-1"
                >
                  Thêm banner
                </button>
                <button 
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-100 text-gray-700 font-medium px-6 py-3 rounded-lg hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cột bên phải: Danh sách banner */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 py-4 px-6">
              <h2 className="text-xl font-bold text-white">Danh Sách Banner</h2>
            </div>
            
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : banners.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">Chưa có banner nào được thêm vào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {banners.map((banner) => (
                  <div key={banner._id} className="border rounded-lg overflow-hidden hover:shadow-md transition group">
                    <div className="relative h-48">
                      <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          banner.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {banner.active ? "Hiển thị" : "Đã ẩn"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 truncate">{banner.title}</h3>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-500 truncate max-w-full">{banner.image}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}