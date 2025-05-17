import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useRegion } from "../contexts/RegionContext";

interface ProductSuggestion {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const { cartItems, totalItems, removeFromCart, updateQuantity, totalAmount } = useCart();
  const { totalFavoriteItems } = useFavorites();
  const { user, logout } = useAuth();
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const {selectedDistrict, setSelectedDistrict, selectedWard, setSelectedWard } = useRegion();
  const [showingDistricts, setShowingDistricts] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<{[key: string]: string[]}>({});
  const [districts, setDistricts] = useState<string[]>([]);
  const [wards, setWards] = useState<{ [district: string]: string[] }>({});

  const navigate = useNavigate();
  
  // Thêm useEffect để xử lý tìm kiếm khi người dùng nhập
  useEffect(() => {
    
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      
      try {
        const response = await axios.get(`http://localhost:5000/api/products/search?query=${encodeURIComponent(searchQuery)}`);
        setSuggestions(response.data.slice(0, 5)); // Giới hạn 5 gợi ý
      } catch (error) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", error);
        setSuggestions([]);
      }
    };
    
    // Sử dụng debounce để tránh gọi API quá nhiều
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        
        // Group subcategories by main category
        const groupedCategories: {[key: string]: string[]} = {};
        res.data.forEach((cat: any) => {
          const mainCategory = cat.mainCategory || "Other";
          if (!groupedCategories[mainCategory]) {
            groupedCategories[mainCategory] = [];
          }
          groupedCategories[mainCategory].push(cat.name);
        });
        
