import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalAmount } = useCart();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isCompanyInvoice, setIsCompanyInvoice] = useState(false);

  // Handle quantity changes
  const handleDecrease = (productId: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  const handleIncrease = (productId: number, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  return (
    <div className="flex flex-col min-h-[50vh]">
      {/* Breadcrumb */}
      <div className="w-full bg-gray-100 flex items-center px-6 py-3 border-b">
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/" className="flex items-center gap-1 text-gray-700 hover:text-pink-500 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4" />
            </svg>
            <span className="font-semibold">Trang chủ</span>
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-pink-600 font-medium">Giỏ hàng</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto w-full p-6">
        {cartItems.length === 0 ? (
          // Empty cart state
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-6">Không có sản phẩm nào trong giỏ hàng của bạn</p>
              <Link to="/products" className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition-colors">
                Tiếp tục mua sắm
              </Link>
            </div>
            
            {/* Right column - Delivery time */}
            <div className="w-full lg:w-80">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Thời gian giao hàng</h2>
              
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn ngày</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn thời gian</label>
                  <select 
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="">Chọn thời gian</option>
                    <option value="morning">Buổi sáng (8:00 - 12:00)</option>
                    <option value="afternoon">Buổi chiều (13:00 - 17:00)</option>
                    <option value="evening">Buổi tối (18:00 - 21:00)</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="invoice" 
                    className="mr-2 accent-pink-500"
                    checked={isCompanyInvoice}
                    onChange={() => setIsCompanyInvoice(!isCompanyInvoice)}
                  />
                  <label htmlFor="invoice" className="text-sm text-gray-700">Xuất hóa đơn công ty</label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Cart with products
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column - Cart items */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800 mb-4">Thông tin sản phẩm</h1>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Thông tin sản phẩm</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Đơn giá</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Số lượng</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden mr-4">
                              <img src={item.image || "/placeholder.png"} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-800 mb-1">{item.name}</h3>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-pink-500 text-xs hover:underline"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="text-pink-600 font-bold">{item.price.toLocaleString()}₫</div>
                          {item.originalPrice && (
                            <div className="text-gray-400 line-through text-xs">{item.originalPrice.toLocaleString()}₫</div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center">
                            <button 
                              onClick={() => handleDecrease(item.id, item.quantity)}
                              className="w-8 h-8 border border-gray-300 flex items-center justify-center rounded-l"
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
                              onClick={() => handleIncrease(item.id, item.quantity)}
                              className="w-8 h-8 border border-gray-300 flex items-center justify-center rounded-r"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-pink-600">
                          {(item.price * item.quantity).toLocaleString()}₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Right column - Delivery and payment */}
            <div className="w-full lg:w-80">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Thời gian giao hàng</h2>
              
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn ngày</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn thời gian</label>
                  <select 
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="">Chọn thời gian</option>
                    <option value="morning">Buổi sáng (8:00 - 12:00)</option>
                    <option value="afternoon">Buổi chiều (13:00 - 17:00)</option>
                    <option value="evening">Buổi tối (18:00 - 21:00)</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="invoice" 
                    className="mr-2 accent-pink-500"
                    checked={isCompanyInvoice}
                    onChange={() => setIsCompanyInvoice(!isCompanyInvoice)}
                  />
                  <label htmlFor="invoice" className="text-sm text-gray-700">Xuất hóa đơn công ty</label>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="font-bold text-pink-600">{totalAmount.toLocaleString()}₫</span>
                </div>
                
                <button className="w-full bg-pink-500 text-white py-3 rounded-md font-medium hover:bg-pink-600 transition-colors mt-4">
                  Thanh toán
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}