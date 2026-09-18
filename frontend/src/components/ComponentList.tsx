// src/components/ComponentList.tsx
import React, { useState } from "react";
import { usePartContext } from "../context/PartContext";

interface MenuItem {
  id: string;
  name: string;
  children?: { id: string; name: string }[];
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

const MENU_DATA: MenuCategory[] = [
  {
    id: "cat-pump",
    name: "펌프",
    items: [{ id: "pump-024-45", name: "024_45" }],
  },
  {
    id: "cat-pipe",
    name: "배관",
    items: [
      { id: "pipe-20a", name: "20A" },
      { id: "pipe-25a", name: "25A" },
      { id: "pipe-32a", name: "32A" },
      { id: "pipe-40a", name: "40A" },
    ],
  },
  {
    id: "cat-fittings",
    name: "배관 부속품",
    items: [
      {
        id: "flexible-joint",
        name: "플렉시블 조인트",
        children: [{ id: "flexible-joint-40a", name: "40A" }],
      },
      { id: "elbow", name: "엘보" },
      { id: "tee", name: "티" },
      { id: "cross", name: "크로스" },
      { id: "reducer", name: "레듀샤" },
    ],
  },
  {
    id: "cat-valve",
    name: "밸브",
    items: [
      { id: "gate-valve", name: "게이트 밸브" },
      { id: "check-valve", name: "체크 밸브" },
      { id: "relief-valve", name: "릴리프 밸브" },
    ],
  },
  {
    id: "cat-instrument",
    name: "계기류",
    items: [
      { id: "pressure-gauge", name: "압력계" },
      { id: "compound-gauge", name: "연성계" },
      { id: "flow-meter", name: "유량계" },
    ],
  },
];

export default function ComponentList() {
  const { selectedPartIds, selectSinglePart } = usePartContext();

  // 열린 1차 카테고리 (기본값: 배관 부속품)
  const [openCategoryId, setOpenCategoryId] = useState<string | null>("cat-fittings");
  
  // 열린 2차 서브메뉴 ID (기본값: 플렉시블 조인트)
  const [openSubMenuId, setOpenSubMenuId] = useState<string | null>("flexible-joint");

  // 현재 선택된 단 1개의 부품 ID
  const activePartId = selectedPartIds[0] || "flexible-joint-40a";

  const toggleCategory = (id: string) => {
    setOpenCategoryId((prev) => (prev === id ? null : id));
  };

  const toggleSubMenu = (id: string) => {
    setOpenSubMenuId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      style={{
        width: "300px",
        height: "100%",
        backgroundColor: "#0f172a",
        borderRight: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
        color: "#f8fafc",
        userSelect: "none",
        padding: "16px",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#38bdf8",
        }}
      >
        소방 설비 부품 목록
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {MENU_DATA.map((category) => {
          const isOpen = openCategoryId === category.id;

          return (
            <div key={category.id}>
              {/* 1차 카테고리 (펌프, 배관, 배관 부속품...) */}
              <div
                onClick={() => toggleCategory(category.id)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: isOpen ? "#1e293b" : "transparent",
                  border: "1px solid #334155",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: isOpen ? "#38bdf8" : "#f8fafc",
                  fontWeight: "bold",
                }}
              >
                <span>{category.name}</span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {isOpen ? "▲" : "▼"}
                </span>
              </div>

              {/* 2차 항목 목록 */}
              {isOpen && (
                <div
                  style={{
                    marginTop: "6px",
                    marginLeft: "8px",
                    paddingLeft: "12px",
                    borderLeft: "2px solid #334155",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {category.items.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isSubOpen = openSubMenuId === item.id;
                    const isSelected = activePartId === item.id;

                    return (
                      <div key={item.id}>
                        {/* 하위 자식이 있는 경우 (플렉시블 조인트) */}
                        {hasChildren ? (
                          <>
                            <div
                              onClick={() => toggleSubMenu(item.id)}
                              style={{
                                padding: "8px 12px",
                                fontSize: "14px",
                                cursor: "pointer",
                                borderRadius: "6px",
                                color: isSubOpen ? "#38bdf8" : "#94a3b8",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span>{item.name}</span>
                              <span style={{ fontSize: "10px", color: "#64748b" }}>
                                {isSubOpen ? "▲" : "▼"}
                              </span>
                            </div>

                            {/* 3차 하위 규격 (40A) */}
                            {isSubOpen && (
                              <div
                                style={{
                                  marginLeft: "16px",
                                  marginTop: "2px",
                                  paddingLeft: "10px",
                                  borderLeft: "1px dashed #475569",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "2px",
                                }}
                              >
                                {item.children?.map((child) => {
                                  const isChildSelected = activePartId === child.id;
                                  return (
                                    <div
                                      key={child.id}
                                      onClick={() => selectSinglePart(child.id)}
                                      style={{
                                        padding: "6px 10px",
                                        fontSize: "13px",
                                        cursor: "pointer",
                                        borderRadius: "4px",
                                        color: isChildSelected ? "#38bdf8" : "#94a3b8",
                                        backgroundColor: isChildSelected
                                          ? "#1e293b"
                                          : "transparent",
                                        border: isChildSelected
                                          ? "1px solid #38bdf8"
                                          : "1px solid transparent",
                                        fontWeight: isChildSelected ? "bold" : "normal",
                                      }}
                                    >
                                      {child.name}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        ) : (
                          /* 일반 항목 (엘보, 티, 크로스...) */
                          <div
                            onClick={() => selectSinglePart(item.id)}
                            style={{
                              padding: "8px 12px",
                              fontSize: "14px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              color: isSelected ? "#38bdf8" : "#94a3b8",
                              backgroundColor: isSelected
                                ? "#1e293b"
                                : "transparent",
                              border: isSelected
                                ? "1px solid #38bdf8"
                                : "1px solid transparent",
                              fontWeight: isSelected ? "bold" : "normal",
                            }}
                          >
                            {item.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}