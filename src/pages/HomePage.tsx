import React, { useState } from "react";
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useEffect } from "react";
import axios from "axios";

export default function HomePage() {

  interface Banner {
    _id: string;
    image: string;
    title?: string;
    description?: string;
    link?: string;
  }
  
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<string[]>([]);
  const [newProducts, setNewProducts] = useState([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        const categoryNames = res.data.map((cat: any) => cat.name);
        setCategories(categoryNames);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };
  
    const fetchNewProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/new");
        console.log("Sản phẩm mới từ API:", res.data);
        setNewProducts(res.data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm mới:", error);
      }
    };
    const fetchBanners = async () => {
      try {
        const res = await axios.get<Banner[]>("http://localhost:5000/api/banners");
        console.log("📸 Banners:", res.data); // Kiểm tra có dữ liệu không
        setBanners(res.data);
      } catch (error) {
        console.error("Lỗi khi tải banners:", error);
      }
    };
  
    fetchBanners();
    fetchCategories();
    fetchNewProducts();
  }, []);
  
  
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  // Add state for carousel
  const [activeSlide, setActiveSlide] = useState(0);
  const handleFavoriteToggle = (product: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: string;
    image?: string;
  }) => {
    if (isInFavorites(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        image: product.image || "/placeholder.png"
      });
    }
  };
  // Carousel images data
  const carouselImages = [
    {
      id: 1,
      title: "Black friday Day",
      subtitle: "Giảm giá 50%",
      image: "/assets/images/black-friday-sale.jpg",
      thumbnail: "/assets/images/black-friday-sale.jpg",
    },
    {
      id: 2,
      title: "Ưu đãi valentine day",
      subtitle: "Ưu đãi đặc biệt",
      image: "/assets/images/valentine.jpg",
      thumbnail: "/assets/images/valentine.jpg",
    },
    {
      id: 3,
      title: "Bộ Sưu Tập Mới",
      subtitle: "Khám phá ngay",
      image: "/assets/images/stock.jpg",
      thumbnail: "/assets/images/stock.jpg",
    }
  ];

  const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState(5 * 24 * 60 * 60); // ví dụ 5 ngày
  
    React.useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
  
      return () => clearInterval(timer);
    }, []);
  
    const formatTime = (seconds: number) => {
      const days = Math.floor(seconds / (24 * 60 * 60));
      const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((seconds % (60 * 60)) / 60);
      const secs = seconds % 60;
      return { days, hours, minutes, secs };
    };
  
    const { days, hours, minutes, secs } = formatTime(timeLeft);
  
    return (
      <>
        {[
          { value: days, label: "Ngày" },
          { value: hours, label: "Giờ" },
          { value: minutes, label: "Phút" },
          { value: secs, label: "Giây" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-md p-2 text-center min-w-[40px]">
            <div className="text-pink-600 font-bold">{item.value.toString().padStart(2, '0')}</div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </>
    );
  };
  
  // Use React by adding a state variable
  const [copied, setCopied] = React.useState<string | null>(null);
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
        <div className="max-w-7xl mx-auto flex flex-col px-6 py-6 gap-6 bg-white-50">
        {/* Combined box with categories, carousel, and promotions */}
        <div className="flex gap-4">
            {/* Left Sidebar - Categories */}
            <aside className="w-64 flex-shrink-0 bg-white rounded shadow-sm flex flex-col justify-start">
            <div className="font-bold p-3 text-gray-700 border-b flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Danh mục sản phẩm
            </div>
            <ul className="flex-1 flex flex-col text-sm max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent hover:scrollbar-thumb-pink-500">
              {categories.map((cat, i) => (
                <li key={i} className="hover:bg-pink-50 transition px-3 py-2 cursor-pointer border-b flex items-center gap-2">
                  <span className="text-pink-500">•</span> {cat}
                </li>
              ))}
            </ul>
            </aside>

            {/* Main content with carousel and thumbnails */}
            <div className="flex-1">
            {/* Banner carousel */}
            <div className="w-full h-64 bg-pink-100 rounded-lg relative overflow-hidden">
                {/* Left arrow */}
                <button
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-pink-200 rounded-full p-2 shadow transition"
                onClick={() => setActiveSlide((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1))}
                aria-label="Previous"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                </button>
                {/* Right arrow */}
                <button
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-pink-200 rounded-full p-2 shadow transition"
                onClick={() => setActiveSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1))}
                aria-label="Next"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                </button>
                {/* Main carousel images */}
                {banners.map((banner, index) => (
                  <div
                    key={banner._id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={banner.image}
                      alt={`Banner ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {/* Carousel navigation dots */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                {banners.map((_, index) => (
                    <button 
                    key={index}
                    className={`h-2 w-2 rounded-full ${index === activeSlide ? 'bg-pink-500' : 'bg-pink-300'}`}
                    onClick={() => setActiveSlide(index)}
                    />
                ))}
                </div>
            </div>
            
            {/* Thumbnail navigation */}
            <div className="flex gap-2 justify-center my-3">
              {banners.map((banner, index) => (
                <button
                  key={banner._id}
                  className={`w-24 h-16 rounded overflow-hidden border-2 ${
                    index === activeSlide ? 'border-pink-500' : 'border-transparent'
                  }`}
                  onClick={() => setActiveSlide(index)}
                >
                  <img 
                    src={banner.image}
                    alt={banner.title || `Banner ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            </div>

            {/* Right sidebar for "Quà mới về" */}
            <aside className="w-72 flex-shrink-0 bg-white rounded shadow-sm p-3 justify-start">
            <h3 className="font-bold text-pink-600 mb-3">Quà mới về!</h3>
            {newProducts.length === 0 ? (
              <p className="text-sm text-gray-500">Hiện chưa có sản phẩm mới.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {newProducts.map((item: any) => (
                  <div key={item._id} className="flex gap-2 pb-3 border-b">
                    <img 
                      src={item.image || "/placeholder.png"} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-medium line-clamp-2">{item.name}</div>
                      <div className="text-pink-600 font-bold text-sm mt-1">{item.price.toLocaleString()}₫</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </aside>
        </div>
        
        <div className="grid grid-cols-4 gap-3 mt-4">
            {["LOFI10", "LOFI15", "LOFI99K", "FREESHIP"].map((code) => (
            <div key={code} className="bg-gradient-to-r from-pink-500 to-purple-700 text-white rounded-lg p-3 flex flex-col items-center relative">
                <div className="absolute right-2 top-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                </div>
                <span className="font-bold">Nhập mã: {code}</span>
                <span className="text-xs text-center my-1">
                {code === "LOFI10" && "Mã giảm 10% cho đơn hàng từ 500k trở lên."}
                {code === "LOFI15" && "Mã giảm 15% cho đơn hàng từ 1 triệu trở lên."}
                {code === "LOFI99K" && "Mã giảm 99k cho đơn hàng từ 700k trở lên."}
                {code === "FREESHIP" && "Miễn phí vận chuyển cho đơn hàng từ 500k."}
                </span>
                <button 
                className="mt-1 bg-white text-purple-500 font-semibold rounded px-3 py-0.5 text-xs"
                onClick={() => handleCopyCode(code)}
                >
                {copied === code ? "ĐÃ SAO CHÉP" : "SAO CHÉP MÃ"}
                </button>
            </div>
            ))}
        </div>
        
        {/* Hot deals section - Parallel to the above content */}
        <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="font-bold text-pink-600 flex items-center gap-1">
                <span className="bg-pink-500 text-white rounded-full px-2 py-0.5 text-xs">HOT</span>
                Ưu đãi hot! Đừng bỏ lỡ
                </h3>
            </div>
            <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-sm flex flex-col relative border border-gray-100 overflow-hidden">
                    <div className="absolute bottom-2 left-2 bg-pink-500 text-white text-xs rounded-full px-2 py-0.5 flex items-center">
                    <span className="mr-1">♥</span> 430K
                    </div>
                    <img 
                    src={`/hot-deal-${idx}.jpg`}
                    alt={`Hot deal ${idx}`}
                    className="w-full h-40 object-cover"
                    />
                </div>
                ))}
            </div>
            </div>

            {/* Best sellers section */}
            <div className="mt-6">
                <h3 className="font-bold text-pink-600 mb-3 flex items-center gap-1">
                <span>🎁</span> Quà tặng đặt nhiều nhất trong tháng
                </h3>

                {/* Thêm khối cha để chia thành 2 cột: bên trái ảnh, bên phải sản phẩm */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Cột trái - Ảnh giảm giá */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <img 
                    src="/path-to-your-sale-image.jpg" 
                    alt="Giảm giá 50%" 
                    className="w-full h-full object-cover rounded-lg"
                    />
                </div>

                {/* Cột phải - Sản phẩm - gộp thành 2 cột nhỏ */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                    { id: 1, name: "Bộ quà tặng Luvgift Sweet things", price: "210.000₫", originalPrice: "350.000₫", discount: "-40%", image: "" },
                    { id: 2, name: "Bộ chăm sóc da mặt cây lăn đá thạch anh chống lão hóa", price: "165.000₫", originalPrice: "", discount: "", image: ""  },
                    { id: 3, name: "Set quà tặng bạn gái hoa sáp kèm tinh dầu", price: "210.000₫", originalPrice: "", discount: "", image: ""  },
                    { id: 4, name: "Set 4 món bước tóc, bịt mắt, băng đô vải lụa cao cấp", price: "130.000₫", originalPrice: "", discount: "", image: ""  },
                    { id: 5, name: "Bộ quà tặng nến sáp thơm khu rừng tre Panda", price: "395.000₫", originalPrice: "", discount: "", image: ""  },
                    { id: 6, name: "Đèn ngủ silicon đá màu Thỏ Mập dễ thương", price: "360.000₫", originalPrice: "", discount: "", image: ""  }
                    ].map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm flex border border-gray-100 overflow-hidden hover:shadow-md transition-shadow w-[350px]">
                        <div className="w-1/3 p-2">
                        <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center relative">
                            {/* Image placeholder */}
                            <img 
                            src={product.image || "/placeholder.png"} 
                            alt={product.name} 
                            className="object-cover w-full h-full"
                            />
                            
                            {/* Heart icon for favorites */}
                            <button 
                              className={`absolute top-2 right-2 rounded-full w-6 h-6 flex items-center justify-center transition-colors ${
                                isInFavorites(product.id) ? 'bg-pink-500 text-white' : 'bg-white text-pink-500 border border-pink-300'
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleFavoriteToggle({
                                  id: product.id,
                                  name: product.name,
                                  price: parseFloat(product.price.replace(/[^\d]/g, '')),
                                  originalPrice: product.originalPrice ? parseFloat(product.originalPrice.replace(/[^\d]/g, '')) : undefined,
                                  discount: product.discount,
                                  image: product.image || "/placeholder.png"
                                });
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={isInFavorites(product.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                        </div>
                        </div>
                        <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                        <h3 className="font-medium text-gray-800 text-sm">{product.name}</h3>
                        <div className="flex items-center mt-2 justify-between">
                            <div className="flex flex-col">
                            <span className="text-pink-600 font-bold">{product.price}</span>
                            {product.originalPrice && (
                                <div className="flex items-center mt-1">
                                <span className="text-gray-400 line-through text-xs">{product.originalPrice}</span>
                                <span className="bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded ml-2">{product.discount}</span>
                                </div>
                            )}
                            </div>
                            <button 
                            className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-pink-600 transition-colors"
                            onClick={() => addToCart({
                              id: product.id,
                              name: product.name,
                              price: parseFloat(product.price.replace(/[^\d]/g, '')),
                              originalPrice: product.originalPrice ? parseFloat(product.originalPrice.replace(/[^\d]/g, '')) : undefined,
                              discount: product.discount,
                              image: product.image || "/placeholder.png"
                            })}
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            </button>
                        </div>
                        {product.id !== 1 && (
                            <div className="flex items-center mt-1">
                            <span className="text-orange-500 text-xs flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Gói quà miễn phí
                            </span>
                            </div>
                        )}
                        </div>
                    </div>

                    </div>
                    ))}
                </div>

            </div>

            <div className="flex justify-center mt-6">
            <button className="bg-pink-500 text-white rounded-full px-6 py-2 text-sm">Xem tất cả</button>
            </div>
            </div>

            {/* Special offers section */}
            <div className="mt-6">
            <div className="bg-gradient-to-r from-pink-500 to-purple-700 rounded-lg p-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="text-white text-2xl">🎁</div>
                    <h3 className="font-bold text-white text-xl">ƯU ĐÃI ĐỘC QUYỀN GIẢM CHẤT ĐẾN 50%</h3>
                </div>
                <div className="text-xs text-white mt-2 md:mt-0">
                    Sản phẩm sale đến khi hết hàng. Tiết kiệm đến 50%, đừng bỏ lỡ bạn ơi...
                </div>
                <div className="flex gap-2 mt-3 md:mt-0">
                    <CountdownTimer />
                </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { id: 1, name: "Bộ quà tặng Luvgift Sweet things", price: 210000, originalPrice: 350000, discount: "-40%" },
                    { id: 2, name: "Set quà trí ẩn cô giáo tặng cậu em", price: 500000, originalPrice: 550000, discount: "-10%" },
                    { id: 3, name: "Set quà truyền động lực", price: 190000, originalPrice: 250000, discount: "-24%" },
                    { id: 4, name: "Set quà tặng sinh nhật GS1028", price: 165000, originalPrice: 195000, discount: "-15%" },
                    { id: 5, name: "Set quà tặng phụ nữ GS1041", price: 356000, originalPrice: 460000, discount: "-22%" }
                ].map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm flex flex-col border border-gray-100 hover:shadow-md transition-shadow overflow-hidden relative p-2">
                    <div className="w-full h-32 bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden relative">
                        {/* Image placeholder */}
                        <img src={"/placeholder.png"} alt={product.name} className="object-cover w-full h-full" />
                        
                        {/* Heart icon for favorites */}
                        <button 
                          className={`absolute top-2 right-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
                            isInFavorites(product.id) ? 'bg-pink-500 text-white' : 'bg-white text-pink-500 border border-pink-300'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleFavoriteToggle(product);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isInFavorites(product.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                    </div>

                    <div className="flex flex-col justify-between flex-1">
                        <h3 className="text-xs font-medium line-clamp-2 mb-2">{product.name}</h3>

                        <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-pink-600 font-bold text-sm">{product.price.toLocaleString()}₫</span>
                            {product.originalPrice && (
                            <div className="flex items-center mt-1">
                                <span className="text-gray-400 line-through text-xs">{product.originalPrice.toLocaleString()}₫</span>
                                <span className="bg-pink-500 text-white text-[10px] px-1 rounded ml-1">{product.discount}</span>
                            </div>
                            )}
                        </div>

                        {/* Nút icon giỏ hàng */}
                        <button 
                            className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-pink-600 transition-colors ml-2"
                            onClick={() => addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              originalPrice: product.originalPrice,
                              discount: product.discount,
                              image: "/placeholder.png"
                            })}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </button>
                        </div>

                        {/* Gói quà miễn phí */}
                        <div className="text-orange-500 text-xs flex items-center gap-1 mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Gói quà miễn phí
                        </div>
                    </div>
                    </div>
                ))}
                </div>

                <div className="flex justify-center mt-4">
                <button className="bg-white text-pink-600 rounded-full px-6 py-1 text-sm">Xem tất cả</button>
                </div>
            </div>
            </div>

            {/* Gift categories sections */}
        {["Đuổi Đêm Đón Đỏ >>> Rước Ngay Mèo Thần Tài", "Quà Tặng Sinh Nhật Ý Nghĩa"].map((title, idx) => (
            <div key={idx} className="mt-6">
            <h3 className="font-bold text-pink-600 mb-3 flex items-center gap-1">
                <span>🎁</span> {title}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { id: 1, name: "Bộ quà tặng Luvgift Sweet things", price: 210000, originalPrice: 350000, discount: "-40%" },
                    { id: 2, name: "Set quà trí ẩn cô giáo tặng cậu em", price: 500000, originalPrice: 550000, discount: "-10%" },
                    { id: 3, name: "Set quà truyền động lực", price: 190000, originalPrice: 250000, discount: "-24%" },
                    { id: 4, name: "Set quà tặng sinh nhật GS1028", price: 165000, originalPrice: 195000, discount: "-15%" },
                    { id: 5, name: "Set quà tặng phụ nữ GS1041", price: 356000, originalPrice: 460000, discount: "-22%" }
                ].map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm flex flex-col border border-gray-100 hover:shadow-md transition-shadow overflow-hidden relative p-2">
                    <div className="w-full h-32 bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden relative">
                        {/* Image placeholder */}
                        <img src={"/placeholder.png"} alt={product.name} className="object-cover w-full h-full" />
                        
                        {/* Heart icon for favorites */}
                        <button 
                          className={`absolute top-2 right-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
                            isInFavorites(product.id) ? 'bg-pink-500 text-white' : 'bg-white text-pink-500 border border-pink-300'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleFavoriteToggle(product);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isInFavorites(product.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                    </div>

                    <div className="flex flex-col justify-between flex-1">
                        <h3 className="text-xs font-medium line-clamp-2 mb-2">{product.name}</h3>

                        <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-pink-600 font-bold text-sm">{product.price.toLocaleString()}₫</span>
                            {product.originalPrice && (
                            <div className="flex items-center mt-1">
                                <span className="text-gray-400 line-through text-xs">{product.originalPrice.toLocaleString()}₫</span>
                                <span className="bg-pink-500 text-white text-[10px] px-1 rounded ml-1">{product.discount}</span>
                            </div>
                            )}
                        </div>

                        {/* Nút icon giỏ hàng */}
                        <button 
                            className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-pink-600 transition-colors ml-2"
                            onClick={() => addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              originalPrice: product.originalPrice,
                              discount: product.discount,
                              image: "/placeholder.png"
                            })}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </button>
                        </div>

                        {/* Gói quà miễn phí */}
                        <div className="text-orange-500 text-xs flex items-center gap-1 mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Gói quà miễn phí
                        </div>
                    </div>
                    </div>
                ))}
                </div>

                <div className="flex justify-center mt-4">
                <button className="bg-white text-pink-600 rounded-full px-6 py-1 text-sm">Xem tất cả</button>
                </div>
            </div>
            
        ))}
        </div>
    </>
);
};

