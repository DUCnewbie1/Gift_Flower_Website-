import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  syncCart: () => void; // Thêm hàm syncCart để gọi từ bên ngoài
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  syncCart: () => {}, // Thêm vào context
  totalItems: 0,
  totalAmount: 0,
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartCleared, setIsCartCleared] = useState(false);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const syncCartWithDB = async () => {
    if (user && user._id) {
      try {
        const res = await axios.get(`http://localhost:5000/api/cart/${user._id}`);
        const dbCart = res.data.items || [];
        setCartItems(dbCart);
        localStorage.setItem('cart', JSON.stringify(dbCart));

        if (dbCart.length === 0) {
          const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
          if (localCart.length > 0) {
            await axios.post('http://localhost:5000/api/cart/sync', {
              userId: user._id,
              items: localCart,
            });
            const updatedRes = await axios.get(`http://localhost:5000/api/cart/${user._id}`);
            setCartItems(updatedRes.data.items || []);
            localStorage.setItem('cart', JSON.stringify(updatedRes.data.items || []));
          }
        }
      } catch (err) {
        console.error('Lỗi khi đồng bộ giỏ hàng:', err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            // Nếu giỏ hàng không tồn tại, đặt cartItems về rỗng
            setCartItems([]);
            localStorage.setItem('cart', JSON.stringify([]));
          } else {
            toast.error(err.response?.data?.error || 'Lỗi khi đồng bộ giỏ hàng');
          }
        } else {
          toast.error('Lỗi không xác định khi đồng bộ giỏ hàng');
        }
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(localCart);
    }
  };

  useEffect(() => {
    syncCartWithDB();
  }, [user]);

  const syncCart = async () => {
    await syncCartWithDB();
  };

  const addToCart = async (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    try {
      const newItem: CartItem = { ...product, quantity };
      if (user && user._id) {
        const res = await axios.post('http://localhost:5000/api/cart/add', {
          userId: user._id,
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        });
        const updatedCart = res.data.items || [];
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      } else {
        setCartItems((prevItems) => {
          const existingItem = prevItems.find((item) => item._id === product._id);
          if (existingItem) {
            const updatedItems = prevItems.map((item) =>
              item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item
            );
            return updatedItems;
          }
          return [...prevItems, newItem];
        });
      }
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (err) {
      console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || 'Lỗi khi thêm vào giỏ hàng');
      } else {
        toast.error('Lỗi không xác định khi thêm vào giỏ hàng');
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    console.log(`Gọi removeFromCart với productId: ${productId}`);
    try {
      let updatedCartItems = cartItems;

      if (user && user._id) {
        const res = await axios.delete(`http://localhost:5000/api/cart/${user._id}/${productId}`);
        updatedCartItems = res.data.items || [];
      } else {
        updatedCartItems = cartItems.filter((item) => item._id !== productId);
      }

      setCartItems(updatedCartItems);
      localStorage.setItem('cart', JSON.stringify(updatedCartItems));
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || 'Lỗi khi xóa sản phẩm khỏi giỏ hàng');
      } else {
        toast.error('Lỗi không xác định khi xóa sản phẩm');
      }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      toast.warn('Số lượng phải lớn hơn 0');
      return;
    }

    try {
      if (user && user._id) {
        const res = await axios.put('http://localhost:5000/api/cart/update', {
          userId: user._id,
          productId,
          quantity,
        });
        const updatedCart = res.data.items || [];
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      } else {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item._id === productId ? { ...item, quantity } : item
          )
        );
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật số lượng:', err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || 'Lỗi khi cập nhật số lượng');
      } else {
        toast.error('Lỗi không xác định khi cập nhật số lượng');
      }
    }
  };

  const clearCart = async () => {
    if (isCartCleared) return;
    setIsCartCleared(true);

    try {
      if (user && user._id) {
        const res = await axios.delete(`http://localhost:5000/api/cart/${user._id}`);
        if (res.status === 200) {
          setCartItems([]);
          localStorage.removeItem('cart');
        }
      } else {
        setCartItems([]);
        localStorage.removeItem('cart');
      }
    } catch (err) {
      console.error('Lỗi khi xóa toàn bộ giỏ hàng:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setCartItems([]);
          localStorage.removeItem('cart');
        } else {
          toast.error(err.response?.data?.error || 'Lỗi khi xóa toàn bộ giỏ hàng');
        }
      } else {
        toast.error('Lỗi không xác định khi xóa giỏ hàng');
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCart, // Thêm vào value
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};