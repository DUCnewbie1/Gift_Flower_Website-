import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the type for favorite items
interface FavoriteItem {
  id: number;
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
  removeFromFavorites: (id: number) => void;
  isInFavorites: (id: number) => boolean;
  totalFavoriteItems: number;
}

// Create the context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Create a provider component
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [totalFavoriteItems, setTotalFavoriteItems] = useState(0);

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavoriteItems(JSON.parse(storedFavorites));
    }
  }, []);

  // Update localStorage and total count when favorites change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favoriteItems));
    setTotalFavoriteItems(favoriteItems.length);
  }, [favoriteItems]);

  // Add an item to favorites
  const addToFavorites = (item: FavoriteItem) => {
    // Check if item is already in favorites
    if (!favoriteItems.some(favoriteItem => favoriteItem.id === item.id)) {
      setFavoriteItems([...favoriteItems, item]);
    }
  };

  // Remove an item from favorites
  const removeFromFavorites = (id: number) => {
    setFavoriteItems(favoriteItems.filter(item => item.id !== id));
  };

  // Check if an item is in favorites
  const isInFavorites = (id: number) => {
    return favoriteItems.some(item => item.id === id);
  };

  // Inside the FavoritesProvider component
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