// src/pages/ProductDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { ProductType } from "../types/Product";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Giả định về ảnh thumbnail
  const thumbnailImages = [
    "/assets/flower-thumb-1.jpg",
    "/assets/flower-thumb-2.jpg",
    "/assets/flower-thumb-3.jpg",
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        console.log("Product data:", res.data);
        setProduct(res.data);
        setSelectedImage(res.data.image || "/placeholder.png");
      } catch (error) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", error);
        setError("Lỗi khi tải sản phẩm. Vui lòng thử lại sau.");
        toast.error("Lỗi khi tải sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setError("Không tìm thấy ID sản phẩm.");
      setIsLoading(false);
    }
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="p-8 rounded-lg shadow-lg bg-white border border-red-100 max-w-md">
          <div className="text-red-500 flex items-center gap-3 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
          </div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-md hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    addToCart(
      {
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        image: product.image || "/placeholder.png",
      },
      quantity
    );
    toast.success("Đã thêm sản phẩm vào giỏ hàng");
  };

  const handleFavoriteToggle = () => {
    if (isInFavorites(product._id)) {
      removeFromFavorites(product._id);
      toast.info("Đã xóa sản phẩm khỏi danh sách yêu thích");
    } else {
      addToFavorites({
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        image: product.image || "/placeholder.png",
      });
      toast.success("Đã thêm sản phẩm vào danh sách yêu thích");
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  // Định dạng giá tiền
  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Hiệu ứng hiển thị phần tử
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Breadcrumb với thiết kế mới */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex py-4">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="text-gray-500 hover:text-pink-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li>
                <Link to="/products" className="text-gray-500 hover:text-pink-600 transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li>
                <span className="text-pink-600 font-medium">{product.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery Section */}
            <motion.div 
              className="p-6 md:p-8 bg-gradient-to-br from-rose-50 to-pink-50"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="aspect-w-1 aspect-h-1 mb-6 rounded-xl overflow-hidden shadow-lg bg-white">
                <img
                  src={selectedImage || product.image || "/placeholder.png"}
                  alt={product.name}
                  className="object-contain w-full h-full transform transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    console.error("Lỗi tải ảnh:", product.image);
                    e.currentTarget.src = "/placeholder.png";
                  }}
                />
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-4">
                <div 
                  className={`aspect-w-1 aspect-h-1 cursor-pointer rounded-lg overflow-hidden border-2 ${selectedImage === product.image ? 'border-pink-500' : 'border-transparent'}`}
                  onClick={() => setSelectedImage(product.image || "/placeholder.png")}
                >
                  <img 
                    src={product.image || "/placeholder.png"} 
                    alt={product.name} 
                    className="object-cover w-full h-full"
                  />
                </div>
                
                {/* Giả định về ảnh thumbnail */}
                {thumbnailImages.map((img, index) => (
                  <div 
                    key={index}
                    className={`aspect-w-1 aspect-h-1 cursor-pointer rounded-lg overflow-hidden border-2 ${selectedImage === img ? 'border-pink-500' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} - view ${index + 1}`} 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Product Info Section */}
            <motion.div 
              className="p-6 md:p-8 flex flex-col"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2 } }
              }}
            >
              {/* Product badges & favorite */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    Hoa tươi
                  </span>
                  {product.discount && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.discount}
                    </span>
                  )}
                </div>
                
                <button
                  className={`rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 ${
                    isInFavorites(product._id)
                      ? "bg-pink-500 text-white shadow-md"
                      : "bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
                  }`}
                  onClick={handleFavoriteToggle}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill={isInFavorites(product._id) ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              {/* Product title */}
              <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">{product.name}</h1>
              
              {/* Price section */}
              <div className="flex items-center gap-3 mb-6">
                <div className="text-3xl font-bold text-pink-600">{formatCurrency(product.price)}</div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-lg text-gray-400 line-through">
                    {formatCurrency(product.originalPrice)}
                  </div>
                )}
              </div>

              {/* Product code */}
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>Mã sản phẩm: <span className="font-medium">{product._id}</span></span>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6"></div>

              {/* Product details */}
              <div className="space-y-5 mb-8">
                {/* For rooms */}
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-pink-100 p-2 mt-1">
                    <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Dành cho phòng</h3>
                    <p className="text-gray-600 mt-1">
                      {product.forRooms?.length ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {product.forRooms.map((room, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              {room}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "Thích hợp với mọi không gian"
                      )}
                    </p>
                  </div>
                </div>

                {/* Occasions */}
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-pink-100 p-2 mt-1">
                    <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Nhân dịp</h3>
                    <p className="text-gray-600 mt-1">
                      {product.occasions?.length ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {product.occasions.map((occasion, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              {occasion}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "Phù hợp mọi dịp"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery info */}
              <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg mb-6">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Giao hàng miễn phí trong ngày</span>
              </div>

              {/* Quantity selector */}
              <div className="mb-8">
                <h3 className="font-medium text-gray-800 mb-2">Số lượng</h3>
                <div className="flex items-center">
                  <button
                    onClick={decreaseQuantity}
                    className="w-10 h-10 rounded-l-lg bg-pink-100 hover:bg-pink-200 text-pink-600 flex items-center justify-center transition-colors"
                    disabled={quantity <= 1}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value > 0) {
                        setQuantity(value);
                      }
                    }}
                    className="w-16 h-10 border-t border-b border-gray-300 text-center font-medium focus:outline-none focus:ring-0"
                  />
                  <button
                    onClick={increaseQuantity}
                    className="w-10 h-10 rounded-r-lg bg-pink-100 hover:bg-pink-200 text-pink-600 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <button
                  className="py-3 px-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  onClick={handleBuyNow}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  MUA NGAY
                </button>
                <button
                  className="py-3 px-6 border-2 border-pink-500 text-pink-500 rounded-lg font-medium hover:bg-pink-50 transition-all duration-300 flex items-center justify-center gap-2"
                  onClick={handleAddToCart}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  THÊM VÀO GIỎ
                </button>
              </div>

              {/* Benefits */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="rounded-full bg-pink-100 p-2 flex-shrink-0">
                    <svg className="w-4 h-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm">Gói quà miễn phí</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="rounded-full bg-pink-100 p-2 flex-shrink-0">
                    <svg className="w-4 h-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-sm">Đảm bảo chất lượng</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="rounded-full bg-pink-100 p-2 flex-shrink-0">
                    <svg className="w-4 h-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm">Thiệp theo yêu cầu</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="rounded-full bg-pink-100 p-2 flex-shrink-0">
                    <svg className="w-4 h-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <span className="text-sm">Thanh toán an toàn</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Description Section */}
        <motion.div 
          className="mt-12 bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Mô tả sản phẩm</h2>
          <div className="prose max-w-none text-gray-600">
            <p>
              {product.description || 
              `${product.name} là lựa chọn hoàn hảo cho những người muốn thể hiện tình yêu thương và sự quan tâm của mình. 
              Được chọn lọc kỹ càng từ những bông hoa tươi nhất, sản phẩm này sẽ mang đến niềm vui và hạnh phúc cho người nhận.`}
            </p>
            <p>
              Sản phẩm được thiết kế tỉ mỉ bởi các nghệ nhân cắm hoa chuyên nghiệp, đảm bảo mỗi chi tiết đều hoàn hảo 
              và thể hiện được thông điệp mà bạn muốn gửi gắm.
            </p>
          </div>
          
          {/* Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="text-pink-500 mb-4">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Hoa tươi mỗi ngày</h3>
              <p className="text-gray-600 text-sm">
                Chúng tôi cam kết chỉ sử dụng những bông hoa tươi mới nhất, được chọn lọc kỹ lưỡng mỗi ngày để đảm bảo độ tươi và vẻ đẹp lâu dài.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="text-pink-500 mb-4">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Giao hàng nhanh chóng</h3>
              <p className="text-gray-600 text-sm">
                Dịch vụ giao hàng trong ngày để đảm bảo bó hoa đến tay người nhận trong tình trạng tươi mới nhất.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="text-pink-500 mb-4">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Cam kết chất lượng</h3>
              <p className="text-gray-600 text-sm">
                Đảm bảo sự hài lòng với chính sách bảo hành và hỗ trợ sau bán hàng tận tâm từ đội ngũ chuyên nghiệp.
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Related Products Section */}
        <motion.div 
          className="mt-12 bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sản phẩm liên quan</h2>
            <Link to="/products" className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1">
              Xem tất cả
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Related Product Card Examples */}
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="group relative rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="aspect-w-1 aspect-h-1 bg-gray-100">
                  <img 
                    src={`/assets/related-product-${index + 1}.jpg`} 
                    alt={`Related product ${index + 1}`}
                    className="w-full h-full object-cover object-center group-hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <button className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-pink-500 hover:text-pink-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-1 line-clamp-2">Bó hoa mẫu {index + 1}</h3>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-pink-600">{(350000 + index * 50000).toLocaleString()}₫</div>
                    <button className="text-pink-600 hover:text-pink-700">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Review Section */}
        <motion.div 
          className="mt-12 bg-white rounded-2xl shadow-lg p-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Đánh giá & Nhận xét</h2>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3 flex flex-col items-center">
              <div className="text-5xl font-bold text-pink-600 mb-2">4.8</div>
              <div className="flex items-center gap-1 mb-4">
                {Array(5).fill(0).map((_, index) => (
                  <svg key={index} className={`w-5 h-5 ${index < 5 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="text-sm text-gray-600 mb-6">Dựa trên 28 đánh giá</div>
              
              <div className="w-full space-y-2">
                {Array(5).fill(0).map((_, index) => (
                  <div key={5 - index} className="flex items-center gap-2">
                    <div className="text-sm text-gray-600 w-2">{5 - index}</div>
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-500 rounded-full" 
                        style={{ width: `${index === 0 ? '70%' : index === 1 ? '20%' : index === 2 ? '5%' : index === 3 ? '3%' : '2%'}` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 w-8">
                      {index === 0 ? '70%' : index === 1 ? '20%' : index === 2 ? '5%' : index === 3 ? '3%' : '2%'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-full lg:w-2/3">
              <div className="bg-pink-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-800 mb-2">Viết đánh giá của bạn</h3>
                <div className="flex items-center gap-1 mb-3">
                  {Array(5).fill(0).map((_, index) => (
                    <button key={index} className="text-gray-300 hover:text-yellow-400 focus:outline-none">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..." 
                  rows={4}
                ></textarea>
                <button className="mt-3 bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors">
                  Gửi đánh giá
                </button>
              </div>
              
              {/* Review examples */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-800">Nguyễn Thị Hương</div>
                      <div className="text-sm text-gray-500">18/04/2023</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array(5).fill(0).map((_, index) => (
                        <svg key={index} className={`w-4 h-4 ${index < 5 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Sản phẩm rất đẹp và tươi, được gói cẩn thận. Người nhận rất thích và cảm động. Sẽ tiếp tục ủng hộ shop trong tương lai!
                  </p>
                </div>
                
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-800">Trần Văn Nam</div>
                      <div className="text-sm text-gray-500">02/04/2023</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array(5).fill(0).map((_, index) => (
                        <svg key={index} className={`w-4 h-4 ${index < 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Giao hàng nhanh chóng, đúng hẹn. Hoa tươi và đẹp như hình. Chỉ có điều thiệp kèm theo hơi đơn giản. Nhưng nhìn chung vẫn rất hài lòng.
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-800">Lê Thị Minh</div>
                      <div className="text-sm text-gray-500">25/03/2023</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array(5).fill(0).map((_, index) => (
                        <svg key={index} className={`w-4 h-4 ${index < 5 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Đây là lần thứ ba tôi đặt hoa ở đây và luôn hài lòng với chất lượng. Bó hoa đẹp, tươi và thơm. Nhân viên giao hàng cũng rất lịch sự và chuyên nghiệp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <button className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    </div>
  );
}