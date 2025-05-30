import { useEffect, useState } from "react";
import axios from "axios";
import { BadgeCheck, Clock, XCircle, Search, RefreshCw, Filter, FileText, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";
import "moment/locale/vi";

moment.locale("vi");

interface Order {
  _id: string;
  orderId: string;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  paymentMethod: "TRANSFER" | "CASH";
  createdAt: string;
}

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Status Badge Component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <BadgeCheck size={14} className="mr-1" /> Thành công
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={14} className="mr-1" /> Đang xử lý
          </span>
        );
      case "FAILED":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={14} className="mr-1" /> Thất bại
          </span>
        );
    }
  };

  // Payment Method Badge
  const PaymentBadge = ({ method }: { method: string }) => {
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        method === "TRANSFER" 
          ? "bg-blue-100 text-blue-800" 
          : "bg-purple-100 text-purple-800"
      }`}>
        {method === "TRANSFER" ? "Chuyển khoản" : "Tiền mặt"}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
            <p className="text-gray-500 mt-1">Quản lý và theo dõi tất cả đơn hàng</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button 
              onClick={fetchOrders}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCw size={16} className="mr-2" />
              Làm mới
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tìm theo mã đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={18} className="text-gray-400" />
                </div>
                <select
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="SUCCESS">Thành công</option>
                  <option value="PENDING">Đang xử lý</option>
                  <option value="FAILED">Thất bại</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : currentOrders.length === 0 ? (
            <div className="p-8 text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Không tìm thấy đơn hàng</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || statusFilter !== "ALL" 
                  ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm" 
                  : "Chưa có đơn hàng nào trong hệ thống"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Phương thức</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Tổng tiền</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          Thời gian
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-indigo-600">{order.orderId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PaymentBadge method={order.paymentMethod} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium">{order.amount.toLocaleString()} ₫</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{moment(order.createdAt).format("HH:mm - DD/MM/YYYY")}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{indexOfFirstOrder + 1}</span> đến{" "}
                    <span className="font-medium">
                      {indexOfLastOrder > filteredOrders.length ? filteredOrders.length : indexOfLastOrder}
                    </span>{" "}
                    trong <span className="font-medium">{filteredOrders.length}</span> đơn hàng
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {[...Array(totalPages).keys()].map((number) => (
                      <button
                        key={number + 1}
                        onClick={() => setCurrentPage(number + 1)}
                        className={`inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium ${
                          currentPage === number + 1
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {number + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}