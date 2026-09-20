import { useState, useEffect } from "react";
import { usePartContext } from "../context/PartContext"; // 💡 Context 불러오기

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

interface CategoryPartListProps {
  activePartId: string;
  onSelectPart: (partId: string) => void;
}

export default function CategoryPartList({ activePartId, onSelectPart }: CategoryPartListProps) {
  // 💡 Context에서 다중 추가 함수(addPart) 가져오기
  const { addPart } = usePartContext();

  // 💡 DB에서 불러온 데이터를 담을 상태 (초기값은 빈 배열)
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [openSubMenuId, setOpenSubMenuId] = useState<string | null>(null);

  // 💡 컴포넌트 마운트 시 백엔드 DB(API)로부터 메뉴 데이터를 비동기 호출
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        // C# 백엔드 API 엔드포인트 주소 (필요에 따라 포트나 경로를 조정하세요)
        const response = await fetch("http://localhost:5007/api/parts/categories");
        
        if (!response.ok) {
          throw new Error(`서버 응답 오류 (Status: ${response.status})`);
        }

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

  // 💡 부품 클릭 시 누적 추가(addPart)와 기존 선택(onSelectPart)을 함께 처리
  const handlePartClick = (id: string) => {
    addPart(id);      // 여러 개가 누적되도록 추가
    onSelectPart(id); // 기존 선택 상태 동기화
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
      {/* 💡 파일명 표기 뱃지 */}
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

      {/* 상단 타이틀 영역 */}
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
        {loading && <span style={{ fontSize: "12px", color: "#94a3b8" }}>로딩 중...</span>}
      </div>

      {/* 에러 또는 데이터 없을 때 안내 문구 */}
      {errorMsg && (
        <div style={{ padding: "12px", color: "#f87171", fontSize: "13px", textAlign: "center" }}>
          {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && menuData.length === 0 && (
        <div style={{ padding: "12px", color: "#94a3b8", fontSize: "13px", textAlign: "center" }}>
          등록된 부품 데이터가 없습니다.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {menuData.map((category) => {
          const isOpen = openCategoryId === category.id;

          return (
            <div key={category.id}>
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
                                      onClick={() => handlePartClick(child.id)}
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
                          <div
                            onClick={() => handlePartClick(item.id)}
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