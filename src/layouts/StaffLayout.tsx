import { Outlet, Link } from "react-router-dom";

export default function StaffLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-green-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Staff Panel</h2>
        <nav className="space-y-2">
          <Link to="/staff">Trang chủ</Link>
          <Link to="/staff/orders">Xử lý đơn hàng</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
