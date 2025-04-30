import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("info");
  const [activeImage, setActiveImage] = useState(0);

  // Product data (this would normally come from an API or props)
  const product = {
    id: 1,
    name: "Bộ quà tặng Luvgift Sweet things",
    price: 210000,
    originalPrice: 350000,
    discount: "-40%",
    code: "Luv197",
    images: [
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
    ],
    description: "Ngọt là hương gu phát đầu là những \"tầng trụy yêu kiều\" hòa lẫn với nét hồi teen thuở còn cấp ba cùng là ngọn nguồn của mọi cảm hứng sáng tạo nghệ thuật. Chính vì thế khi phẩm đằng được chọn những món quà xinh xinh này sẽ là món quà ý nghĩa.",
    details: [
      "Hộp kraft nắp mở kính kèm túi H27 màu nâu",
      "Hộ đèn thơm hộp nắu Mèo nhảy dễ thương (Phụ kiện nhựa mềm cập nhật)",
      "Kem dưỡng tay chất xuất bơ hạt mỡ LAIKOU",
      "Khăn mặt hợp quà màu be",
      "Bộ hoa khô nghệ thuật"
    ],
    forRooms: ["Cơ quan, Văn phòng nghiệp vụ, Spa, phòng ngủ, phòng khách"],
    occasions: ["Ngày 20/11, Ngày 20/10, Ngày 8/3, Valentine +14/2, Sinh nhật, Yêu xa"]
  };

  // Related products
  const relatedProducts = [
    { id: 1, name: "Set dụng cụ chăm sóc da dầu đá thạch anh chống lão hóa", price: 164000, originalPrice: 200000, discount: "-18%" },
    { id: 2, name: "Bộ quà tặng Luvgift Sweet things", price: 210000, originalPrice: 350000, discount: "-40%" },
    { id: 3, name: "Set 4 món bưởi đọc, bát mặt, bông đá vải lụa cao cấp", price: 139000, originalPrice: 180000, discount: "-23%" },
    { id: 4, name: "Set quà tặng dầu dừa dưỡng da trắng mịn Thái Lan", price: 389000, originalPrice: 450000, discount: "-14%" },
    { id: 5, name: "Máy ngủ silicon đa màu Thỏ dễ thương", price: 389000, originalPrice: 450000, discount: "-14%" }
  ];

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  // Function to handle adding product to cart and navigating to cart page
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      image: product.images[0]
    });
    // Remove the navigation to cart page
    // navigate('/cart');
  };

  // Function to handle adding related product to cart
  const handleAddRelatedToCart = (relatedProduct: any) => {
    addToCart({
      id: relatedProduct.id,
      name: relatedProduct.name,
      price: relatedProduct.price,
      originalPrice: relatedProduct.originalPrice,
      discount: relatedProduct.discount,
      image: "/placeholder.png"
    });
  };

  // Function to handle favorites
  const handleFavoriteToggle = (targetProduct: any) => {
    if (isInFavorites(targetProduct.id)) {
      removeFromFavorites(targetProduct.id);
    } else {
      addToFavorites({
        id: targetProduct.id,
        name: targetProduct.name,
        price: targetProduct.price,
        originalPrice: targetProduct.originalPrice,
        discount: targetProduct.discount,
        image: targetProduct.images ? targetProduct.images[0] : "/placeholder.png"
      });
    }
  };

  return (
    <div className="flex flex-col min-h-[50vh]">
      {/* Breadcrumb */}
      <div className="w-full bg-gray-100 flex items-center px-6 py-3 border-b">
        <nav className="flex items-center gap-2 text-sm">
          <a href="/" className="flex items-center gap-1 text-gray-700 hover:text-pink-500 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4" />
            </svg>
            <span className="font-semibold">Trang chủ</span>
          </a>
          <span className="text-gray-400">›</span>
          <a href="/products" className="text-gray-700 hover:text-pink-500 transition-colors">
            Quà tặng 20-10
          </a>
          <span className="text-gray-400">›</span>
          <span className="text-pink-600 font-medium">{product.name}</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto w-full p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column - Product images */}
          <div className="w-full md:w-1/2">
            {/* Main product image */}
            <div className="w-full h-96 bg-gray-100 rounded-md mb-4 flex items-center justify-center overflow-hidden border">
              <img 
                src={product.images[activeImage]} 
                alt={product.name} 
                className="object-contain w-full h-full"
              />
            </div>
            
            {/* Thumbnail images */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`w-24 h-24 rounded overflow-hidden border-2 flex-shrink-0 ${
                    index === activeImage ? 'border-pink-500' : 'border-gray-200'
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} - view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right column - Product details */}
          <div className="w-full md:w-1/2">
            {/* Product info */}
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
                
                {/* Add heart icon */}
                <button 
                  className={`rounded-full w-10 h-10 flex items-center justify-center transition-colors ml-auto ${
                    isInFavorites(product.id) ? 'bg-pink-500 text-white' : 'bg-white text-pink-500 border border-pink-300'
                  }`}
                  onClick={() => handleFavoriteToggle(product)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isInFavorites(product.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Product code */}
            <div className="text-sm text-gray-600 mb-4">
              Mã sản phẩm: <span className="font-medium">{product.code}</span>
            </div>
            
            {/* Dành cho phòng */}
            <div className="mb-4">
              <div className="font-medium text-gray-700 mb-1">Dành cho phòng:</div>
              <div className="text-sm text-gray-600">{product.forRooms}</div>
            </div>
            
            {/* Nhân dịp */}
            <div className="mb-6">
              <div className="font-medium text-gray-700 mb-1">Nhân dịp:</div>
              <div className="text-sm text-gray-600">{product.occasions}</div>
            </div>
            
            {/* Quantity selector */}
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
            
            {/* Action buttons */}
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
            
            {/* Delivery time */}
            <div className="text-sm text-gray-600 mb-6">
              Gửi đặt mua 10/05/2023 (8:00 - 22:00)
            </div>
            
            {/* Free gift wrapping */}
            <div className="flex items-center gap-2 text-orange-500 text-sm mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Gói quà miễn phí
            </div>
          </div>
        </div>
        
        {/* Related products */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tham khảo thêm sản phẩm khác</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm flex flex-col border border-gray-100 hover:shadow-md transition-shadow overflow-hidden relative p-2">
                <div className="w-full h-32 bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden relative">
                  {/* Image placeholder */}
                  <img src={"/placeholder.png"} alt={product.name} className="object-cover w-full h-full" />
                  
                  {/* Heart icon absolutely positioned top right */}
                  <button 
                    className={`absolute top-2 right-2 rounded-full w-10 h-10 flex items-center justify-center transition-colors ${
                      isInFavorites(product.id) ? 'bg-pink-500 text-white' : 'bg-white text-pink-500 border border-pink-300'
                    }`}
                    onClick={() => handleFavoriteToggle(product)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isInFavorites(product.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
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
                      onClick={() => handleAddRelatedToCart(product)}
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
        </div>
      </div>
    </div>
  );
}
