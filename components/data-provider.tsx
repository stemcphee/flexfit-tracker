"use client";

import { createContext, useContext } from "react";
import { useLocalData } from "@/hooks/use-local-data";

type DataContextValue = ReturnType<typeof useLocalData>;

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const value = useLocalData();
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
}
