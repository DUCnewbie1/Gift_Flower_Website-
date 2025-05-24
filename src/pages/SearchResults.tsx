import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Sliders, ChevronDown, ChevronUp, X, Filter, Grid3X3, List } from "lucide-react";
import { useRegion } from "../contexts/RegionContext"; 

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  isNew: boolean;
  regionalStock?: number;
}

interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  onlyNew: boolean;
  sortBy: "price-asc" | "price-desc" | "newest";
}

const SearchResults: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [isNavigating, setIsNavigating] = useState<string | null>(null); 
  const { selectedDistrict } = useRegion();
  
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, 10000000],
    onlyNew: false,
    sortBy: "newest",
  });

  // Lưu bộ lọc vào localStorage
  useEffect(() => {
    localStorage.setItem("searchFilters", JSON.stringify(filters));
  }, [filters]);

  // Khôi phục bộ lọc từ localStorage khi tải trang
  useEffect(() => {
    const savedFilters = localStorage.getItem("searchFilters");
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, []);

  // Lấy sản phẩm khớp với từ khóa
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        let baseProducts = data;

        // Thêm xử lý dữ liệu theo khu vực
        if (selectedDistrict) {
          const regionalRes = await fetch(`http://localhost:5000/api/products/by-region?district=${encodeURIComponent(selectedDistrict)}`);
          const regionalData = await regionalRes.json();
          const regionalMap = new Map(
            regionalData.map((p: Product) => [p._id, p])
          );
          
          // Chỉ lấy sản phẩm có trong khu vực và cập nhật thông tin
          baseProducts = baseProducts
            .filter((p: Product) => regionalMap.has(p._id))
            .map((p: Product) => ({
              ...p,
              ...(regionalMap.get(p._id) || {})
            }));
        }

        setProducts(baseProducts);
        setFilteredProducts(baseProducts);
        
        // Trích xuất giá thấp nhất và cao nhất
        if (baseProducts.length > 0) {
          const prices = baseProducts.map((product: Product) => product.price);
          setMinPrice(Math.min(...prices));
          setMaxPrice(Math.max(...prices));
          setFilters((prev) => ({
            ...prev,
            priceRange: [Math.min(...prices), Math.max(...prices)],
          }));
          
          // Trích xuất tất cả các danh mục
          const categories = [...new Set(baseProducts.map((product: Product) => product.category))] as string[];
          setAllCategories(categories);
        }
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    const fetchRelatedProducts = async () => {
      try {
        const districtParam = selectedDistrict ? `?district=${encodeURIComponent(selectedDistrict)}` : "";
        const response = await fetch(`http://localhost:5000/api/products/new${districtParam}`);
        const related = await response.json(); // ✅ chỉ đọc một lần
        setRelatedProducts(related.filter((product: Product) => (product.regionalStock ?? 0) > 0));

      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm liên quan:", error);
      }
    };

    if (query) {
      fetchProducts();
      fetchRelatedProducts();
    }
  }, [query, selectedDistrict]); // Thêm selectedDistrict vào dependencies

  // Áp dụng bộ lọc
  useEffect(() => {
    if (products.length > 0) {
      let result = [...products];
      
      // Lọc theo danh mục
      if (filters.categories.length > 0) {
        result = result.filter((product) => filters.categories.includes(product.category));
      }
      
      // Lọc theo khoảng giá
      result = result.filter(
        (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      );
      
      // Lọc chỉ sản phẩm mới
      if (filters.onlyNew) {
        result = result.filter((product) => product.isNew);
      }
      
      // Sắp xếp
      switch (filters.sortBy) {
        case "price-asc":
          result.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          result.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          result.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
          break;
      }
      
      setFilteredProducts(result);
    }
  }, [filters, products]);

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
      sortBy: "newest",
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + "₫";
  };

  // Xử lý click vào sản phẩm
  const handleProductClick = (productId: string) => {
    setIsNavigating(productId);
    setTimeout(() => setIsNavigating(null), 1000); // Reset sau 1 giây
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Kết quả tìm kiếm cho: <span className="text-pink-600">"{query}"</span>
          </h1>
          <p className="text-gray-500 mt-2">Tìm thấy {filteredProducts.length} sản phẩm</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Thanh lọc */}
          <div className="hidden md:block w-full md:w-1/4">
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
                          Giá tăng dần
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
                          Giá giảm dần
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Danh sách sản phẩm */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-700">
                  Hiển thị <span className="font-medium">{filteredProducts.length}</span> sản phẩm
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${viewMode === "grid" ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-600"}`}
                  >
                    <Grid3X3 size={20} />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${viewMode === "list" ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-600"}`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  viewMode === "grid" ? (
                    <Link
                      to={`/detail/${product._id}`} // Sửa thành /detail/
                      key={product._id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition group relative"
                      onClick={() => handleProductClick(product._id)}
                    >
                      {isNavigating === product._id && (
                        <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
                          <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      <div className="relative">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-56 object-cover group-hover:scale-105 transition duration-300" 
                        />
                        {product.isNew && (
                          <span className="absolute top-3 right-3 bg-pink-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                            Mới
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-800 group-hover:text-pink-600 transition">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                        <p className="text-pink-600 font-bold text-lg">{formatPrice(product.price)}</p>
                      </div>
                    </Link>
                  ) : (
                    <Link
                      to={`/detail/${product._id}`} // Sửa thành /detail/
                      key={product._id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden flex hover:shadow-md transition group relative"
                      onClick={() => handleProductClick(product._id)}
                    >
                      {isNavigating === product._id && (
                        <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
                          <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      <div className="relative w-1/3">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                        />
                        {product.isNew && (
                          <span className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                            Mới
                          </span>
                        )}
                      </div>
                      <div className="p-4 w-2/3">
                        <h3 className="text-lg font-medium text-gray-800 group-hover:text-pink-600 transition">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                        <p className="text-pink-600 font-bold text-lg">{formatPrice(product.price)}</p>
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          Sản phẩm chất lượng cao với thiết kế hiện đại, phù hợp với mọi nhu cầu.
                        </p>
                      </div>
                    </Link>
                  )
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào khớp với từ khóa.</p>
                <button 
                  onClick={resetFilters}
                  className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Sản phẩm liên quan */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link
                  to={`/detail/${product._id}`} // Sửa thành /detail/
                  key={product._id}
                  className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition group"
                  onClick={() => handleProductClick(product._id)}
                >
                  {isNavigating === product._id && (
                    <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" 
                    />
                    {product.isNew && (
                      <span className="absolute top-3 right-3 bg-pink-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                        Mới
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-800 group-hover:text-pink-600 transition">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    <p className="text-pink-600 font-bold">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;