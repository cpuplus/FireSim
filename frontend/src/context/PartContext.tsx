import React, { createContext, useContext, useState, ReactNode } from "react";

interface PartContextType {
  selectedPartIds: string[];
  setSelectedPartIds: React.Dispatch<React.SetStateAction<string[]>>;
  togglePart: (id: string) => void;
  selectSinglePart: (id: string) => void;
  clearSelection: () => void;
}

const PartContext = createContext<PartContextType | undefined>(undefined);

export const PartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 기본값으로 1개 부품만 세팅
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>(["pump-024-45"]);

  // 단일 선택 강제 함수: 어떤 부품을 클릭하든 배열 전체를 [id] 1개로 교체
  const selectSinglePart = (id: string) => {
    setSelectedPartIds([id]);
  };

  // 기존 togglePart가 있다면 다중 선택이 되지 않도록 덮어쓰기 처리
  const togglePart = (id: string) => {
    setSelectedPartIds([id]);
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