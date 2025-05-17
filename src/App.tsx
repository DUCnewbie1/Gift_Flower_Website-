import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { CartProvider } from "./contexts/CartContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import { ReviewsProvider } from "./contexts/ReviewsContext";

import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <ReviewsProvider>
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify-code" element={<VerifyCodePage />} />
                  <Route path="/list" element={<ProductListPage />} />
                  <Route path="/detail/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:id" element={<BlogDetail />} />
                </Routes>
              </Layout>
              <ToastContainer position="top-right" autoClose={3000} />
            </BrowserRouter>
          </ReviewsProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;