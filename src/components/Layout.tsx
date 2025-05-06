import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useAuth } from "../contexts/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);

  const { cartItems, totalItems, removeFromCart, updateQuantity, totalAmount } =
    useCart();
  const { totalFavoriteItems } = useFavorites();
  const { user, logout } = useAuth();

  // Handle quantity changes for cart dropdown
  const handleDecrease = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  const handleIncrease = (productId: string, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  // Address selection states
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [showingDistricts, setShowingDistricts] = useState(true);

  // Example data for districts and wards in HCMC
  const districts = [
    "TP. Thủ Đức (Q2, Q9, Thủ Đức)",
    "Quận 1",
    "Quận 3",
    "Quận 4",
    "Quận 5",
    "Quận 6",
    "Quận 7",
    "Quận 8",
    "Quận 10",
    "Quận 11",
    "Quận 12",
    "Quận Bình Thạnh",
    "Quận Gò Vấp",
    "Quận Phú Nhuận",
    "Quận Tân Bình",
    "Quận Tân Phú",
    "Quận Bình Tân",
  ];

  const wards: { [district: string]: string[] } = {
    "Quận 1": [
      "Phường Bến Nghé",
      "Phường Bến Thành",
      "Phường Cầu Kho",
      "Phường Cầu Ông Lãnh",
      "Phường Cô Giang",
      "Phường Đa Kao",
      "Phường Nguyễn Cư Trinh",
      "Phường Nguyễn Thái Bình",
      "Phường Phạm Ngũ Lão",
      "Phường Tân Định",
    ],
  };

  // Helper to get wards for a district
  const getWardsForDistrict = (district: string) => {
    return (
      wards[district] || [
        "Phường Bến Nghé",
        "Phường Bến Thành",
        "Phường Cầu Kho",
        "Phường Cầu Ông Lãnh",
        "Phường Cô Giang",
        "Phường Đa Kao",
        "Phường Nguyễn Cư Trinh",
        "Phường Nguyễn Thái Bình",
        "Phường Phạm Ngũ Lão",
        "Phường Tân Định",
      ]
    );
  };

  // Handle district selection
  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    setShowingDistricts(false);
  };

  // Handle ward selection
  const handleWardSelect = (ward: string) => {
    setSelectedWard(ward);
    setAddressModalOpen(false);
  };

  // Reset to district selection
  const backToDistricts = () => {
    setShowingDistricts(true);
  };

  // Format the selected address for display
  const getDisplayAddress = () => {
    if (selectedWard && selectedDistrict) {
      return `${selectedWard}, ${selectedDistrict}`;
    }
    return "Hệ thống cửa hàng";
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with logo, search and navigation */}
      <header className="w-full flex items-center justify-between px-6 bg-white shadow-sm h-24">
        <div className="font-bold text-xl text-pink-600 flex items-center gap-1">
          <img
            src="/logo-placeholder.png"
            alt="Gifting"
            className="h-10 w-10"
          />
          <span>Gifting</span>
        </div>

        <div className="flex-1 flex justify-center items-center mx-6">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder="Bạn muốn tìm gì?"
              className="bg-white border border-gray-300 rounded-full px-4 py-1.5 w-full shadow-sm focus:outline-none focus:ring-1 focus:ring-pink-300"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-pink-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        <nav className="flex gap-6 items-center">
          {/* Location selector button */}
          <div className="relative">
            <button
              onClick={() => setAddressModalOpen(true)}
              className="flex items-center px-4 py-2 bg-white rounded-full text-gray-700 font-normal shadow transition hover:brightness-105 min-w-[340px] max-w-[420px] w-full border border-gray-200"
              style={{ minWidth: 0 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 flex-shrink-0 text-pink-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {selectedWard && selectedDistrict ? (
                <>
                  <span className="mr-1 text-xs font-normal">Giao đến:</span>
                  <span className="font-semibold text-xs whitespace-nowrap overflow-hidden text-ellipsis flex-1 text-left">
                    {`P.${selectedWard.replace(/^Phường\s+/i, "")}, ${selectedDistrict}, TP. Hồ Chí Minh`}
                  </span>
                </>
              ) : (
                <span className="font-semibold text-xs">Hệ thống cửa hàng</span>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2 flex-shrink-0 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {/* Address selection modal */}
            {addressModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white w-full max-w-md rounded-lg overflow-hidden shadow-xl">
                  {/* Modal header */}
                  <div className="bg-gradient-to-r from-pink-500 to-purple-700 text-white px-4 py-3 flex items-center">
                    <button
                      onClick={() => {
                        if (!showingDistricts && selectedDistrict) {
                          backToDistricts();
                        } else {
                          setAddressModalOpen(false);
                        }
                      }}
                      className="mr-2"
                    >
                      {!showingDistricts ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </button>
                    <h3 className="text-center flex-1 font-medium">
                      {showingDistricts ? "Chọn Quận/Huyện" : "Chọn Phường/Xã"}
                    </h3>
                  </div>

                  {/* Location finder */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-pink-600 mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="font-medium">
                        Lấy vị trí hiện tại của bạn
                      </span>
                    </div>

                    {/* Search input */}
                    <div className="relative mb-4">
                      <input
                        type="text"
                        placeholder="Tìm nhanh Tỉnh Thành, Quận Huyện"
                        className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* List of locations */}
                    <div className="max-h-72 overflow-y-auto">
                      {showingDistricts
                        ? // District list
                          districts.map((district, index) => (
                            <div
                              key={index}
                              className="py-3 px-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleDistrictSelect(district)}
                            >
                              {district}
                            </div>
                          ))
                        : // Wards list for selected district
                          getWardsForDistrict(selectedDistrict || "").map(
                            (ward, index) => (
                              <div
                                key={index}
                                className="py-3 px-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleWardSelect(ward)}
                              >
                                {ward}
                              </div>
                            )
                          )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer support button */}
          <a href="#" className="flex items-center gap-2 text-gray-700">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-pink-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div className="flex flex-col text-xs">
              <span>Hỗ trợ</span>
              <span>khách hàng</span>
            </div>
          </a>
          <a href="#" className="flex items-center text-gray-700 relative">
            {/* Shopping Cart Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCartDropdownOpen(true)}
              onMouseLeave={() => {
                setTimeout(() => {
                  if (!document.querySelector(".cart-dropdown:hover")) {
                    setCartDropdownOpen(false);
                  }
                }, 500);
              }}
            >
              <button
                className="flex items-center text-gray-700 relative"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/cart");
                }}
              >
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-pink-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                </div>
                <span className="text-xs ml-1">Giỏ hàng</span>
              </button>
              {cartDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white rounded shadow-lg z-50 cart-dropdown"
                  onMouseEnter={() => {
                    setCartDropdownOpen(true);
                  }}
                  onMouseLeave={() => {
                    setTimeout(() => {
                      setCartDropdownOpen(false);
                    }, 500);
                  }}
                >
                  {cartItems.length === 0 ? (
                    <div className="p-6 flex flex-col items-center text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 mb-2 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <span>Không có sản phẩm nào trong giỏ hàng của bạn</span>
                    </div>
                  ) : (
                    <div>
                      <div className="max-h-64 overflow-y-auto divide-y">
                        {cartItems.map((item) => (
                          <div key={item._id} className="flex p-3 gap-2">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-800 truncate">
                                {item.name}
                              </div>
                              <button
                                className="text-pink-500 text-xs hover:underline"
                                onClick={() => removeFromCart(item._id)}
                                type="button"
                              >
                                Xóa
                              </button>
                              <div className="flex items-center mt-1 gap-2">
                                <span className="text-xs">Số lượng</span>
                                <button
                                  className="w-5 h-5 border border-gray-300 rounded text-gray-600"
                                  onClick={() =>
                                    handleDecrease(item._id, item.quantity)
                                  }
                                  type="button"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-xs">
                                  {item.quantity}
                                </span>
                                <button
                                  className="w-5 h-5 border border-gray-300 rounded text-gray-600"
                                  onClick={() =>
                                    handleIncrease(item._id, item.quantity)
                                  }
                                  type="button"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                              <span className="text-pink-600 font-semibold text-sm">
                                {(item.price * item.quantity).toLocaleString()}₫
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Tổng tiền:</span>
                          <span className="text-pink-600 font-bold">
                            {totalAmount.toLocaleString()}₫
                          </span>
                        </div>
                        <button
                          className="w-full bg-pink-500 text-white rounded py-2 font-semibold hover:bg-pink-600 transition"
                          onClick={() => navigate("/cart")}
                        >
                          Thanh toán
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </a>
        </nav>
      </header>

      {/* Main navigation menu */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-700 w-full flex items-center px-6 py-3 text-white font-medium text-sm gap-6">
        <Link to="/" className="hover:text-purple-200">
          Trang chủ
        </Link>
        <a className="hover:text-purple-200" href="#">
          Giới thiệu
        </a>
        {/* Dropdown sản phẩm */}
        <div className="relative group">
          <button className="hover:text-purple-200 flex items-center gap-1">
            Sản phẩm
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          <div className="hidden group-hover:grid grid-cols-3 gap-8 absolute top-full left-0 bg-white text-gray-700 py-4 px-6 shadow-lg rounded-b-lg w-[800px] z-20">
            {/* Cột 1 */}
            <div className="flex flex-col gap-2">
              <div className="font-bold">Set Quà Tặng</div>
              <a href="#" className="hover:text-pink-500">
                Quà sinh nhật
              </a>
              <a href="#" className="hover:text-pink-500">
                Quà tặng cao cấp
              </a>
              <a href="#" className="hover:text-pink-500">
                Quà tặng Noel
              </a>

              <div className="font-bold mt-4">Đèn Trang Trí</div>
              <a href="#" className="hover:text-pink-500">
                Đèn bàn
              </a>
              <a href="#" className="hover:text-pink-500">
                Đèn ngủ
              </a>
            </div>

            {/* Cột 2 */}
            <div className="flex flex-col gap-2">
              <div className="font-bold">Hộp Mica</div>
              <a href="#" className="hover:text-pink-500">
                Hộp mica cao cấp
              </a>

              <div className="font-bold mt-4">Thú Bông</div>
              <a href="#" className="hover:text-pink-500">
                Gấu bông tình yêu
              </a>
              <a href="#" className="hover:text-pink-500">
                Mèo thần tài
              </a>

              <div className="font-bold mt-4">Gốm Sứ, Thủy Tinh</div>
              <a href="#" className="hover:text-pink-500">
                Bình giữ nhiệt
              </a>
            </div>

            {/* Cột 3 */}
            <div className="flex flex-col gap-2">
              <div className="font-bold">Hoa Khô</div>
              <a href="#" className="hover:text-pink-500">
                Hoa bó
              </a>
              <a href="#" className="hover:text-pink-500">
                Hoa trang trí
              </a>

              <div className="font-bold mt-4">Móc Khóa</div>
              <a href="#" className="hover:text-pink-500">
                Móc khóa quà tặng
              </a>

              <div className="font-bold mt-4">Văn Phòng Phẩm</div>
              <a href="#" className="hover:text-pink-500">
                Sổ tay
              </a>
              <a href="#" className="hover:text-pink-500">
                Bút ký cao cấp
              </a>
            </div>
          </div>
        </div>
        <a className="hover:text-purple-200" href="#">
          Dịch vụ gói quà
        </a>
        <a className="hover:text-purple-200" href="#">
          Kinh nghiệm
        </a>
        <a className="hover:text-purple-200" href="#">
          Cách chọn quà
        </a>
        <a className="hover:text-purple-200" href="#">
          Liên hệ
        </a>

        <div className="ml-auto flex items-center gap-3">
          {/* Favorites button */}
          <a href="/favorites" className="flex items-center gap-1 text-white">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {totalFavoriteItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {totalFavoriteItems}
                </span>
              )}
            </div>
            <span>Yêu thích</span>
          </a>

          {/* Account button with dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-1 text-white focus:outline-none"
              onMouseEnter={() => setIsDropdownOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{user ? user.name : "Tài khoản"}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-50 py-2 text-gray-700"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                {user ? (
                  <>
                    <span
                      onClick={() => (window.location.href = "/profile")}
                      className="block px-4 py-2 text-sm font-medium text-black-600 hover:bg-gray-100 cursor-pointer"
                    >
                      Thông tin cá Nhân
                    </span>

                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-pink-50"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-sm hover:bg-pink-50"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 text-sm hover:bg-pink-50"
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-500 to-purple-700 text-white py-8 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h4 className="font-bold mb-4 text-lg">Gifting</h4>
            <p className="text-sm mb-2">
              Nơi tất cả mọi người đều có thể tìm kiếm và lựa chọn những món quà
              ý nghĩa.
            </p>
            <p className="text-sm">Hotline: 0123456789</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">VỀ CHÚNG TÔI</h4>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Sản phẩm
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Dịch vụ gói quà
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Kinh nghiệm
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">CHÍNH SÁCH</h4>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Chính sách vận chuyển
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Chính sách thanh toán
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Chính sách bảo hành
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">ĐĂNG KÝ NHẬN TIN</h4>
            <p className="text-sm mb-2">
              Bạn có muốn nhận thông tin mới nhất từ chúng tôi?
            </p>
            <div className="flex mt-2">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="px-3 py-1 text-sm rounded-l text-gray-800 w-full"
              />
              <button className="bg-pink-500 px-3 py-1 rounded-r text-sm">
                GỬI
              </button>
            </div>
            <div className="flex gap-2 mt-4">
              <a
                href="#"
                className="bg-white text-pink-600 rounded-full w-8 h-8 flex items-center justify-center"
              >
                f
              </a>
              <a
                href="#"
                className="bg-white text-pink-600 rounded-full w-8 h-8 flex items-center justify-center"
              >
                in
              </a>
              <a
                href="#"
                className="bg-white text-pink-600 rounded-full w-8 h-8 flex items-center justify-center"
              >
                p
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-pink-400 mt-6 pt-4 text-center text-sm">
          <p>© Bản quyền thuộc về LofiGifting | Cung cấp bởi Shopee</p>
        </div>
      </footer>
    </div>
  );
}
