import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { ProductType } from '../types/Product';
import { toast } from 'react-toastify';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductType | null>(null);
  // Kiểm tra xem id có hợp lệ không
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        console.log("Product data:", res.data);
        setProduct(res.data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", error);
        toast.error('Lỗi khi tải sản phẩm');
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return <div className="p-6">Đang tải thông tin sản phẩm...</div>;

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      image: product.image || "/placeholder.png",
    }, quantity);
  };

  const handleFavoriteToggle = () => {
    if (isInFavorites(product._id)) {
      removeFromFavorites(product._id);
      toast.info('Đã xóa sản phẩm khỏi danh sách yêu thích');
    } else {
      addToFavorites({
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        image: product.image || "/placeholder.png",
      });
      toast.success('Đã thêm sản phẩm vào danh sách yêu thích');
    }
  };

  return (
    <div className="flex flex-col min-h-[50vh]">
      <div className="w-full bg-gray-100 flex items-center px-6 py-3 border-b">
        <nav className="flex items-center gap-2 text-sm">
          <a href="/" className="flex items-center gap-1 text-gray-700 hover:text-pink-500 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4" />
            </svg>
            <span className="font-semibold">Trang chủ</span>
          </a>
          <span className="text-gray-400">›</span>
          <span className="text-pink-600 font-medium">{product.name}</span>
        </nav>
      </div>
      <div className="max-w-7xl mx-auto w-full p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <div className="w-full h-96 bg-gray-100 rounded-md mb-4 flex items-center justify-center overflow-hidden border">
              <img
                src={product.image || "/placeholder.png"}
                alt={product.name}
                className="object-contain w-full h-full"
                onError={(e) => {
                  console.error("Lỗi tải ảnh:", product.image);
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="flex-1 px-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-2xl font-bold text-pink-600">{product.price.toLocaleString()}₫</div>
                {product.originalPrice && (
                  <>
                    <div className="text-gray-400 line-through">{product.originalPrice.toLocaleString()}₫</div>
                    <div className="bg-pink-500 text-white px-2 py-0.5 rounded">{product.discount}</div>
                  </>
                )}
                <button
                  className={`rounded-full w-10 h-10 flex items-center justify-center transition-colors ml-auto ${
                    isInFavorites(product._id) ? 'bg-pink-500 text-white' : 'bg-white text-pink-500 border border-pink-300'
                  }`}
                  onClick={handleFavoriteToggle}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
              <div className="text-sm text-gray-600 mb-4">
                Mã sản phẩm: <span className="font-medium">{product.code}</span>
              </div>
              <div className="mb-4">
                <div className="font-medium text-gray-700 mb-1">Dành cho phòng:</div>
                <div className="text-sm text-gray-600">{product.forRooms?.join(', ')}</div>
              </div>
              <div className="mb-6">
                <div className="font-medium text-gray-700 mb-1">Nhân dịp:</div>
                <div className="text-sm text-gray-600">{product.occasions?.join(', ')}</div>
              </div>
              <div className="mb-6">
                <div className="font-medium text-gray-700 mb-2">Số lượng:</div>
                <div className="flex items-center">
                  <button
                    onClick={decreaseQuantity}
                    className="w-8 h-8 bg-pink-100 text-pink-600 flex items-center justify-center rounded-l"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-12 h-8 border-t border-b border-gray-300 text-center"
                  />
                  <button
                    onClick={increaseQuantity}
                    className="w-8 h-8 bg-pink-100 text-pink-600 flex items-center justify-center rounded-r"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mb-6">
                <button className="flex-1 bg-pink-500 text-white py-3 rounded-md font-medium hover:bg-pink-600 transition-colors">
                  MUA NGAY
                </button>
                <button
                  className="flex-1 border border-pink-500 text-pink-500 py-3 rounded-md font-medium hover:bg-pink-50 transition-colors"
                  onClick={handleAddToCart}
                >
                  THÊM VÀO GIỎ HÀNG
                </button>
              </div>
              <div className="text-sm text-gray-600 mb-6">
                Gửi đặt mua 10/05/2023 (8:00 - 22:00)
              </div>
              <div className="flex items-center gap-2 text-orange-500 text-sm mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Gói quà miễn phí
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}