// src/pages/PartManagementPage.tsx
import CategoryPartList from "../components/CategoryPartList";
import FlexibleJoint_40A from "../components/parts/FlexibleJoint_40A";
import { usePartContext } from "../context/PartContext";

export default function PartManagementPage() {
  const { selectedPartIds, setSelectedPartIds } = usePartContext();
  const activePartId = selectedPartIds[0] || "";

  // CategoryPartList에서 부품을 선택했을 때 실행될 핸들러 함수
  const handleSelect = (partId: string) => {
    if (setSelectedPartIds) {
      setSelectedPartIds([partId]);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        width: "100%",
        height: "100vh",
        background: "#0f172a",
      }}
    >
      {/* 좌측 단일 선택 사이드바 */}
      <CategoryPartList activePartId={activePartId} onSelectPart={handleSelect} />

      {/* 우측 메인 뷰어 영역 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          overflow: "hidden",
        }}
      >
        {/* 상단 안내 타이틀 */}
        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "16px 20px",
            borderRadius: "8px",
            marginBottom: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "4px",
            }}
          >
            부품 목록 관리 및 상세 뷰어 {activePartId ? `(${activePartId})` : ""}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "13px" }}>
            좌측 메뉴에서 부품을 선택하면 실시간 3D 모델을 확인하실 수 있습니다.
          </div>
        </div>

        {/* 3D 뷰어 영역 */}
        <div
          style={{
            flex: 1,
            position: "relative",
            background: "#111827",
            borderRadius: "12px",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!activePartId ? (
            <div style={{ color: "#64748b", fontSize: "15px", textAlign: "center" }}>
              좌측 메뉴에서 조회할 부품을 선택해주세요.
            </div>
          ) : activePartId === "fj-40a" ? (
            <FlexibleJoint_40A />
          ) : (
            <div style={{ color: "#38bdf8", fontSize: "15px", textAlign: "center" }}>
              선택한 부품 ID: {activePartId}<br />
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>(3D 모델 준비 중)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}