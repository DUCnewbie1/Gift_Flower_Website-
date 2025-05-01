import React, { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  name: string;
  email: string;
  isVerified?: boolean;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsedUser: User = JSON.parse(stored);
      if (parsedUser.isVerified) {
        setUser(parsedUser);
      } else {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Kiểm tra dữ liệu đầu vào
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      toast.error('Vui lòng nhập email và mật khẩu hợp lệ');
      throw new Error('Dữ liệu không hợp lệ');
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const userData: User = res.data.user;
      if (!userData.isVerified) {
        throw new Error('Tài khoản chưa được xác minh. Vui lòng kiểm tra email để xác nhận.');
      }
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Đăng nhập thành công!');
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : 'Đăng nhập thất bại';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Đã đăng xuất');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};