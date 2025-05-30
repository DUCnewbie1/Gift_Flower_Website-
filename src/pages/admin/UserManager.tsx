import { useEffect, useState } from "react";
import moment from "moment";
import "moment/locale/vi";
import { 
  ShieldCheck, 
  ShieldHalf, 
  UserPlus, 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  UserX,
  CheckCircle,
  XCircle, 
  RefreshCw,
  Edit,
  Trash2
} from "lucide-react";

moment.locale("vi");

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "customer";
  isVerified: boolean;
  createdAt: string;
  isBlocked?: boolean;
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff" as "admin" | "staff" | "customer"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Sử dụng fetch thay cho axios
      const response = await fetch("/api/users");
      const data = await response.json();
      
      // Giả định rằng API trả về mảng người dùng, có thể thêm isBlocked khi cần
      const userData = Array.isArray(data) ? data.map(user => ({
        ...user,
        isBlocked: user.isBlocked || false
      })) : [];
      
      setUsers(userData);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách người dùng:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error("Không thể tạo người dùng");
      
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi tạo người dùng:", err);
      alert("Không thể tạo người dùng. Vui lòng thử lại sau.");
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error("Không thể cập nhật người dùng");
      
      setShowAddModal(false);
      resetForm();
      setEditMode(false);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi cập nhật người dùng:", err);
      alert("Không thể cập nhật người dùng. Vui lòng thử lại sau.");
    }
  };

  const handleBlockUser = async (userId: string, block: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isBlocked: block })
      });
      
      if (!response.ok) throw new Error("Không thể thay đổi trạng thái khóa");
      
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái khóa:", err);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) throw new Error("Không thể xóa người dùng");
      
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi xóa người dùng:", err);
      alert("Không thể xóa người dùng. Vui lòng thử lại sau.");
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Không hiển thị mật khẩu hiện tại
      role: user.role
    });
    setEditMode(true);
    setShowAddModal(true);
  };

  const confirmDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "staff"
    });
    setSelectedUser(null);
  };

  // Lọc người dùng dựa trên tìm kiếm và bộ lọc
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterRole === "all" || user.role === filterRole;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <button 
          onClick={() => {
            resetForm();
            setEditMode(false);
            setShowAddModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <UserPlus size={18} />
          Thêm người dùng
        </button>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="staff">Nhân viên</option>
            <option value="customer">Khách hàng</option>
          </select>
        </div>
        <button 
          onClick={fetchUsers}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center"
          title="Làm mới danh sách"
        >
          <RefreshCw size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Bảng danh sách người dùng */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600 text-sm">
                <th className="px-4 py-3 font-medium">Họ tên</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Vai trò</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Ngày tạo</th>
                <th className="px-4 py-3 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <div className="flex justify-center items-center space-x-2">
                      <RefreshCw size={20} className="animate-spin text-blue-500" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Không tìm thấy người dùng phù hợp
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium mr-3">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">{renderRoleBadge(user.role)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {renderVerifyBadge(user.isVerified)}
                        {user.isBlocked && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Đã khóa
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {moment(user.createdAt).format("DD/MM/YYYY HH:mm")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center space-x-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleBlockUser(user._id, !user.isBlocked)}
                          className={`p-1 rounded ${user.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-amber-600 hover:bg-amber-50'}`}
                          title={user.isBlocked ? "Mở khóa" : "Khóa"}
                        >
                          {user.isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
                        </button>
                        {user.role !== "admin" && (
                          <button
                            onClick={() => confirmDeleteUser(user)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal thêm/sửa người dùng */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editMode ? "Cập nhật người dùng" : "Thêm người dùng mới"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editMode ? "Mật khẩu mới (để trống nếu không thay đổi)" : "Mật khẩu"}
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as "admin" | "staff" | "customer"})}
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Nhân viên</option>
                  <option value="customer">Khách hàng</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowAddModal(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={editMode ? handleUpdateUser : handleCreateUser}
              >
                {editMode ? "Cập nhật" : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <XCircle size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Xác nhận xóa người dùng</h3>
              <p className="text-gray-500">
                Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedUser.name}</strong>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleDeleteUser}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Badge theo vai trò
function renderRoleBadge(role: string) {
  switch (role) {
    case "admin":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ShieldCheck size={14} className="mr-1" /> 
          Admin
        </span>
      );
    case "staff":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <ShieldHalf size={14} className="mr-1" /> 
          Nhân viên
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Khách hàng
        </span>
      );
  }
}

// Badge xác thực
function renderVerifyBadge(verified: boolean) {
  return verified ? (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <CheckCircle size={14} className="mr-1" />
      Đã xác thực
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      <XCircle size={14} className="mr-1" />
      Chưa xác thực
    </span>
  );
}