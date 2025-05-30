// src/layouts/AdminLayout.tsx
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LogOut,
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  Image,
  Percent,
  Folder,
} from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: <TrendingUp size={18} /> },
    { path: "/admin/products", label: "Quản lý sản phẩm", icon: <Package size={18} /> },
    { path: "/admin/orders", label: "Đơn hàng", icon: <ShoppingBag size={18} /> },
    { path: "/admin/users", label: "Người dùng", icon: <Users size={18} /> },
    { path: "/admin/banners", label: "Quản lý Banner", icon: <Image size={18} /> },
    { path: "/admin/discounts", label: "Quản lý Khuyến mãi", icon: <Percent size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-pink-600">🌸 Hoa Xinh Admin</h2>
          <p className="text-sm text-gray-400 mt-1">Hệ thống quản lý</p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                location.pathname === item.path
                  ? "bg-pink-100 text-pink-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 mt-auto pt-6 border-t border-gray-200">
          <button className="flex items-center text-red-500 hover:text-red-600">
            <LogOut size={18} className="mr-2" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
