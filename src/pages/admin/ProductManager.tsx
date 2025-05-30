import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Plus, Trash2, Search, Filter, X, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Check, Loader2 } from "lucide-react";

// Kiểu sản phẩm
interface Product {
  _id?: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

// Kiểu trạng thái sắp xếp
type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "price" | "stock" | "category" | null;

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minStock, setMinStock] = useState<string>("");
  const [maxStock, setMaxStock] = useState<string>("");
  
  // Sắp xếp
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Form states
  const [formData, setFormData] = useState<Product>({
    name: "",
    price: 0,
    stock: 0,
    category: "",
    image: ""
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Product, string>>>({});

  // Danh sách danh mục duy nhất từ sản phẩm
  const [categories, setCategories] = useState<string[]>([]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/products");
      console.log("🔍 API result:", res.data);
      const productsData = Array.isArray(res.data) ? res.data : [];
      setProducts(productsData);
      setFilteredProducts(productsData);
      
      // Lấy danh sách danh mục duy nhất
      const uniqueCategories = Array.from(new Set(productsData.map(p => p.category)))
        .filter(Boolean)
        .sort();
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách sản phẩm", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Áp dụng tìm kiếm và bộ lọc khi các trạng thái thay đổi
  useEffect(() => {
    let result = [...products];
    
    // Áp dụng tìm kiếm
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.category.toLowerCase().includes(term)
      );
    }
    
    // Áp dụng lọc theo danh mục
    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter);
    }
    
    // Áp dụng lọc theo giá
    if (minPrice !== "") {
      result = result.filter(p => p.price >= parseInt(minPrice));
    }
    if (maxPrice !== "") {
      result = result.filter(p => p.price <= parseInt(maxPrice));
    }
    
    // Áp dụng lọc theo tồn kho
    if (minStock !== "") {
      result = result.filter(p => p.stock >= parseInt(minStock));
    }
    if (maxStock !== "") {
      result = result.filter(p => p.stock <= parseInt(maxStock));
    }
    
    // Áp dụng sắp xếp
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        if (sortField === "price" || sortField === "stock") {
          return sortDirection === "asc" 
            ? a[sortField] - b[sortField]
            : b[sortField] - a[sortField];
        } else {
          const valueA = a[sortField].toLowerCase();
          const valueB = b[sortField].toLowerCase();
          if (sortDirection === "asc") {
            return valueA.localeCompare(valueB);
          } else {
            return valueB.localeCompare(valueA);
          }
        }
      });
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, categoryFilter, minPrice, maxPrice, minStock, maxStock, sortField, sortDirection]);

  const validateForm = () => {
    const errors: Partial<Record<keyof Product, string>> = {};
    
    if (!formData.name.trim()) {
      errors.name = "Tên sản phẩm là bắt buộc";
    }
    
    if (formData.price < 0) {
      errors.price = "Giá không được âm";
    }
    
    if (formData.stock < 0) {
      errors.stock = "Tồn kho không được âm";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "number" ? (value ? parseFloat(value) : 0) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      if (selected) {
        await axios.put(`/api/products/${selected._id}`, formData);
      } else {
        await axios.post("/api/products", formData);
      }
      setIsOpen(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error("❌ Lỗi khi lưu sản phẩm", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá sản phẩm này?")) return;
    try {
      setIsLoading(true);
      await axios.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("❌ Lỗi khi xoá sản phẩm", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openEdit = (product: Product) => {
    setSelected(product);
    setFormData({ ...product });
    setFormErrors({});
    setIsOpen(true);
  };

  const openNew = () => {
    setSelected(null);
    resetForm();
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      stock: 0,
      category: "",
      image: ""
    });
    setFormErrors({});
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setMinPrice("");
    setMaxPrice("");
    setMinStock("");
    setMaxStock("");
    setSortField(null);
    setSortDirection(null);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={16} className="ml-1 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={16} className="ml-1 text-blue-500" />
    ) : (
      <ArrowDown size={16} className="ml-1 text-blue-500" />
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
          <button
            onClick={openNew}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200 shadow-sm"
          >
            <Plus className="mr-2" size={18} />
            Thêm sản phẩm
          </button>
        </div>

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 border rounded-md transition-colors ${
                  showFilters ? "bg-blue-50 text-blue-600 border-blue-200" : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Filter size={18} className="mr-2" />
                Bộ lọc
                {(categoryFilter || minPrice || maxPrice || minStock || maxStock) && (
                  <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {[categoryFilter, minPrice, maxPrice, minStock, maxStock].filter(Boolean).length}
                  </span>
                )}
              </button>
              
              {(searchTerm || categoryFilter || minPrice || maxPrice || minStock || maxStock || sortField) && (
                <button
                  onClick={resetFilters}
                  className="flex items-center text-sm text-gray-600 hover:text-red-600"
                >
                  <X size={14} className="mr-1" />
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Bộ lọc mở rộng */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-md mt-2 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  id="category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Từ"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Đến"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder="Từ"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={maxStock}
                    onChange={(e) => setMaxStock(e.target.value)}
                    placeholder="Đến"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Tổng sản phẩm</div>
            <div className="text-2xl font-bold">{products.length}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Tổng tồn kho</div>
            <div className="text-2xl font-bold">
              {products.reduce((sum, product) => sum + product.stock, 0)}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Số danh mục</div>
            <div className="text-2xl font-bold">{categories.length}</div>
          </div>
        </div>

        {/* Bảng sản phẩm */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th 
                    className="p-4 text-sm font-medium text-gray-600 cursor-pointer"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center">
                      Tên sản phẩm {renderSortIcon("name")}
                    </div>
                  </th>
                  <th 
                    className="p-4 text-sm font-medium text-gray-600 cursor-pointer"
                    onClick={() => toggleSort("price")}
                  >
                    <div className="flex items-center">
                      Giá (VNĐ) {renderSortIcon("price")}
                    </div>
                  </th>
                  <th 
                    className="p-4 text-sm font-medium text-gray-600 cursor-pointer"
                    onClick={() => toggleSort("stock")}
                  >
                    <div className="flex items-center">
                      Tồn kho {renderSortIcon("stock")}
                    </div>
                  </th>
                  <th 
                    className="p-4 text-sm font-medium text-gray-600 cursor-pointer"
                    onClick={() => toggleSort("category")}
                  >
                    <div className="flex items-center">
                      Danh mục {renderSortIcon("category")}
                    </div>
                  </th>
                  <th className="p-4 text-sm font-medium text-gray-600">Hình ảnh</th>
                  <th className="p-4 text-sm font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin mr-2" />
                        Đang tải dữ liệu...
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p._id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{p.name}</div>
                      </td>
                      <td className="p-4 text-gray-700">{p.price.toLocaleString()} đ</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          p.stock > 10 
                            ? 'bg-green-100 text-green-800' 
                            : p.stock > 0 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-md border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                            No image
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id!)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Phân trang & thông tin số lượng */}
          <div className="border-t px-4 py-3 bg-gray-50 text-sm text-gray-500 flex justify-between items-center">
            <div>
              Hiển thị {filteredProducts.length} trong tổng số {products.length} sản phẩm
            </div>
          </div>
        </div>
      </div>

      {/* Modal thêm/sửa */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selected ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nhập tên sản phẩm"
                    className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Giá (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Nhập giá sản phẩm"
                      className={`w-full border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {formErrors.price && <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                      Tồn kho <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="Nhập số lượng tồn kho"
                      className={`w-full border ${formErrors.stock ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {formErrors.stock && <p className="mt-1 text-sm text-red-500">{formErrors.stock}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="new">+ Thêm danh mục mới</option>
                  </select>
                  
                  {formData.category === "new" && (
                    <input
                      type="text"
                      name="category"
                      value=""
                      onChange={handleInputChange}
                      placeholder="Nhập tên danh mục mới"
                      className="mt-2 w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
                
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    URL hình ảnh
                  </label>
                  <input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Nhập URL hình ảnh sản phẩm"
                    className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {formData.image && (
                    <div className="mt-3 flex justify-center">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="h-32 w-32 object-cover rounded-md border border-gray-200" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/api/placeholder/128/128";
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {selected ? "Cập nhật" : "Tạo mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;