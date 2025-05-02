import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Store } from "lucide-react";
import { getOrdersByEmail } from "../lib/api";
import { Order } from "../types/Order";

export default function CartList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getOrdersByEmail(user.email);
        setOrders(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
      }
    };

    if (user.email) fetchOrders();
  }, [user.email]);

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">
                {order.customerInfo.fullName || "Cửa hàng"}
              </span>
              <button className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                Yêu thích
              </button>
              <button className="ml-2 text-xs border border-gray-300 px-2 py-0.5 rounded">
                Chat
              </button>
              <button className="ml-2 text-xs border border-gray-300 px-2 py-0.5 rounded">
                Xem Shop
              </button>
            </div>
            <div className="flex gap-2 text-sm items-center">
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Giao hàng thành công
              </span>
              <span className="text-orange-500 font-medium uppercase">
                {order.status}
              </span>
            </div>
          </div>

          {/* Products */}
          {order.cartItems.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 border-b"
            >
              <img
                src="/api/placeholder/64/64"
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 space-y-1">
                <div className="text-gray-800">{item.name}</div>
                <div className="text-sm text-gray-500">
                  Phân loại hàng: {item.color || "Không có"}
                </div>
                <div className="text-sm text-gray-500">x{item.quantity}</div>
              </div>
              <div className="text-right space-y-1">
                {item.originalPrice && (
                  <div className="text-xs text-gray-400 line-through">
                    {item.originalPrice.toLocaleString()}₫
                  </div>
                )}
                <div className="text-orange-500 font-medium">
                  {item.price.toLocaleString()}₫
                </div>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="p-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">

            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-2">Thành tiền:</div>
              <div className="text-2xl text-orange-500 mb-2">
                {order.amount.toLocaleString()}₫
              </div>
              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 bg-red-500 text-white rounded">
                  Đánh Giá
                </button>
                <button className="px-4 py-2 bg-gray-100 border rounded">
                  Yêu Cầu Trả Hàng/Hoàn Tiền
                </button>
                <button className="px-4 py-2 bg-gray-100 border rounded">
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
