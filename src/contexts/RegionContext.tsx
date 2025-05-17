import React, { createContext, useContext, useState, useEffect } from "react";

interface RegionContextType {
  selectedDistrict: string | null;
  selectedWard: string | null;
  setSelectedDistrict: (district: string | null) => void;
  setSelectedWard: (ward: string | null) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);

  useEffect(() => {
    const savedDistrict = localStorage.getItem("selectedDistrict");
    const savedWard = localStorage.getItem("selectedWard");
    if (savedDistrict) setSelectedDistrict(savedDistrict);
    if (savedWard) setSelectedWard(savedWard);
  }, []);

  useEffect(() => {
    if (selectedDistrict) localStorage.setItem("selectedDistrict", selectedDistrict);
    else localStorage.removeItem("selectedDistrict");
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedWard) localStorage.setItem("selectedWard", selectedWard);
    else localStorage.removeItem("selectedWard");
  }, [selectedWard]);

  return (
    <RegionContext.Provider value={{ selectedDistrict, selectedWard, setSelectedDistrict, setSelectedWard }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) throw new Error("useRegion must be used within a RegionProvider");
  return context;
};