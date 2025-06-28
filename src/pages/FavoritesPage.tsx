import React from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { favoriteItems, removeFromFavorites, totalFavoriteItems } = useFavorites();
  const { addToCart } = useCart();

  // Function to handle adding product to cart
  const handleAddToCart = (product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: string;
    image: string;
  }) => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      image: product.image
    });
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
          <span className="text-pink-600 font-medium">Sản phẩm yêu thích</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="w-full max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Danh sách yêu thích của tôi</h1>

        {favoriteItems.length === 0 ? (
          <div className="w-full py-16 flex flex-col items-center justify-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-lg font-medium mb-2">Bạn chưa có sản phẩm yêu thích nào</p>
            <p className="mb-4">Hãy thêm sản phẩm vào danh sách yêu thích để xem sau</p>
            <button 
              className="bg-pink-500 text-white px-6 py-2 rounded-md font-medium hover:bg-pink-600 transition-colors"
              onClick={() => navigate('/list')}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden relative group">
                <div className="absolute top-2 right-2 z-10">
                  <button 
                    className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-pink-600 transition-colors"
                    onClick={() => removeFromFavorites(item._id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                
                <a href={`/product/${item._id}`} className="block">
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="max-h-full max-w-full object-cover" />
                  </div>
                </a>
                
                <div className="p-4">
                  <a href={`/product/${item._id}`} className="block">
                    <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{item.name}</h3>
                  </a>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-pink-600 font-bold">{item.price.toLocaleString()}₫</div>
                      {item.originalPrice && (
                        <div className="flex items-center mt-1">
                          <span className="text-gray-400 line-through text-xs">{item.originalPrice.toLocaleString()}₫</span>
                          <span className="bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded ml-2">{item.discount}</span>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-pink-600 transition-colors"
                      onClick={() => handleAddToCart(item)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}