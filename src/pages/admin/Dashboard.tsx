// src/pages/admin/Dashboard.tsx
import {
  DollarSign,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const stats = [
  {
    icon: <ShoppingBag size={24} className="text-orange-500" />,
    label: "Tổng đơn hàng",
    value: "152",
    change: "+12.5%",
    up: true,
  },
  {
    icon: <DollarSign size={24} className="text-green-500" />,
    label: "Doanh thu tháng",
    value: "45.5M VNĐ",
    change: "+8.2%",
    up: true,
  },
  {
    icon: <Users size={24} className="text-blue-500" />,
    label: "Khách hàng mới",
    value: "34",
    change: "+25.8%",
    up: true,
  },
  {
    icon: <Package size={24} className="text-purple-500" />,
    label: "Sản phẩm",
    value: "86",
    change: "+5.7%",
    up: true,
  },
];

const data = [
  { name: 'T1', doanhThu: 4000 },
  { name: 'T2', doanhThu: 3000 },
  { name: 'T3', doanhThu: 2000 },
  { name: 'T4', doanhThu: 2780 },
  { name: 'T5', doanhThu: 1890 },
  { name: 'T6', doanhThu: 2390 },
  { name: 'T7', doanhThu: 3490 },
  { name: 'T8', doanhThu: 5000 },
  { name: 'T9', doanhThu: 4500 },
  { name: 'T10', doanhThu: 5200 },
  { name: 'T11', doanhThu: 6000 },
  { name: 'T12', doanhThu: 7000 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Trang Quản Trị Admin</h1>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <div key={i} className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-xl font-bold">{item.value}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                {item.icon}
              </div>
            </div>
            <p className={`mt-4 text-sm ${item.up ? "text-green-500" : "text-red-500"}`}>
              {item.change} so với tháng trước
            </p>
          </div>
        ))}
      </div>

      {/* Biểu đồ */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Doanh thu theo tháng</h2>
          <select className="text-sm border rounded px-2 py-1">
            <option>Năm 2025</option>
            <option>Năm 2024</option>
          </select>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="doanhThu" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
