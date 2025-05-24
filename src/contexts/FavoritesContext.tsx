import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

// Define the type for favorite items
interface FavoriteItem {
  _id: string; 
  name: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  image: string;
}

// Define the context type
interface FavoritesContextType {
  favoriteItems: FavoriteItem[];
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: string) => void; // Thay number thành string
  isInFavorites: (id: string) => boolean; // Thay number thành string
  totalFavoriteItems: number;
}

// Create the context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Create a provider component
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [totalFavoriteItems, setTotalFavoriteItems] = useState(0);

  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>(() => {
    try {
      const stored = localStorage.getItem("favorites");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Lỗi parse favorites:", error);
      return [];
    }
  });
  
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favoriteItems));
    setTotalFavoriteItems(favoriteItems.length);
  }, [favoriteItems]);

  const addToFavorites = (item: FavoriteItem) => {
    console.log("Thêm sản phẩm:", item); 
    if (!favoriteItems.some(fav => fav._id === item._id)) {
      setFavoriteItems([...favoriteItems, item]);
      toast.success('Đã thêm sản phẩm vào danh sách yêu thích!');
    }
  };
  

  // Remove an item from favorites
  const removeFromFavorites = (id: string) => {
    setFavoriteItems(favoriteItems.filter(item => item._id !== id));
    toast.info('Đã xóa sản phẩm khỏi danh sách yêu thích');
  };

  // Check if an item is in favorites
  const isInFavorites = (id: string) => {
    return favoriteItems.some(item => item._id === id);
  };

  return (
    <FavoritesContext.Provider value={{
      favoriteItems,
      addToFavorites,
      removeFromFavorites,
      isInFavorites,
      totalFavoriteItems
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Create a custom hook to use the favorites context
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};