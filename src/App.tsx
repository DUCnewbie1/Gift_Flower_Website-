import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import FavoritesPage from "./pages/FavoritesPage";
import VerifyCodePage from "./pages/VerifyCodePage";
import SearchResults from "./pages/SearchResults";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import ProductManager from "./pages/admin/ProductManager";
import OrderManager from "./pages/admin/OrderManager";
import UserManager from "./pages/admin/UserManager";
import BannerManager from "./pages/admin/BannerManager";
import DiscountManager from "./pages/admin/DiscountManager";
import AdminLogin from "./pages/admin/AdminLogin"; 

import StaffLayout from "./layouts/StaffLayout";
import StaffDashboard from "./pages/staff/Dashboard";
import OrderHandling from "./pages/staff/OrderHandling";

import { CartProvider } from "./contexts/CartContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ReviewsProvider } from "./contexts/ReviewsContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { ReactNode } from "react";

// ✅ Route bảo vệ theo role
interface ProtectedRouteProps {
  children: ReactNode;
  role: "admin" | "staff";
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <ReviewsProvider>
            <BrowserRouter>
              <Routes>
                {/* 👤 Layout chính cho khách hàng */}
                <Route path="/" element={<Layout><Outlet /></Layout>} >
                  <Route index element={<HomePage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="verify-code" element={<VerifyCodePage />} />
                  <Route path="list" element={<ProductListPage />} />
                  <Route path="detail/:id" element={<ProductDetailPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="order-success" element={<OrderSuccessPage />} />
                  <Route path="favorites" element={<FavoritesPage />} />
                  <Route path="search" element={<SearchResults />} />
                  <Route path="blog" element={<BlogList />} />
                  <Route path="blog/:id" element={<BlogDetail />} />
                </Route>

                {/* 🔐 Đăng nhập Admin */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* 🛠 Admin layout */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<ProductManager />} />
                  <Route path="orders" element={<OrderManager />} />
                  <Route path="users" element={<UserManager />} />
                  <Route path="banners" element={<BannerManager />} />
                  <Route path="discounts" element={<DiscountManager />} />
                </Route>

                {/* 👷 Layout cho nhân viên */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute role="staff">
                      <StaffLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<StaffDashboard />} />
                  <Route path="orders" element={<OrderHandling />} />
                </Route>
              </Routes>

              <ToastContainer position="top-right" autoClose={3000} />
            </BrowserRouter>
          </ReviewsProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
