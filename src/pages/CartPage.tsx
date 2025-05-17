import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useRegion } from '../contexts/RegionContext';
import { CartItem } from '../types/CartItem';
import axios from 'axios';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, totalAmount, setCartItems } = useCart();
  const { selectedDistrict } = useRegion();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isCompanyInvoice, setIsCompanyInvoice] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [regionalProducts, setRegionalProducts] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchRegionalProducts = async () => {
      if (selectedDistrict) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/products/by-region?district=${encodeURIComponent(selectedDistrict)}`
          );
          // Tạo map với key là product._id và value là thông tin sản phẩm
          const productsMap = res.data.reduce((acc: Record<string, any>, product: any) => {
            acc[product._id] = product;
            return acc;
          }, {});
          setRegionalProducts(productsMap);
        } catch (err) {
          console.error('Lỗi khi tải sản phẩm theo khu vực:', err);
        }
      }
    };

    fetchRegionalProducts();
  }, [selectedDistrict]);

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

  const handleIncrease = (productId: string, currentQuantity: number, maxStock: number) => {
    if (currentQuantity < maxStock) {
      updateQuantity(productId, currentQuantity + 1);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const isProductAvailable = (productId: string) => {
    return regionalProducts[productId] && regionalProducts[productId].regionalStock > 0;
  };

  // Lấy giá theo khu vực nếu có
  const getRegionalPrice = (item: CartItem) => {
    if (regionalProducts[item._id]) {
      return regionalProducts[item._id].price;
    }
    return item.price;
  };

  // Lấy giá gốc (không có phụ phí khu vực)
  const getBasePrice = (item: CartItem) => {
    if (regionalProducts[item._id] && regionalProducts[item._id].basePrice) {
      return regionalProducts[item._id].basePrice;
    }
    return item.basePrice || item.price;
  };

  // Lấy tồn kho theo khu vực
  const getRegionalStock = (item: CartItem) => {
    if (regionalProducts[item._id]) {
      return regionalProducts[item._id].regionalStock || 0;
    }
    return 0;
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
                {cartItems.map((item: CartItem) => {
                  const isAvailable = isProductAvailable(item._id);
                  const regionalPrice = getRegionalPrice(item);
                  const basePrice = getBasePrice(item);
                  const regionalStock = getRegionalStock(item);
                  
                  return (
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
                        {!isAvailable && (
                          <div className="text-red-500 text-xs mt-1">Tạm hết hàng</div>
                        )}
                      </td>
                      <td className="py-4 px-2 text-center">
                        <div className="text-pink-600 font-medium">
                          {basePrice.toLocaleString()} đ
                        </div>
                        {basePrice !== regionalPrice && (
                          <div className="text-gray-400 line-through text-xs">
                            {regionalPrice.toLocaleString()} đ
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleDecrease(item._id, item.quantity)}
                            className="w-8 h-8 border border-gray-300 flex items-center justify-center"
                            disabled={!isAvailable}
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
                            onClick={() => handleIncrease(item._id, item.quantity, regionalStock)}
                            className="w-8 h-8 border border-gray-300 flex items-center justify-center"
                            disabled={!isAvailable || item.quantity >= regionalStock}
                          >
                            +
                          </button>
                        </div>
                        {isAvailable && (
                          <div className="text-xs text-gray-500 mt-1 text-center">
                            Còn {regionalStock} sản phẩm
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-2 text-center font-medium text-pink-600">
                        {(basePrice * item.quantity).toLocaleString()} đ
                      </td>
                      <td className="py-4 px-2 text-center">
                        <button
                          onClick={() => handleRemoveFromCart(item._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
                <span className="text-pink-600 font-medium">
                  {cartItems.reduce((total, item) => {
                    const price = getBasePrice(item);
                    return total + price * item.quantity;
                  }, 0).toLocaleString()} đ
                </span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Giao hàng</span>
                <span className="text-green-600">Giao hàng miễn phí</span>
              </div>

              <div className="flex justify-between py-4 font-bold">
                <span>Tổng cộng</span>
                <span className="text-pink-600">
                  {cartItems.reduce((total, item) => {
                    const price = getBasePrice(item);
                    return total + price * item.quantity;
                  }, 0).toLocaleString()} đ
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-blue-500 text-white py-3 text-center mt-4 hover:bg-blue-600 transition-colors"
                disabled={cartItems.some(item => !isProductAvailable(item._id))}
              >
                GIAO HÀNG VÀ THANH TOÁN
              </button>
              
              {cartItems.some(item => !isProductAvailable(item._id)) && (
                <div className="text-red-500 text-sm mt-2 text-center">
                  Một số sản phẩm không có sẵn trong khu vực của bạn
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}