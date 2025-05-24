import React, { useState, useEffect } from "react";
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { Sliders, ChevronDown, ChevronUp, X, Filter } from "lucide-react";
import { useRegion } from "../contexts/RegionContext";


export default function ProductListPage() {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedDistrict } = useRegion();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Get category from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const categoryFilter = queryParams.get('category');
  
  interface Product {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: string;
    image?: string;
    category?: string;
    isNew?: boolean;
    isHot?: boolean;
    basePrice?: number;
    additionalPrice?: number;
    regionalStock?: number;
  }
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;

  // New state variables for filter functionality
  const [showFilters, setShowFilters] = useState(true);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  
  // Filter options state
  const [filters, setFilters] = useState<{
    categories: string[];
    priceRange: [number, number];
    onlyNew: boolean;
    onlyHot: boolean; // 
    sortBy: "price-asc" | "price-desc" | "newest";
  }>({
    categories: [],
    priceRange: [0, 10000000],
    onlyNew: false,
    onlyHot: false, 
    sortBy: "newest",
  });

  // Lưu bộ lọc vào localStorage
  useEffect(() => {
    localStorage.setItem("productListFilters", JSON.stringify(filters));
  }, [filters]);

  // Khôi phục bộ lọc từ localStorage khi tải trang
  useEffect(() => {
    const savedFilters = localStorage.getItem("productListFilters");
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = categoryFilter
          ? `http://localhost:5000/api/products?category=${encodeURIComponent(categoryFilter)}`
          : `http://localhost:5000/api/products`;
  
        const response = await axios.get(url);
        let baseProducts: Product[] = response.data;
  
        if (selectedDistrict) {
          const regionalRes = await axios.get(`http://localhost:5000/api/products/by-region?district=${encodeURIComponent(selectedDistrict)}`);
          const regionalMap = new Map<string, Product>(
            (regionalRes.data as Product[]).map(p => [p._id, p])
          );
          
          // Chỉ lấy sản phẩm có trong khu vực
          baseProducts = baseProducts
            .filter((p: Product) => regionalMap.has(p._id))
            .map((p: Product) => ({
              ...p,
              ...(regionalMap.get(p._id) || {})
            }));
        }
  
        setProducts(baseProducts);
  
        if (baseProducts.length > 0) {
          const prices = baseProducts.map((product) => product.price);
          setMinPrice(Math.min(...prices));
          setMaxPrice(Math.max(...prices));
          setFilters((prev) => ({
            ...prev,
            priceRange: [Math.min(...prices), Math.max(...prices)],
          }));
  
          const categories = [...new Set(baseProducts.map((product) => product.category))] as string[];
          setAllCategories(categories);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };
  
    fetchProducts();
  }, [categoryFilter, selectedDistrict]);
  
  
  // State for price filter (keeping for backward compatibility)
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
    if (products.length > 0) {
      let result = [...products];
      
      // Apply category filter if present
      if (categoryFilter) {
        result = result.filter(product => product.category === categoryFilter);
      }
      
      // Apply filter from new filter component
      // Lọc theo danh mục
      if (filters.categories.length > 0) {
        result = result.filter((product: Product) => filters.categories.includes(product.category || ""));
      }
      
      // Lọc theo khoảng giá
      result = result.filter(
        (product: Product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      );
      
      // Lọc chỉ sản phẩm mới
      if (filters.onlyNew) {
        result = result.filter((product: Product) => product.isNew);
      }

      // Lọc chỉ sản phẩm hot
      if (filters.onlyHot) {
        result = result.filter((product: Product) => product.isHot);
      }
      
      // Apply price filter (legacy)
      if (priceFilter) {
        const [min, max] = priceFilter.split('-').map(Number);
        result = result.filter(product => product.price >= min && product.price <= max);
      }
      
      // Apply sorting - first check filters.sortBy (from radio buttons)
      if (filters.sortBy === "price-asc") {
        result.sort((a, b) => a.price - b.price);
      } else if (filters.sortBy === "price-desc") {
        result.sort((a, b) => b.price - a.price);
      } else if (filters.sortBy === null) {
        result.sort((a, b) => b._id.localeCompare(a._id));
      } else {
        // If no filter sort is selected, use the dropdown sort
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
            result.sort((a, b) => b._id.localeCompare(a._id));
            break;
          case "Hàng cũ nhất":
            result.sort((a, b) => a._id.localeCompare(b._id));
            break;
          default:
            // Default sorting (by _id)
            result.sort((a, b) => a._id.localeCompare(b._id));
        }
      }
      
      setFilteredProducts(result);
    }
  }, [filters, products, priceFilter, sortOption, categoryFilter]);

  // New filter functions
  const handleCategoryChange = (category: string) => {
    setFilters((prev) => {
      const updatedCategories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      
      return {
        ...prev,
        categories: updatedCategories,
      };
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [min, max],
    }));
  };

  const handleOnlyNewChange = () => {
    setFilters((prev) => ({
      ...prev,
      onlyNew: !prev.onlyNew,
    }));
  };

  // Add this function for the "Only hot products" checkbox
  const handleOnlyHotChange = () => {
    setFilters((prev) => ({
      ...prev,
      onlyHot: !prev.onlyHot,
    }));
  };

  const handleSortChange = (sortOption: "price-asc" | "price-desc" | "newest") => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortOption,
    }));
  };

  const resetFilters = () => {
    setFilters({
      categories: [],
      priceRange: [minPrice, maxPrice],
      onlyNew: false,
      onlyHot: false, // <-- Add this line
      sortBy: "newest",
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + "₫";
  };

  // Function to handle adding product to cart and navigating to cart page
  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product._id, 
      name: product.name,
      price: (product.basePrice ?? 0) + (product.additionalPrice ?? 0),
      originalPrice: product.discount !== "0%" 
        ? Math.round(((product.basePrice ?? 0) + (product.additionalPrice ?? 0)) * (1 - parseInt(product.discount?.replace('%', '') || '0') / 100))
        : undefined,
      discount: product.discount ? parseInt(product.discount.replace('%', '') || '0') : 0,
      image: product.image || "/placeholder.png",
      regionalStock: product.regionalStock
    });
  };
  
  // Function to handle favorites
  const handleFavoriteToggle = (product: Product) => {
    if (isInFavorites(product._id)) {  // Use _id directly
      removeFromFavorites(product._id);  // Use _id directly
    } else {
      addToFavorites({
        _id: product._id,  // Use _id directly
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        image: product.image || "/placeholder.png"
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
          <span className="text-pink-600 font-medium">{categoryFilter || "Tất cả sản phẩm"}</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar - Filters */}
          <div className="hidden md:block md:w-64 flex-shrink-0">
            {/* New Filter Component */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-pink-600" />
                  <h2 className="text-lg font-bold text-gray-800">Bộ lọc</h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={resetFilters}
                    className="text-xs text-pink-600 hover:text-pink-700 flex items-center"
                  >
                    <X size={14} className="mr-1" />
                    Xóa lọc
                  </button>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>
              
              {showFilters && (
                <div className="space-y-6">
                  {/* Lọc theo danh mục */}
                  <div className="border-t pt-4">
                    <h3 className="text-md font-semibold mb-3 text-gray-700">Danh mục</h3>
                    <div className="space-y-2">
                      {allCategories.map((category) => (
                        <div key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`category-${category}`}
                            checked={filters.categories.includes(category)}
                            onChange={() => handleCategoryChange(category)}
                            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                          />
                          <label htmlFor={`category-${category}`} className="ml-2 text-gray-700">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Lọc theo khoảng giá */}
                  <div className="border-t pt-4">
                    <h3 className="text-md font-semibold mb-3 text-gray-700">Khoảng giá</h3>
                    <div className="px-2">
                      <div className="mb-4">
                        <input
                          type="range"
                          min={minPrice}
                          max={maxPrice}
                          value={filters.priceRange[0]}
                          onChange={(e) => handlePriceRangeChange(Number(e.target.value), filters.priceRange[1])}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                        />
                        <input
                          type="range"
                          min={minPrice}
                          max={maxPrice}
                          value={filters.priceRange[1]}
                          onChange={(e) => handlePriceRangeChange(filters.priceRange[0], Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600 mt-2"
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">{formatPrice(filters.priceRange[0])}</span>
                        <span className="text-sm text-gray-600">{formatPrice(filters.priceRange[1])}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lọc chỉ sản phẩm mới */}
                  <div className="border-t pt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="only-new"
                        checked={filters.onlyNew}
                        onChange={handleOnlyNewChange}
                        className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="only-new" className="ml-2 text-gray-700">
                        Chỉ sản phẩm mới
                      </label>
                    </div>
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="only-hot"
                        checked={filters.onlyHot}
                        onChange={handleOnlyHotChange}
                        className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="only-hot" className="ml-2 text-gray-700">
                        Chỉ sản phẩm hot
                      </label>
                    </div>
                  </div>
                  
                  {/* Sắp xếp */}
                  <div className="border-t pt-4">
                    <h3 className="text-md font-semibold mb-3 text-gray-700">Sắp xếp theo</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="sort-newest"
                          name="sort"
                          checked={filters.sortBy === "newest"}
                          onChange={() => handleSortChange("newest")}
                          className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                        />
                        <label htmlFor="sort-newest" className="ml-2 text-gray-700">
                          Mới nhất
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="sort-price-asc"
                          name="sort"
                          checked={filters.sortBy === "price-asc"}
                          onChange={() => handleSortChange("price-asc")}
                          className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                        />
                        <label htmlFor="sort-price-asc" className="ml-2 text-gray-700">
                          Giá: Thấp đến cao
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="sort-price-desc"
                          name="sort"
                          checked={filters.sortBy === "price-desc"}
                          onChange={() => handleSortChange("price-desc")}
                          className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                        />
                        <label htmlFor="sort-price-desc" className="ml-2 text-gray-700">
                          Giá: Cao đến thấp
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
              <div className="text-xl font-bold text-gray-700">{categoryFilter || "Tất cả sản phẩm"}</div>
              
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
                
                
              </div>
            </div>
            
            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts
                .slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)
                .map((product) => (
                  <div 
                    key={product._id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative p-3 hover:shadow-lg transition-shadow max-w-xs w-full mx-auto"
                  >
                    <div className="relative w-full h-40 mb-3 overflow-hidden rounded-lg">
                      <img
                        src={product.image || "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.src = "/placeholder.png"; }}
                      />
                    
                    {/* Heart icon for favorites */}
                    <button
                      className={`absolute top-2 right-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
                        isInFavorites(product._id)
                          ? "bg-pink-500 text-white"
                          : "bg-white text-pink-500 border border-pink-300"
                      }`}
                      onClick={e => {
                        e.preventDefault();
                        handleFavoriteToggle(product);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isInFavorites(product._id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-col justify-between flex-1">
                    <Link
                      to={`/detail/${product._id}`}
                      className="text-sm font-medium line-clamp-2 mb-2 hover:text-pink-600 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                          <span className="text-pink-600 font-bold text-sm">
                          {product.originalPrice
                                  ? product.originalPrice.toLocaleString()
                                  : Math.round(product.price * (1 - parseInt(product.discount || "0") / 100)).toLocaleString()
                                }₫
                          </span>
                          {product.discount && product.discount !== "0%" && (
                            <div className="flex items-center mt-1">
                              <span className="text-gray-400 line-through text-xs">
                                {product.price.toLocaleString()}₫
                              </span>
                              <span className="bg-pink-500 text-white text-[10px] px-1 rounded ml-1">
                                -{product.discount}
                              </span>
                            </div>
                          )}
                        </div>
                      <button
                        className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-pink-600 transition-colors ml-2"
                        onClick={() => handleAddToCart(product)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </button>
                    </div>
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
            
            {/* Pagination controls */}
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-2 bg-white-100 py-3 px-6 rounded-lg">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-pink-200 text-gray-700 disabled:opacity-40"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`w-8 h-8 flex items-center justify-center rounded-full mx-1 transition
                      ${currentPage === i + 1
                        ? "bg-pink-400 text-black font-bold"
                        : "hover:bg-pink-100 text-black"}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-pink-200 text-gray-700 disabled:opacity-40"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredProducts.length / productsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage) || filteredProducts.length === 0}
                  aria-label="Next page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}