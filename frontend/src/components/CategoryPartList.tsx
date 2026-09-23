// src/components/CategoryPartList.tsx
import { useState, useEffect } from "react";
import { usePartContext } from "../context/PartContext";

interface PartInfo {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string; // 중메뉴(GroupName - 예: 크로스, CPVC 등)
  children?: PartInfo[]; // 소메뉴(PartName - 예: 40Ax25A 등)
}

interface MenuCategory {
  id: string;
  name: string; // 대메뉴(CategoryName - 예: 부속품, 배관 등)
  items: MenuItem[];
}

interface CategoryPartListProps {
  activePartId: string;
  onSelectPart: (partInfo: {
    partId: string;
    description: string;
    groupName: string;
    partName: string;
  }) => void;
}

export default function CategoryPartList({
  activePartId,
  onSelectPart,
}: CategoryPartListProps) {
  const { addPart } = usePartContext();

  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [openSubMenuId, setOpenSubMenuId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:5007/api/parts/categories",
        );
        if (!response.ok)
          throw new Error(`서버 응답 오류 (Status: ${response.status})`);

        const data: MenuCategory[] = await response.json();
        setMenuData(data);
        setErrorMsg(null);
      } catch (err: any) {
        console.warn("DB 메뉴 데이터를 불러오지 못했습니다:", err.message);
        setErrorMsg("데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const toggleCategory = (id: string) => {
    setOpenCategoryId((prev) => (prev === id ? null : id));
  };

  const toggleSubMenu = (id: string) => {
    setOpenSubMenuId((prev) => (prev === id ? null : id));
  };

  const handlePartClick = (
    part: PartInfo,
    categoryName: string,
    groupName: string,
  ) => {
    const description = `${groupName} - ${part.name}`;

    addPart(part.id);
    onSelectPart({
      partId: part.id,
      description,
      groupName,
      partName: part.name,
    });
  };

  return (
    <div
      style={{
        position: "relative",
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
          position: "absolute",
          top: "8px",
          left: "8px",
          background: "rgba(15, 23, 42, 0.85)",
          color: "#38bdf8",
          padding: "3px 8px",
          borderRadius: "4px",
          fontSize: "11px",
          fontWeight: 600,
          zIndex: 30,
          border: "1px solid rgba(56, 189, 248, 0.3)",
          pointerEvents: "none",
        }}
      >
        CategoryPartList.tsx
      </div>

      <div
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          marginBottom: "20px",
          marginTop: "15px",
          color: "#38bdf8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>소방 설비 부품 목록</span>
        {loading && (
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>로딩 중...</span>
        )}
      </div>

      {errorMsg && (
        <div
          style={{
            padding: "12px",
            color: "#f87171",
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && menuData.length === 0 && (
        <div
          style={{
            padding: "12px",
            color: "#94a3b8",
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          등록된 부품 데이터가 없습니다.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {menuData.map((category) => {
          const isCategoryOpen = openCategoryId === category.id;

          return (
            <div key={category.id}>
              {/* 1단계: 대메뉴 (Category Name - 예: 부속품) */}
              <div
                onClick={() => toggleCategory(category.id)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: isCategoryOpen ? "#1e293b" : "transparent",
                  border: "1px solid #334155",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: isCategoryOpen ? "#38bdf8" : "#f8fafc",
                  fontWeight: "bold",
                }}
              >
                <span>{category.name}</span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {isCategoryOpen ? "▲" : "▼"}
                </span>
              </div>

              {/* 대메뉴가 열렸을 때 중메뉴 목록 표시 */}
              {isCategoryOpen && (
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
                  {category.items && category.items.length > 0 ? (
                    category.items.map((item) => {
                      const hasChildren = Boolean(
                        item.children && item.children.length > 0,
                      );
                      const isSubOpen = openSubMenuId === item.id;

                      return (
                        <div key={item.id}>
                          {/* 2단계: 중메뉴 (Group Name - 예: 크로스) */}
                          <div
                            onClick={() => {
                              if (hasChildren) {
                                toggleSubMenu(item.id);
                              } else {
                                handlePartClick(
                                  { id: item.id, name: item.name },
                                  category.name,
                                  item.name,
                                );
                              }
                            }}
                            style={{
                              padding: "8px 12px",
                              fontSize: "14px",
                              cursor: "pointer",
                              borderRadius: "6px",
                              color: isSubOpen ? "#38bdf8" : "#94a3b8",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              backgroundColor: isSubOpen
                                ? "rgba(30, 41, 59, 0.5)"
                                : "transparent",
                            }}
                          >
                            <span>{item.name}</span>
                            {hasChildren && (
                              <span
                                style={{ fontSize: "10px", color: "#64748b" }}
                              >
                                {isSubOpen ? "▲" : "▼"}
                              </span>
                            )}
                          </div>

                          {/* 3단계: 소메뉴 (Part Name - 예: 40Ax25A 등) */}
                          {hasChildren && isSubOpen && (
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
                                const isChildSelected =
                                  activePartId === child.id;
                                return (
                                  <div
                                    key={child.id}
                                    onClick={() =>
                                      handlePartClick(
                                        child,
                                        category.name,
                                        item.name,
                                      )
                                    }
                                    style={{
                                      padding: "6px 10px",
                                      fontSize: "13px",
                                      cursor: "pointer",
                                      borderRadius: "4px",
                                      color: isChildSelected
                                        ? "#38bdf8"
                                        : "#94a3b8",
                                      backgroundColor: isChildSelected
                                        ? "#1e293b"
                                        : "transparent",
                                      border: isChildSelected
                                        ? "1px solid #38bdf8"
                                        : "1px solid transparent",
                                      fontWeight: isChildSelected
                                        ? "bold"
                                        : "normal",
                                    }}
                                  >
                                    {child.name}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        padding: "8px",
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      중메뉴 항목이 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
