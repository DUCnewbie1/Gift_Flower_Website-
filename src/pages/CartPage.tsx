import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../types/CartItem';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, totalAmount } = useCart();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isCompanyInvoice, setIsCompanyInvoice] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  // Debounce để tránh gọi API trùng lặp
  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleRemoveFromCart = useCallback(
    debounce((productId: string) => {
      removeFromCart(productId);
    }, 300),
    [removeFromCart]
  );

  const handleDecrease = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  const handleIncrease = (productId: string, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex mb-8 border-b pb-1">
        <div className="flex-1 text-center bg-pink-500 text-white py-2 font-medium">
          GIỎ HÀNG
        </div>
        <div className="flex-1 text-center bg-gray-200 text-gray-500 py-2 font-medium">
          GIAO HÀNG VÀ THANH TOÁN
        </div>
        <div className="flex-1 text-center bg-gray-200 text-gray-500 py-2 font-medium">
          HOÀN TẤT
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <p className="text-gray-500 mb-6">Không có sản phẩm nào trong giỏ hàng của bạn</p>
          <Link
            to="/"
            className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 px-2 text-gray-600">Sản phẩm</th>
                  <th className="py-2 px-2 text-gray-600">Tên</th>
                  <th className="py-2 px-2 text-gray-600 text-center">Đơn giá</th>
                  <th className="py-2 px-2 text-gray-600 text-center">Số lượng</th>
                  <th className="py-2 px-2 text-gray-600 text-center">Thành tiền</th>
                  <th className="py-2 px-2 text-gray-600 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item: CartItem) => (
                  <tr key={item._id} className="border-b">
                    <td className="py-4 px-2">
                      <div className="w-20 h-20 bg-gray-100">
                        <img
                          src={item.image || '/images/placeholder.png'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="font-medium text-gray-800">{item.name}</div>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <div className="text-pink-600 font-medium">
                        {item.price?.toLocaleString() || 0} đ
                      </div>
                      {item.originalPrice && (
                        <div className="text-gray-400 line-through text-xs">
                          {item.originalPrice.toLocaleString()} đ
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleDecrease(item._id, item.quantity)}
                          className="w-8 h-8 border border-gray-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={item.quantity}
                          readOnly
                          className="w-10 h-8 border-t border-b border-gray-300 text-center"
                        />
                        <button
                          onClick={() => handleIncrease(item._id, item.quantity)}
                          className="w-8 h-8 border border-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center font-medium text-pink-600">
                      {((item.price || 0) * item.quantity).toLocaleString()} đ
                    </td>
                    <td className="py-4 px-2 text-center">
                      <button
                        onClick={() => handleRemoveFromCart(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex mt-6 gap-4">
              <Link
                to="/"
                className="border border-pink-500 text-pink-500 px-4 py-2 hover:bg-pink-50 transition-colors"
              >
                TIẾP TỤC MUA HÀNG →
              </Link>

              <button className="border border-gray-300 text-gray-600 px-4 py-2 hover:bg-gray-50 transition-colors">
                CẬP NHẬT GIỎ HÀNG
              </button>
            </div>

            <div className="mt-6">
              <div className="border border-gray-300 p-4 inline-block">
                <input
                  type="text"
                  placeholder="Mã khuyến mãi (Nếu có)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="border border-gray-300 p-2 mr-2"
                />
                <button className="bg-blue-500 text-white px-4 py-2">ÁP DỤNG</button>
              </div>
            </div>
          </div>

          <div className="md:w-1/3">
            <div className="border border-gray-200 p-4">
              <h2 className="text-xl font-bold text-center border-b pb-2 mb-4">TỔNG GIỎ HÀNG</h2>

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Thành tiền</span>
                <span className="text-pink-600 font-medium">{totalAmount.toLocaleString()} đ</span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Giao hàng</span>
                <span className="text-green-600">Giao hàng miễn phí</span>
              </div>

              <div className="flex justify-between py-4 font-bold">
                <span>Tổng cộng</span>
                <span className="text-pink-600">{totalAmount.toLocaleString()} đ</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-blue-500 text-white py-3 text-center mt-4 hover:bg-blue-600 transition-colors"
              >
                GIAO HÀNG VÀ THANH TOÁN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}