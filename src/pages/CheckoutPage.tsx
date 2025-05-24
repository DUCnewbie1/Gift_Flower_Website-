import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../types/CartItem';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('TRANSFER');
  const [invoiceRequested, setInvoiceRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tiếp tục thanh toán');
      navigate('/login');
    }
  }, [user, navigate]);

  const provinces = [
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bạc Liêu",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Định",
    "Bình Dương",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cần Thơ",
    "Cao Bằng",
    "Đà Nẵng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Nội",
    "Hà Tĩnh",
    "Hải Dương",
    "Hải Phòng",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kien Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "TP. Hồ Chí Minh",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
  ];

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    country: 'Việt Nam',
    address: '',
    apartment: '',
    province: '',
    phone: '',
    email: user?.email || '',
    note: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      { name: 'fullName', label: 'Họ và tên' },
      { name: 'address', label: 'Địa chỉ' },
      { name: 'province', label: 'Tỉnh/Thành phố' },
      { name: 'phone', label: 'Số điện thoại' },
      { name: 'email', label: 'Địa chỉ email' },
    ];

    for (const field of requiredFields) {
      if (!formData[field.name as keyof typeof formData].trim()) {
        toast.error(`Vui lòng điền ${field.label}`);
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ (10 chữ số)');
      return;
    }

    setLoading(true);

    if (paymentMethod === 'TRANSFER') {
      const orderId = `ORDER-${Date.now()}`.slice(-10);
      const requestId = `REQ-${Date.now()}`;
      const returnUrl = 'http://localhost:5173/order-success';
      const notifyUrl = 'http://localhost:5000/momo-webhook';

      // Lưu formData vào localStorage để OrderSuccessPage sử dụng
      localStorage.setItem('customerInfo', JSON.stringify(formData));

      const paymentData = {
        orderId,
        requestId,
        amount: totalAmount,
        orderInfo: `Thanh toán đơn hàng ${orderId}`,
        returnUrl,
        notifyUrl,
        cartItems,
        customerInfo: formData,
        userId: user?._id,
      };

      try {
        const response = await fetch('http://localhost:5000/api/create-momo-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        });

        const result = await response.json();
        if (result.payUrl) {
          window.location.href = result.payUrl;
        } else {
          console.error('Không nhận được payUrl từ MoMo');
          toast.error('Không thể tạo thanh toán MoMo');
          setLoading(false);
        }
      } catch (error) {
        console.error('Lỗi khi gọi API MoMo:', error);
        toast.error('Lỗi khi gọi API MoMo');
        setLoading(false);
      }
    } else if (paymentMethod === 'CASH') {
      const orderId = `ORDER-${Date.now()}`.slice(-10);
      const orderData = {
        orderId,
        cartItems,
        totalAmount,
        customerInfo: formData,
        paymentMethod: 'CASH',
        status: 'PENDING',
      };

      try {
        await fetch('http://localhost:5000/api/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        await fetch('http://localhost:5000/api/update-product-quantity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cartItems }),
        });

        clearCart();
        navigate('/order-success');
      } catch (error) {
        console.error('Lỗi khi xử lý thanh toán CASH:', error);
        toast.error('Lỗi khi xử lý thanh toán CASH');
        setLoading(false);
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex mb-8 border-b pb-1">
        <div className="flex-1 text-center bg-gray-200 text-gray-500 py-2 font-medium">
          GIỎ HÀNG
        </div>
        <div className="flex-1 text-center bg-pink-500 text-white py-2 font-medium">
          GIAO HÀNG VÀ THANH TOÁN
        </div>
        <div className="flex-1 text-center bg-gray-200 text-gray-500 py-2 font-medium">
          HOÀN TẤT
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-blue-600">1. Tài khoản và chi tiết thanh toán</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập đầy đủ họ và tên của bạn"
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quốc gia/Khu vực <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ nguồn nhận hoa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Bạn muốn giao đến đâu"
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Căn hộ, bở, phường, đường, v.v., (tùy chọn)
                </label>
                <input
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                >
                  <option value="" disabled>
                    Chọn tỉnh/thành phố
                  </option>
                  {provinces.map((province, index) => (
                    <option key={index} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Số điện thoại để shop gọi ra xác nhận đơn hàng"
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thêm lời nhắn bạn muốn thể hiện trên món quà (tùy chọn)
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thông tin mong muốn khách hàng yêu cầu (tùy chọn)
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={invoiceRequested}
                  onChange={() => setInvoiceRequested(!invoiceRequested)}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">
                  Tích chọn nếu bạn chia giao hàng và thanh toán có thể đến địa chỉ khác nhau{' '}
                  <span className="text-red-500">*</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-600">3. Phương thức thanh toán</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="TRANSFER"
                  checked={paymentMethod === 'TRANSFER'}
                  onChange={() => setPaymentMethod('TRANSFER')}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Thanh toán chuyển khoản</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH"
                  checked={paymentMethod === 'CASH'}
                  onChange={() => setPaymentMethod('CASH')}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Thanh toán khi nhận hàng</label>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-1/3">
          <div className="border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-center border-b pb-2 mb-4">TỔNG GIỎ HÀNG</h2>

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-sm text-gray-600">
                  <th className="py-2">SẢN PHẨM</th>
                  <th className="py-2 text-center">SỐ LƯỢNG</th>
                  <th className="py-2 text-right">THÀNH TIỀN</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item: CartItem) => (
                  <tr key={item.productId} className="border-b">
                    <td className="py-4 flex items-center gap-2">
                      <img
                        src={item.image || '/images/placeholder.png'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="text-sm text-gray-800">{item.name}</div>
                    </td>
                    <td className="py-4 text-center text-sm">
                      {item.quantity} x {item.price.toLocaleString()} đ
                    </td>
                    <td className="py-4 text-right text-sm text-pink-600 font-medium">
                      {(item.price * item.quantity).toLocaleString()} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between py-2 border-b mt-4">
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
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 text-center mt-4 transition-colors ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {loading ? 'Đang xử lý...' : 'GIAO HÀNG VÀ THANH TOÁN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}