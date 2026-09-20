// src/context/PartContext.tsx
import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react"; // 💡 타입 전용 import로 수정

interface PartContextType {
  selectedPartIds: string[];
  setSelectedPartIds: React.Dispatch<React.SetStateAction<string[]>>;
  togglePart: (id: string) => void;
  selectSinglePart: (id: string) => void;
  addPart: (id: string) => void; // 💡 부품 추가(누적) 함수 추가
  clearSelection: () => void;
}

const PartContext = createContext<PartContextType | undefined>(undefined);

export const PartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);

  // 단일 선택 (기존 유지)
  const selectSinglePart = (id: string) => {
    setSelectedPartIds([id]);
  };

  // 💡 토글 함수: 이미 있으면 제거, 없으면 추가 (다중 선택 지원용)
  const togglePart = (id: string) => {
    setSelectedPartIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 💡 부품을 중복해서 여러 개 추가할 수 있는 누적 함수 (플렉시블 조인트 여러 개 추가용)
  const addPart = (id: string) => {
    setSelectedPartIds((prev) => [...prev, id]);
  };

  const clearSelection = () => {
    setSelectedPartIds([]);
  };

  return (
    <PartContext.Provider
      value={{
        selectedPartIds,
        setSelectedPartIds,
        togglePart,
        selectSinglePart,
        addPart,
        clearSelection,
      }}
    >
      {children}
    </PartContext.Provider>
  );
};

export const usePartContext = () => {
  const context = useContext(PartContext);
  if (!context) {
    throw new Error("usePartContext must be used within a PartProvider");
  }
  return context;
};