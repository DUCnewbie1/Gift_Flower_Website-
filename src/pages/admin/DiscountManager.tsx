import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PlusCircle, Trash2, Edit, Calendar, Tag, Wallet, Check, X, ArrowDown, ChevronDown } from "lucide-react";
import moment from "moment";
import "moment/locale/vi";

moment.locale("vi");

interface Promotion {
  _id?: string;
  code: string;
  description: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function DiscountManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Promotion>({
    code: "",
    description: "",
    discountType: "PERCENT",
    discountValue: 0,
    maxDiscount: undefined,
    minOrderAmount: undefined,
    startDate: moment().format("YYYY-MM-DD"),
    endDate: moment().add(30, "days").format("YYYY-MM-DD"),
    isActive: true
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/promotions");
      setPromotions(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy khuyến mãi:", err);
      toast.error("Không thể tải khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: e.target.checked });
    } else if (name === "isActive") {
      setFormData({ ...formData, [name]: value === "true" });
    } else if (type === "number") {
      setFormData({ ...formData, [name]: value === "" ? undefined : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post("/api/promotions", formData);
      toast.success("🎉 Thêm mã thành công");
      setFormData({
        code: "",
        description: "",
        discountType: "PERCENT",
        discountValue: 0,
        maxDiscount: undefined,
        minOrderAmount: undefined,
        startDate: moment().format("YYYY-MM-DD"),
        endDate: moment().add(30, "days").format("YYYY-MM-DD"),
        isActive: true
      });
      setIsFormOpen(false);
      fetchPromotions();
    } catch (err) {
      toast.error("Không thể thêm mã khuyến mãi");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xác nhận xoá mã này?")) return;
    try {
      await axios.delete(`/api/promotions/${id}`);
      toast.success("Đã xoá mã");
      fetchPromotions();
    } catch (err) {
      toast.error("Xoá thất bại");
      console.error(err);
    }
  };

  const isDiscountValid = (promo: Promotion) => {
    const now = moment();
    const startDate = moment(promo.startDate);
    const endDate = moment(promo.endDate);
    return promo.isActive && now.isAfter(startDate) && now.isBefore(endDate);
  };

  const getStatus = (promo: Promotion) => {
    const now = moment();
    const startDate = moment(promo.startDate);
    const endDate = moment(promo.endDate);

    if (!promo.isActive) return { label: "Đã tắt", color: "bg-gray-100 text-gray-600" };
    if (now.isBefore(startDate)) return { label: "Sắp diễn ra", color: "bg-blue-100 text-blue-700" };
    if (now.isAfter(endDate)) return { label: "Đã hết hạn", color: "bg-red-100 text-red-700" };
    return { label: "Đang áp dụng", color: "bg-green-100 text-green-700" };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value).replace('₫', 'đ');
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý khuyến mãi</h1>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isFormOpen ? (
              <>
                <X size={18} /> Đóng form
              </>
            ) : (
              <>
                <PlusCircle size={18} /> Thêm khuyến mãi mới
              </>
            )}
          </button>
        </div>

        {/* Form thêm khuyến mãi */}
        {isFormOpen && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
            <h2 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Thông tin khuyến mãi</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã khuyến mãi <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tag size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-md p-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="VD: WELCOME10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Mô tả ngắn về khuyến mãi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-md p-2 focus:ring-pink-500 focus:border-pink-500 appearance-none"
                      required
                    >
                      <option value="PERCENT">Phần trăm (%)</option>
                      <option value="FIXED">Cố định (VNĐ)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị giảm <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Wallet size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-md p-2 focus:ring-pink-500 focus:border-pink-500"
                      min={0}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                      {formData.discountType === "PERCENT" ? "%" : "đ"}
                    </div>
                  </div>
                </div>

                {formData.discountType === "PERCENT" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ArrowDown size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="maxDiscount"
                        value={formData.maxDiscount || ""}
                        onChange={handleInputChange}
                        className="pl-10 w-full border border-gray-300 rounded-md p-2 focus:ring-pink-500 focus:border-pink-500"
                        min={0}
                        placeholder="Không giới hạn"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        đ
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn hàng tối thiểu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Wallet size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="minOrderAmount"
                      value={formData.minOrderAmount || ""}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-md p-2 focus:ring-pink-500 focus:border-pink-500"
                      min={0}
                      placeholder="Không giới hạn"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                      đ
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-md p-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-md p-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                  <select
                    name="isActive"
                    value={formData.isActive.toString()}
                    onChange={handleInputChange}
                    className="pl-10 w-full border border-gray-300 rounded-md p-2 focus:ring-pink-500 focus:border-pink-500 appearance-none"
                  >
                    <option value="true">Đang áp dụng</option>
                    <option value="false">Tạm tắt</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 border border-transparent rounded-md font-medium text-white hover:bg-pink-700"
                >
                  Thêm khuyến mãi
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Danh sách khuyến mãi */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Danh sách khuyến mãi</h2>
          </div>
          
          {loading ? (
            <div className="text-center p-8 text-gray-500">Đang tải dữ liệu...</div>
          ) : promotions.length === 0 ? (
            <div className="text-center p-8 text-gray-500">Chưa có mã khuyến mãi nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600">
                    <th className="p-4 font-medium">Mã</th>
                    <th className="p-4 font-medium">Mô tả</th>
                    <th className="p-4 font-medium">Giảm giá</th>
                    <th className="p-4 font-medium">Điều kiện</th>
                    <th className="p-4 font-medium">Thời gian áp dụng</th>
                    <th className="p-4 font-medium">Trạng thái</th>
                    <th className="p-4 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {promotions.map((promo) => {
                    const status = getStatus(promo);
                    return (
                      <tr key={promo._id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <span className="font-mono font-medium text-pink-600">{promo.code}</span>
                        </td>
                        <td className="p-4 text-gray-600 max-w-xs truncate">
                          {promo.description || "—"}
                        </td>
                        <td className="p-4">
                          {promo.discountType === "PERCENT" ? (
                            <div>
                              <span className="font-medium">{promo.discountValue}%</span>
                              {promo.maxDiscount && (
                                <span className="text-gray-500 text-xs block">
                                  (tối đa {formatCurrency(promo.maxDiscount)})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="font-medium">{formatCurrency(promo.discountValue)}</span>
                          )}
                        </td>
                        <td className="p-4">
                          {promo.minOrderAmount ? (
                            <span className="text-gray-600">
                              Đơn tối thiểu {formatCurrency(promo.minOrderAmount)}
                            </span>
                          ) : (
                            <span className="text-gray-400">Không có</span>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar size={14} className="text-gray-400" />
                            <span>
                              {moment(promo.startDate).format("DD/MM/YYYY")} - {moment(promo.endDate).format("DD/MM/YYYY")}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label === "Đang áp dụng" ? <Check size={12} /> : null}
                            {status.label === "Đã tắt" ? <X size={12} /> : null}
                            {status.label}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => promo._id && handleDelete(promo._id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Xoá mã"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}