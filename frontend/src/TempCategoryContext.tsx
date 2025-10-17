// src/context/TempCategoryContext.tsx
// @ts-nocheck
import React, { createContext, useContext, useState } from "react";

export type TempCategory = {
  name: string;         // �?ื�?อหมว�?�?ี�?�?ู�?�?�?�?�?ั�?�?�?อ�?
  iconKey: string;      // �?ีย�?�?อ�?อ�?�?ี�?�?ลือก (�?�?�?ระ�?ุว�?า�?ะวา�?�?อ�?อ�?อะ�?ร)
};

type Ctx = {
  tempCategory: TempCategory | null;
  setTempCategory: (c: TempCategory) => void;
  clearTempCategory: () => void;
};

const TempCategoryContext = createContext<Ctx | undefined>(undefined);

export function TempCategoryProvider({ children }: { children: React.ReactNode }) {
  const [tempCategory, setTempCategoryState] = useState<TempCategory | null>(null);

  const setTempCategory = (c: TempCategory) => setTempCategoryState(c);
  const clearTempCategory = () => setTempCategoryState(null);

  return (
    <TempCategoryContext.Provider value={{ tempCategory, setTempCategory, clearTempCategory }}>
      {children}
    </TempCategoryContext.Provider>
  );
}

export function useTempCategory() {
  const ctx = useContext(TempCategoryContext);
  if (!ctx) throw new Error("useTempCategory must be used within TempCategoryProvider");
  return ctx;
}




