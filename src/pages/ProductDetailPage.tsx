// src/pages/ProductDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useReviews } from "../contexts/ReviewsContext";
import { ProductType } from "../types/Product";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { FaStar, FaRegStar, FaStarHalfAlt, FaUser, FaClock } from "react-icons/fa";

// Review interface
interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Review stats interface
interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: {
    [key: number]: number;
  };
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const { 
    reviews, 
    reviewStats = { averageRating: 0, totalReviews: 0, ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }, 
    userReview, 
    isSubmittingReview, 
    showReviewForm, 
    setShowReviewForm,
    fetchProductReviews,
    handleRatingChange,
    handleCommentChange,
    handleSubmitReview,
    formatDate,
    renderStars,
    renderInteractiveStars
  } = useReviews();
  const { user } = useAuth();
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
             
        if (res.data._id) {
          fetchProductReviews(res.data._id);
        }
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
  }, [id, fetchProductReviews]);
  

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
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
    if (!product) return;
    
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

  // Handle review submission with navigation if needed
  const handleSubmitReviewWithNavigation = async (e: React.FormEvent) => {
    e.preventDefault(); // Make sure this is called to prevent page reload
    
    if (!id) return;
    
    const success = await handleSubmitReview(e, id);
    if (!success && !user) {
      navigate("/login");
    }
  };

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
                <Link to="/list" className="text-gray-500 hover:text-pink-600 transition-colors">
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
      
        {/* Related Products Section */}
        <motion.div 
          className="mt-12 bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sản phẩm liên quan</h2>
            {product.category && (
              <Link
                to={`/list?category=${encodeURIComponent(product.category)}`}
                className="text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
              >
                Xem tất cả
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
          <RelatedProducts
            currentProductId={product._id}
            category={product.category}
          />
        </motion.div>
     
       {/* Reviews & Comments Section */}
        <motion.div 
            className="mt-12 bg-white rounded-2xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Đánh giá & Nhận xét</h2>
                  <p className="text-gray-600 mt-1">Xem đánh giá từ khách hàng về sản phẩm này</p>
                </div>
                
                {user && (
                  <button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="mt-4 md:mt-0 px-6 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors shadow-md"
                  >
                    {showReviewForm ? "Hủy đánh giá" : "Viết đánh giá"}
                  </button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <motion.div 
                  className="mb-8 bg-pink-50 p-6 rounded-xl"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Đánh giá của bạn</h3>
                  <form onSubmit={handleSubmitReviewWithNavigation}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Xếp hạng</label>
                      <div className="flex gap-2">
                        {renderInteractiveStars()}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="comment" className="block text-gray-700 mb-2">
                        Nhận xét của bạn
                      </label>
                      <textarea
                        id="comment"
                        rows={4}
                        value={userReview.comment}
                        onChange={handleCommentChange}
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className={`px-6 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors shadow-md ${
                        isSubmittingReview ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Review Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="col-span-1 flex flex-col items-center justify-center bg-gray-50 p-6 rounded-xl">
                  <div className="text-5xl font-bold text-pink-600 mb-2">
                    {reviewStats.averageRating.toFixed(1)}
                  </div>
                  <div className="flex mb-2">
                    {renderStars(reviewStats.averageRating)}
                  </div>
                  <div className="text-gray-600 text-sm">
                    Dựa trên {reviewStats.totalReviews} đánh giá
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = reviewStats.ratingCounts[rating] || 0;
                      const percentage = reviewStats.totalReviews > 0 
                        ? (count / reviewStats.totalReviews) * 100 
                        : 0;
                      
                      return (
                        <div key={rating} className="flex items-center">
                          <div className="flex items-center w-20">
                            <span className="text-sm text-gray-600 mr-2">{rating}</span>
                            <FaStar className="text-yellow-400 text-sm" />
                          </div>
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-16 text-right text-sm text-gray-600">
                            {count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-5xl mb-4">😊</div>
                    <p>Chưa có đánh giá nào cho sản phẩm này</p>
                    <p className="mt-2 text-sm">Hãy là người đầu tiên đánh giá!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id || `${review.userId}-${Date.now()}`} className="border-b pb-6">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mr-3">
                            <FaUser />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{review.userName}</div>
                            <div className="flex mt-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <FaClock className="mr-1" />
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                      <div className="mt-3 text-gray-700 whitespace-pre-line">
                        {review.comment}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination if needed */}
              {reviews.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Xem thêm đánh giá
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

function RelatedProducts({ currentProductId, category }: { currentProductId: string, category?: string }) {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const [related, setRelated] = React.useState<ProductType[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!category) return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/products?category=${encodeURIComponent(category)}`)
      .then(res => {
        // Exclude current product
        setRelated(res.data.filter((p: ProductType) => p._id !== currentProductId).slice(0, 4));
      })
      .catch(() => setRelated([]))
      .finally(() => setLoading(false));
  }, [category, currentProductId]);

  if (loading) {
    return <div className="text-gray-500">Đang tải sản phẩm liên quan...</div>;
  }
  if (!related.length) {
    return <div className="text-gray-400">Không có sản phẩm liên quan.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {related.map((item) => (
        <div key={item._id} className="group relative rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow bg-white">
          <Link to={`/detail/${item._id}`}>
            <div className="aspect-w-1 aspect-h-1 bg-gray-100">
              <img
                src={item.image || "/placeholder.png"}
                alt={item.name}
                className="w-full h-full object-cover object-center group-hover:opacity-90 transition-opacity"
                onError={e => { e.currentTarget.src = "/placeholder.png"; }}
              />
            </div>
          </Link>
          <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
            <button
              className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-colors ${
                isInFavorites(item._id) ? "bg-pink-500 text-white" : "bg-white text-pink-500 border border-pink-300"
              }`}
              onClick={e => {
                e.preventDefault();
                isInFavorites(item._id)
                  ? removeFromFavorites(item._id)
                  : addToFavorites({
                      _id: item._id,
                      name: item.name,
                      price: item.price,
                      originalPrice: item.originalPrice,
                      discount: item.discount,
                      image: item.image || "/placeholder.png",
                    });
              }}
              title={isInFavorites(item._id) ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            >
              <svg className="w-5 h-5" fill={isInFavorites(item._id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button
              className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-pink-500 hover:text-pink-600 transition-colors"
              onClick={e => {
                e.preventDefault();
                addToCart({
                  _id: item._id,
                  name: item.name,
                  price: item.price,
                  originalPrice: item.originalPrice,
                  discount: item.discount,
                  image: item.image || "/placeholder.png",
                });
                
              }}
              title="Thêm vào giỏ hàng"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <Link to={`/detail/${item._id}`}>
              <h3 className="font-medium text-gray-800 mb-1 line-clamp-2">{item.name}</h3>
            </Link>
            <div className="flex items-center justify-between">
              <div className="font-bold text-pink-600">{item.price?.toLocaleString()}₫</div>
              {item.originalPrice && item.originalPrice > item.price && (
                <div className="text-lg text-gray-400 line-through text-xs">
                  {item.originalPrice?.toLocaleString()}₫
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
