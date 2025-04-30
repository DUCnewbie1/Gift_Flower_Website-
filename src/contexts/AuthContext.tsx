import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  name: string;
  email: string;
  isVerified?: boolean;
}

interface AuthContextProps {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: () => {},
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

  const login = (userData: User) => {
    if (!userData.isVerified) {
      throw new Error("Tài khoản chưa được xác minh. Vui lòng kiểm tra email để xác nhận.");
    }
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
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