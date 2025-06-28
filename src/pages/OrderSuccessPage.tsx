import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function OrderSuccessPage() {
  const location = useLocation();
  const { clearCart, cartItems } = useCart();
  const { user } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [toastShown, setToastShown] = useState(false);
  // Kiểm tra xem user có đăng nhập không
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const resultCode = queryParams.get('resultCode');
    const orderId = queryParams.get('orderId');
    const amount = queryParams.get('amount');

    // Kiểm tra trạng thái thanh toán từ query params
    if (resultCode) {
      if (resultCode === '0') {
        setPaymentStatus('SUCCESS');
        clearCart();

        // Kiểm tra userId hợp lệ
        const userId = user?._id;
        if (!userId) {
          toast.error('Vui lòng đăng nhập để tiếp tục');
          setPaymentStatus('FAILED');
          return;
        }

        // Lấy customerInfo từ localStorage
        const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || '{}');

        // Gọi API để lưu đơn hàng
        fetch('http://localhost:5000/api/save-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: orderId || 'ORDER-UNKNOWN',
            amount: parseInt(amount || '0') || 0,
            paymentMethod: 'TRANSFER',
            status: 'SUCCESS',
            userId, // Chỉ gửi userId nếu hợp lệ
            cartItems,
            customerInfo,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Lưu đơn hàng:', data);
            localStorage.removeItem('customerInfo'); // Xóa customerInfo sau khi lưu
          })
          .catch((error) => {
            console.error('Lỗi khi lưu đơn hàng:', error);
            if (!toastShown) {
              toast.error('Lỗi khi lưu đơn hàng');
              setToastShown(true);
            }
          });

        if (!toastShown) {
          toast.success('Thanh toán thành công', {
            autoClose: 3000,
          });
          setToastShown(true);
        }
      } else {
        setPaymentStatus('FAILED');
        if (!toastShown) {
          toast.error('Thanh toán thất bại');
          setToastShown(true);
        }
      }
    }

    if (orderId) {
      setOrderId(orderId);
      fetch(`http://localhost:5000/api/order/${orderId}`)
        .then((response) => response.json())
        .then((order) => {
          if (order.status === 'SUCCESS') {
            setPaymentStatus('SUCCESS');
            if (!toastShown) {
              toast.success('Thanh toán thành công', {
                autoClose: 3000,
              });
              setToastShown(true);
            }
          } else if (order.status === 'FAILED') {
            setPaymentStatus('FAILED');
            if (!toastShown) {
              toast.error('Thanh toán thất bại');
              setToastShown(true);
            }
          }
        })
        .catch((error) => {
          console.error('Lỗi khi kiểm tra trạng thái đơn hàng:', error);
          if (!toastShown) {
            toast.error('Không thể kiểm tra trạng thái đơn hàng');
            setToastShown(true);
          }
        });
    }

    if (amount) {
      setAmount(amount);
    }
  }, [location, clearCart, toastShown, user, cartItems]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-center">
      <div className="flex mb-8 border-b pb-1">
        <div className="flex-1 text-center bg-gray-200 text-gray-500 py-2 font-medium">
          GIỎ HÀNG
        </div>
        <div className="flex-1 text-center bg-gray-200 text-gray-500 py-2 font-medium">
          GIAO HÀNG VÀ THANH TOÁN
        </div>
        <div className="flex-1 text-center bg-pink-500 text-white py-2 font-medium">
          HOÀN TẤT
        </div>
      </div>

      {paymentStatus === 'SUCCESS' ? (
        <>
          <h2 className="text-2xl font-bold text-green-600 mb-4">Đặt hàng thành công!</h2>
          <p className="text-gray-600 mb-2">Mã đơn hàng: {orderId}</p>
          <p className="text-gray-600 mb-2">Số tiền: {parseInt(amount).toLocaleString()} đ</p>
          <p className="text-gray-600 mb-6">
            Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi. Đơn hàng của bạn đã được ghi nhận.
          </p>
        </>
      ) : paymentStatus === 'FAILED' ? (
        <>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Thanh toán thất bại!</h2>
          <p className="text-gray-600 mb-6">
            Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Đang kiểm tra trạng thái...</h2>
          <p className="text-gray-600 mb-6">
            Vui lòng đợi trong giây lát, chúng tôi đang kiểm tra trạng thái đơn hàng của bạn.
          </p>
        </>
      )}

      <Link
        to="/"
        className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition-colors"
      >
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}