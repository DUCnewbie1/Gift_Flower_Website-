import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount: number | string;
  image: string;
  quantity: number;
  regionalStock?: number;
  basePrice?: number;
  additionalPrice?: number;
  stockByStore?: Array<{storeId: string, quantity: number}>;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  syncCart: () => void; 
  totalItems: number;
  totalAmount: number;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>; // thêm vào cuối

}

  const CartContext = createContext<CartContextType>({
    cartItems: [],
    addToCart: () => {},
    removeFromCart: () => {},
    updateQuantity: () => {},
    clearCart: () => {},
    syncCart: () => {},
    totalItems: 0,
    totalAmount: 0,
    setCartItems: () => {},
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
  const totalAmount = cartItems.reduce((total, item) => {
    const price = item.originalPrice ?? item.price;
    return total + price * item.quantity;
  }, 0);
  

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const syncCartWithStorage = () => {
    const localCart = localStorage.getItem('cart');
    if (localCart) {
      try {
        const parsed = JSON.parse(localCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        } else {
          console.warn('Dữ liệu cart trong localStorage không hợp lệ');
        }
      } catch (err) {
        console.error('Không thể parse dữ liệu localStorage:', err);
      }
    }
  };
  

  useEffect(() => {
    syncCartWithStorage();
  }, [user]);

  const syncCart = async () => {
    await syncCartWithStorage();
  };

  const normalizeDiscount = (discount: string | number | undefined): number => {
    if (typeof discount === 'string') {
      return parseInt(discount.replace('%', '')) || 0;
    }
    return discount || 0;
  };
  

  const addToCart = async (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    if (product.regionalStock !== undefined && product.regionalStock < quantity) {
      toast.error(`Chỉ còn ${product.regionalStock} sản phẩm trong khu vực của bạn`);
      return;
    }
  
    try {
      if (user && user._id) {
        const res = await axios.post('http://localhost:5000/api/cart/add', {
          userId: user._id,
          productId: product.productId,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          discount: typeof product.discount === 'string'
            ? parseInt(product.discount.replace('%', '')) || 0
            : product.discount || 0

        });
  
        const updatedCart = res.data.items || res.data.cart?.items || [];
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      } else {
        // ✅ Nếu chưa đăng nhập → localStorage
        setCartItems(prev => {
          const existing = prev.find(item => item.productId === product.productId);
          let updatedCart;
  
          if (existing) {
            if (product.regionalStock !== undefined && existing.quantity + quantity > product.regionalStock) {
              toast.error(`Không thể thêm. Tổng số lượng vượt quá tồn kho khu vực (${product.regionalStock})`);
              return prev;
            }
  
            updatedCart = prev.map(item =>
              item.productId === product.productId ? { ...item, quantity: item.quantity + quantity } : item
            );
          } else {
            updatedCart = [...prev, { ...product, quantity }];
          }
  
          localStorage.setItem('cart', JSON.stringify(updatedCart));
          return updatedCart;
        });
      }
  
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (err) {
      console.error('Lỗi khi thêm vào giỏ hàng:', err);
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
        updatedCartItems = cartItems.filter((item) => item.productId !== productId);
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
            item.productId === productId ? { ...item, quantity } : item
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

  useEffect(() => {
    if (user && user._id) {
      axios
        .post('http://localhost:5000/api/cart/sync', {
          userId: user._id, 
          items: cartItems.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            discount: normalizeDiscount(item.discount),

          })),
        })
        .catch((err) => {
          console.error('Lỗi khi đồng bộ cart lên backend:', err);
        });
    }    
  }, [cartItems, user]);
  

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
        setCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};