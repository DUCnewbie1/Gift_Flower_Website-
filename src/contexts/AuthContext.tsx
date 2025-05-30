import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Định nghĩa kiểu user
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "customer";
  isVerified?: boolean;
  token?: string;
}

// Kiểu props của AuthContext
interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

// Tạo Context với giá trị mặc định rõ ràng
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider chính
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsedUser: User = JSON.parse(stored);
      if (parsedUser.isVerified && parsedUser.token && parsedUser.role) {
        setUser(parsedUser);
        axios.defaults.headers.common["Authorization"] = `Bearer ${parsedUser.token}`;
      } else {
        localStorage.removeItem("user");
        setUser(null);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      console.log("Dữ liệu từ API:", res.data);

      const { user: userData, token } = res.data;

      const fullUser: User = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role || "customer", 
        isVerified: userData.isVerified ?? false,
        token: token || "", 
      };

      console.log("FullUser trước khi lưu:", fullUser);
      setUser(fullUser);
      localStorage.setItem("user", JSON.stringify(fullUser));
      console.log("Dữ liệu trong localStorage:", localStorage.getItem("user"));
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      toast.success("Đăng nhập thành công!");
      return fullUser;
    } catch (err: any) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Đăng nhập thất bại";
      toast.error(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Đã đăng xuất");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook sử dụng AuthContext
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
};