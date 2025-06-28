import React, { useState, useEffect } from "react";
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useNavigate } from "react-router-dom";

export default function ProductListPage() {
  // Hooks
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const navigate = useNavigate();
  
  // State for products
  const [products, setProducts] = useState([
    { id: 1, name: "Bộ quà tặng Luvgift Sweet things", price: 210000, originalPrice: 350000, discount: "-40%" },
    { id: 2, name: "Set quà trí ẩn cô giáo tặng cậu em", price: 500000, originalPrice: 550000, discount: "-10%" },
    { id: 3, name: "Set quà truyền động lực", price: 190000, originalPrice: 250000, discount: "-24%" },
    { id: 4, name: "Set quà tặng sinh nhật GS1028", price: 165000, originalPrice: 195000, discount: "-15%" },
    { id: 5, name: "Set quà tặng phụ nữ GS1041", price: 356000, originalPrice: 460000, discount: "-22%" },
    { id: 6, name: "Set quà tặng Valentine", price: 280000, originalPrice: 320000, discount: "-12%" },
    { id: 7, name: "Bộ quà tặng Luvgift Deluxe", price: 450000, originalPrice: 550000, discount: "-18%" },
    { id: 8, name: "Set quà tặng kỷ niệm", price: 320000, originalPrice: 380000, discount: "-16%" },
  ]);

  // State for filtered products
  const [filteredProducts, setFilteredProducts] = useState(products);
  
  // State for price filter
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  
  // State for sort dropdown
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState("Mặc định");

  // Price ranges for filtering
  const priceRanges = [
    { label: "Dưới 500.000₫", value: "0-500000" },
    { label: "500.000₫ - 1.000.000₫", value: "500000-1000000" },
    { label: "1.000.000₫ - 2.000.000₫", value: "1000000-2000000" },
    { label: "2.000.000₫ - 5.000.000₫", value: "2000000-5000000" },
    { label: "5.000.000₫ - 7.000.000₫", value: "5000000-7000000" },
    { label: "Trên 7.000.000₫", value: "7000000-999999999" },
  ];

  // Sort options
  const sortOptions = [
    "Mặc định",
    "A → Z",
    "Z → A",
    "Giá tăng dần",
    "Giá giảm dần",
    "Hàng mới nhất",
    "Hàng cũ nhất"
  ];

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];
    
    // Apply price filter
    if (priceFilter) {
      const [min, max] = priceFilter.split('-').map(Number);
      result = result.filter(product => product.price >= min && product.price <= max);
    }
    
    // Apply sorting
    switch (sortOption) {
      case "A → Z":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Z → A":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Giá tăng dần":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Giá giảm dần":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Hàng mới nhất":
        result.sort((a, b) => b.id - a.id);
        break;
      case "Hàng cũ nhất":
        result.sort((a, b) => a.id - b.id);
        break;
      default:
        // Default sorting (by id)
        result.sort((a, b) => a.id - b.id);
    }
    
    setFilteredProducts(result);
  }, [products, priceFilter, sortOption]);

  // Define a Product interface
  interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: string;
    image?: string;
  }

  // Function to handle adding product to cart and navigating to cart page
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      image: "/placeholder.png"
    });
    // Remove the navigation to cart page
    // navigate('/cart');
  };
  
  // Function to handle favorites
  const handleFavoriteToggle = (product: Product) => {
    if (isInFavorites(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        image: "/placeholder.png"
      });
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[50vh]">
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
          <span className="text-pink-600 font-medium">Set quà tặng</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar - Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            {/* Price filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h3 className="font-bold text-gray-700 mb-3">Chọn mức giá</h3>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <div key={range.value} className="flex items-center">
                    <input
                      type="radio"
                      id={`price-${range.value}`}
                      name="price-range"
                      className="mr-2 accent-pink-500"
                      checked={priceFilter === range.value}
                      onChange={() => setPriceFilter(range.value)}
                    />
                    <label htmlFor={`price-${range.value}`} className="text-sm text-gray-700">
                      {range.label}
                    </label>
                  </div>
                ))}
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="price-all"
                    name="price-range"
                    className="mr-2 accent-pink-500"
                    checked={priceFilter === null}
                    onChange={() => setPriceFilter(null)}
                  />
                  <label htmlFor="price-all" className="text-sm text-gray-700">
                    Tất cả mức giá
                  </label>
                </div>
              </div>
            </div>

            {/* Color filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h3 className="font-bold text-gray-700 mb-3">Màu sắc</h3>
              <div className="flex flex-wrap gap-2">
                {['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'black', 'white'].map((color) => (
                  <div 
                    key={color} 
                    className={`w-6 h-6 rounded-full cursor-pointer border border-gray-200`}
                    style={{ backgroundColor: color }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Right content - Product list */}
          <div className="flex-1">
            <div className="w-full bg-pink-100 py-4 rounded-lg shadow mb-4">
                <div className="relative overflow-hidden px-6 py-8 bg-[url('/placeholder.png')] bg-cover bg-center rounded-lg">
                <div className="bg-white/70 p-6 rounded-md text-center">
                    <h1 className="text-2xl font-bold text-pink-600 mb-1">Chúc mừng 20/10</h1>
                    <p className="text-sm text-pink-600 mb-3">Trao tặng những món quà ý nghĩa cho người phụ nữ thân yêu của bạn</p>
                    <button className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm hover:bg-pink-600 transition">
                    XEM CHI TIẾT
                    </button>
                </div>
                </div>
            </div>
            {/* Sorting and view options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <div className="text-xl font-bold text-gray-700">Set quà tặng</div>
              
              <div className="flex items-center gap-4">
                {/* Sort dropdown */}
                <div className="relative">
                  <button 
                    className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1.5 text-sm"
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  >
                    <span>Sắp xếp theo: </span>
                    <span className="font-medium">{sortOption}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {sortDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                      {sortOptions.map((option) => (
                        <div 
                          key={option}
                          className="px-4 py-2 text-sm hover:bg-pink-50 cursor-pointer"
                          onClick={() => {
                            setSortOption(option);
                            setSortDropdownOpen(false);
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* View options */}
                <div className="flex items-center gap-2">
                  <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button className="p-1.5 border border-gray-300 rounded bg-pink-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Product grid */}
            {filteredProducts.length === 0 ? (
              <div className="w-full py-16 flex justify-center items-center text-gray-500 text-lg font-medium">
                Cửa hàng đang cập nhật sản phẩm
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
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
                          onClick={() => handleAddToCart(product)}
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
            )}
            
            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-pink-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md bg-pink-500 text-white">1</button>
                <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-pink-50">2</button>
                <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-pink-50">3</button>
                <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-pink-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}