        setCategories(groupedCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/stores/regions");
        setWards(res.data);  // object: { "Quận 3": ["Phường 1", "Phường 2", ...], ... }
        setDistricts(Object.keys(res.data));
      } catch (error) {
        console.error("Không thể tải danh sách khu vực:", error);
      }
    };
  
    fetchRegions();
  }, []);
  
  
  const handleCategoryClick = (category: string) => {
    navigate(`/list?category=${encodeURIComponent(category)}`);
  };
  
  const handleSuggestionClick = (query: string) => {
    setSearchQuery("");
    setSuggestions([]);
    navigate(`/search?query=${encodeURIComponent(query)}`);
  };

  const handleDecrease = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  const handleIncrease = (productId: string, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const getWardsForDistrict = (district: string) => {
    return wards[district] || [];
  };
  

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    setShowingDistricts(false);
  };
  const handleWardSelect = (ward: string) => {
    setSelectedWard(ward);
    setAddressModalOpen(false);
  };

  const backToDistricts = () => {
    setShowingDistricts(true);
  };

  const getDisplayAddress = () => {
    if (selectedWard && selectedDistrict) {
      return `${selectedWard}, ${selectedDistrict}`;
    }
    return "Hệ thống cửa hàng";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-inter">
      {/* Header */}
      <header className="w-full bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <img src="/logo-placeholder.png" alt="Gifting" className="h-10 w-10 rounded-full" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
              Gifting
            </span>
          </motion.div>

          {/* Search Bar */}
          <div className="flex-1 mx-4 sm:mx-8 max-w-xl">
            <div className="relative">
              <motion.input
                type="text"
                placeholder="Tìm kiếm quà tặng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 bg-gray-50 text-gray-800 placeholder-gray-400"
                whileFocus={{ scale: 1.02 }}
                aria-label="Tìm kiếm sản phẩm"
              />
              <button
                onClick={() => handleSuggestionClick(searchQuery)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-pink-600 hover:text-pink-700"
                aria-label="Tìm kiếm"
              >
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-full bg-white rounded-lg shadow-xl z-50 mt-2 max-h-80 overflow-y-auto border border-gray-100"
                  >
                    {suggestions.map((suggestion) => (
                      <motion.div
                        key={suggestion._id}
                        className="px-4 py-3 hover:bg-pink-50 cursor-pointer text-sm flex items-center gap-3 transition"
                        onClick={() => handleSuggestionClick(suggestion.name)}
                        whileHover={{ scale: 1.01 }}
                        role="option"
                        aria-selected="false"
                      >
                        <img
                          src={suggestion.image}
                          alt={suggestion.name}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                        <div>
                          <div className="font-medium text-gray-800">{suggestion.name}</div>
                          <div className="text-xs text-gray-500">{suggestion.category}</div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Icons */}
          <nav className="flex items-center gap-4">
            {/* Address Selector */}
            <motion.button
              onClick={() => setAddressModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gray-50 rounded-full text-gray-800 font-medium hover:bg-gray-100 transition shadow-sm"
              whileHover={{ scale: 1.05 }}
              aria-label="Chọn địa điểm giao hàng"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-pink-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm truncate max-w-[150px]">{getDisplayAddress()}</span>
            </motion.button>

            {/* Support */}
            <motion.a
              href="#"
              className="flex items-center gap-2 text-gray-800 hover:text-pink-600 transition"
              whileHover={{ scale: 1.05 }}
              aria-label="Hỗ trợ khách hàng"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="text-sm hidden sm:block">Hỗ trợ</span>
            </motion.a>

            {/* Cart */}
            <div
              className="relative"
              onMouseEnter={() => setCartDropdownOpen(true)}
              onMouseLeave={() => setCartDropdownOpen(false)}
            >
              <motion.button
                className="flex items-center gap-2 text-gray-800 hover:text-pink-600 transition"
                onClick={() => navigate("/cart")}
                whileHover={{ scale: 1.05 }}
                aria-label={`Giỏ hàng (${totalItems} sản phẩm)`}
              >
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-pink-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  {totalItems > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </div>
                <span className="text-sm hidden sm:block">Giỏ hàng</span>
              </motion.button>
              <AnimatePresence>
                {cartDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-50 border border-gray-100"
                    onMouseEnter={() => setCartDropdownOpen(true)}
                    onMouseLeave={() => setCartDropdownOpen(false)}
                  >
                    {cartItems.length === 0 ? (
                      <div className="p-6 flex flex-col items-center text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mb-3 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        <span className="text-sm text-center">Giỏ hàng của bạn đang trống</span>
                      </div>
                    ) : (
                      <div>
                        <div className="max-h-72 overflow-y-auto divide-y">
                          {cartItems.map((item) => (
                            <motion.div
                              key={item._id}
                              className="flex p-4 gap-3"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
                                <button
                                  className="text-pink-600 text-xs hover:underline"
                                  onClick={() => removeFromCart(item._id)}
                                  type="button"
                                  aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                                >
                                  Xóa
                                </button>
                                <div className="flex items-center mt-2 gap-2">
                                  <button
                                    className="w-6 h-6 border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                                    onClick={() => handleDecrease(item._id, item.quantity)}
                                    type="button"
                                    aria-label="Giảm số lượng"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                                  <button
                                    className="w-6 h-6 border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                                    onClick={() => handleIncrease(item._id, item.quantity)}
                                    type="button"
                                    aria-label="Tăng số lượng"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <div className="text-pink-600 font-semibold text-sm">
                                {(item.price * item.quantity).toLocaleString()}₫
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <div className="p-4 border-t">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-base font-medium">Tổng tiền:</span>
                            <span className="text-pink-600 font-bold">{totalAmount.toLocaleString()}₫</span>
                          </div>
                          <button
                            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full py-2 font-semibold hover:from-pink-700 hover:to-purple-700 transition"
                            onClick={() => navigate("/cart")}
                          >
                            Thanh toán
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/" className="hover:text-purple-100 transition font-medium">
              Trang chủ
            </Link>
            <a href="#" className="hover:text-purple-100 transition font-medium">
              Giới thiệu
            </a>
            
            <div className="relative group">
              <Link to="/list" className="flex items-center gap-1 hover:text-purple-100 transition font-medium">
                Sản phẩm
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="hidden group-hover:block absolute top-full left-0 bg-white text-gray-800 py-6 px-8 shadow-xl rounded-b-xl w-[1000px] z-20 border border-gray-100"
              >
                {Object.keys(categories).length > 0 ? (
                  <div className="grid grid-cols-4 gap-8">
                    {Object.keys(categories).map((mainCategory, idx) => (
                      <div key={mainCategory + idx} className="flex flex-col">
                        <h3 className="font-bold text-lg text-pink-600 mb-3">{mainCategory}</h3>
                        <div className="flex flex-col gap-2">
                          {categories[mainCategory].map((subCategory, subIdx) => (
                            <a
                              key={subIdx}
                              onClick={() => handleCategoryClick(subCategory)}
                              className="hover:text-pink-600 transition cursor-pointer text-gray-700"
                            >
                              {subCategory}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-500">Đang tải danh mục...</div>
                )}
              </motion.div>
            </div>
            
            <a href="#" className="hover:text-purple-100 transition font-medium">
              Dịch vụ gói quà
            </a>
            <Link to="/blog" className="hover:text-purple-100 transition font-medium">
              Kinh nghiệm
            </Link>
            <Link to="/blog" className="hover:text-purple-100 transition font-medium">
              Cách chọn quà
            </Link>
            <a href="#" className="hover:text-purple-100 transition font-medium">
              Liên hệ
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>

          {/* Account and Favorites */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="/favorites" className="flex items-center gap-2 hover:text-purple-100 transition">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
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
                {totalFavoriteItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalFavoriteItems}
                  </span>
                )}
              </div>
              <span className="text-base">Yêu thích</span>
            </a>
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <motion.button
                className="flex items-center gap-2 hover:text-purple-100 transition"
                whileHover={{ scale: 1.05 }}
                aria-label="Tài khoản"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-base">{user ? user.name : "Tài khoản"}</span>
              </motion.button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-50 py-2 text-gray-800 border border-gray-100"
                  >
                    {user ? (
                      <>
                        <span className="block px-4 py-2 text-sm font-medium">{user.name}</span>
                        <button
                          onClick={() => {
                            logout();
                            navigate("/");
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
                        >
                          Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="block px-4 py-2 text-sm hover:bg-gray-100 transition">
                          Đăng nhập
                        </Link>
                        <Link to="/register" className="block px-4 py-2 text-sm hover:bg-gray-100 transition">
                          Đăng ký
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white text-gray-800 px-4 py-6 shadow-md"
            >
              <div className="flex flex-col gap-4">
                <Link to="/" className="hover:text-pink-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  Trang chủ
                </Link>
                <a href="#" className="hover:text-pink-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  Giới thiệu
                </a>
                <div className="flex flex-col">
                  <button className="flex items-center gap-1 hover:text-pink-600 transition font-medium text-left">
                    Sản phẩm
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="pl-4 mt-2 flex flex-col gap-2">
                    <div className="font-bold text-pink-600">Set Quà Tặng</div>
                    <a href="#" className="hover:text-pink-600 transition">
                      Quà sinh nhật
                    </a>
                    <a href="#" className="hover:text-pink-600 transition">
                      Quà tặng cao cấp
                    </a>
                    <a href="#" className="hover:text-pink-600 transition">
                      Quà tặng Noel
                    </a>
                  </div>
                </div>
                <a href="#" className="hover:text-pink-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  Dịch vụ gói quà
                </a>
                <Link to="/blog" className="hover:text-pink-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  Kinh nghiệm
                </Link>
                <Link to="/blog" className="hover:text-pink-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  Cách chọn quà
                </Link>
                <a href="#" className="hover:text-pink-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  Liên hệ
                </a>
                <a href="/favorites" className="hover:text-pink-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  Yêu thích ({totalFavoriteItems})
                </a>
                {user ? (
                  <>
                    <span className="font-medium">{user.name}</span>
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-left hover:text-pink-600 transition font-medium"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="hover:text-pink-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                      Đăng nhập
                    </Link>
                    <Link to="/register" className="hover:text-pink-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Address Modal */}
      <AnimatePresence>
        {addressModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-4 flex items-center">
                <button
                  onClick={() => {
                    if (!showingDistricts && selectedDistrict) {
                      backToDistricts();
                    } else {
                      setAddressModalOpen(false);
                    }
                  }}
                  className="mr-3"
                  aria-label={showingDistricts ? "Đóng" : "Quay lại"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={showingDistricts ? "M6 18L18 6M6 6l12 12" : "M15 19l-7-7 7-7"}
                    />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold flex-1 text-center">
                  {showingDistricts ? "Chọn Quận/Huyện" : "Chọn Phường/Xã"}
                </h3>
              </div>
              <div className="p-6">
                <motion.div
                  className="flex items-center gap-3 text-pink-600 mb-4 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">Lấy vị trí hiện tại của bạn</span>
                </motion.div>
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Tìm nhanh Tỉnh Thành, Quận Huyện"
                    className="w-full border border-gray-200 rounded-full pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50"
                    aria-label="Tìm kiếm địa điểm"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {showingDistricts ? (
                    districts.map((district, index) => (
                      <motion.div
                        key={index}
                        className="py-3 px-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                        onClick={() => handleDistrictSelect(district)}
                        whileHover={{ scale: 1.01 }}
                        role="option"
                        aria-selected={selectedDistrict === district}
                      >
                        {district}
                      </motion.div>
                    ))
                  ) : (
                    getWardsForDistrict(selectedDistrict || "").map((ward, index) => (
                      <motion.div
                        key={index}
                        className="py-3 px-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                        onClick={() => handleWardSelect(ward)}
                        whileHover={{ scale: 1.01 }}
                        role="option"
                        aria-selected={selectedWard === ward}
                      >
                        {ward}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h4 className="font-bold text-xl mb-4">Gifting</h4>
            <p className="text-sm mb-4">Nơi tìm kiếm những món quà ý nghĩa cho mọi dịp đặc biệt.</p>
            <p className="text-sm">Hotline: 0123456789</p>
            <p className="text-sm">Email: support@gifting.vn</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="font-bold text-xl mb-4">Về Chúng Tôi</h4>
            <ul className="text-sm space-y-2">
              {["Trang chủ", "Giới thiệu", "Sản phẩm", "Dịch vụ gói quà", "Blog", "Liên hệ"].map((item) => (
                <li key={item}>
                  {item === "Blog" ? (
                    <Link to="/blog" className="hover:text-purple-100 transition">{item}</Link>
                  ) : (
                    <a href="#" className="hover:text-purple-100 transition">{item}</a>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-bold text-xl mb-4">Chính Sách</h4>
            <ul className="text-sm space-y-2">
              {[
                "Hướng dẫn mua hàng",
                "Chính sách đổi trả",
                "Chính sách bảo mật",
                "Chính sách vận chuyển",
                "Chính sách thanh toán",
                "Chính sách bảo hành",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-purple-100 transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="font-bold text-xl mb-4">Đăng Ký Nhận Tin</h4>
            <p className="text-sm mb-4">Nhận thông tin mới nhất từ Gifting!</p>
            <div className="flex mt-3">
              <motion.input
                type="email"
                placeholder="Nhập email của bạn"
                className="px-4 py-3 text-sm rounded-l-full text-gray-800 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                whileFocus={{ scale: 1.02 }}
                aria-label="Email đăng ký nhận tin"
              />
              <motion.button
                className="bg-pink-600 px-4 py-3 rounded-r-full text-sm text-white hover:bg-pink-700 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                GỬI
              </motion.button>
            </div>
            <div className="flex gap-3 mt-6">
              {["facebook", "instagram", "pinterest"].map((platform) => (
                <motion.a
                  key={platform}
                  href="#"
                  className="bg-white text-pink-600 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
                  whileHover={{ scale: 1.1 }}
                  aria-label={`Theo dõi chúng tôi trên ${platform}`}
                >
                  {platform[0]}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="border-t border-pink-400 mt-8 pt-6 text-center text-sm">
          <p>© 2025 Bản quyền thuộc về Gifting | Cung cấp bởi Shopee</p>
        </div>
      </footer>
    </div>
  );
}