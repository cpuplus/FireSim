// src/pages/AssemblyPracticePage.tsx
import { useState } from "react";
import CategoryPartList from "../components/CategoryPartList";
import AssemblyViewer from "../components/AssemblyViewer";

interface AddedPart {
  id: string;
  name: string;
  instanceId: string;
}

export default function AssemblyPracticePage() {
  const [addedParts, setAddedParts] = useState<AddedPart[]>([]);
  const [activePartId, setActivePartId] = useState<string>("");
  const [score, setScore] = useState<number | null>(null);

  // CategoryPartList에서 부품 클릭 시 호출되는 핸들러
  const handleSelectPart = (partInfo: {
    partId: string;
    description: string;
    groupName: string;
    partName: string;
  }) => {
    setActivePartId(partInfo.partId);

    // 고유 instanceId 생성 (timestamp + random)
    const newInstanceId = `inst_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newPart: AddedPart = {
      id: partInfo.partId,
      name: partInfo.partName,
      instanceId: newInstanceId,
    };

    setAddedParts((prev) => [...prev, newPart]);
  };

  // 추가된 부품 목록에서 개별 삭제 핸들러
  const handleRemovePart = (instanceId: string) => {
    setAddedParts((prev) => prev.filter((p) => p.instanceId !== instanceId));
  };

  // 최종 점수 제출 처리 핸들러
  const handleScoreCalculated = (calculatedScore: number) => {
    setScore(calculatedScore);
    alert(`조립 검사가 완료되었습니다!\n최종 점수: ${calculatedScore}점`);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        backgroundColor: "#0f172a",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* 파일명 표시 뱃지 */}
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
          zIndex: 40,
          border: "1px solid rgba(56, 189, 248, 0.3)",
          pointerEvents: "none",
        }}
      >
        AssemblyPracticePage.tsx
      </div>

      {/* 1. 좌측 카테고리/부품 목록 패널 */}
      <div style={{ display: "flex", height: "100%", zIndex: 10 }}>
        <CategoryPartList
          activePartId={activePartId}
          onSelectPart={handleSelectPart}
        />
      </div>

      {/* 2. 중앙 3D 조립 뷰어 영역 */}
      <div style={{ flex: 1, height: "100%", position: "relative" }}>
        <AssemblyViewer
          addedParts={addedParts}
          onScoreCalculated={handleScoreCalculated}
        />

        {/* 3. 우측 하단: 작업 중인 조립 부품 목록 Overlay */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            width: "280px",
            maxHeight: "220px",
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "12px",
            color: "#f8fafc",
            overflowY: "auto",
            zIndex: 20,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: "#38bdf8",
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>작업 부품 목록 ({addedParts.length})</span>
            {score !== null && (
              <span style={{ color: "#22c55e" }}>점수: {score}점</span>
            )}
          </div>

          {addedParts.length === 0 ? (
            <div style={{ fontSize: "12px", color: "#64748b", textAlign: "center", padding: "10px 0" }}>
              좌측 목록에서 부품을 선택해 추가하세요.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {addedParts.map((part) => (
                <div
                  key={part.instanceId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#1e293b",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    border: "1px solid #334155",
                  }}
                >
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "180px",
                    }}
                    title={part.name}
                  >
                    {part.name}
                  </span>
                  <button
                    onClick={() => handleRemovePart(part.instanceId)}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#f87171",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                      padding: "2px 6px",
                    }}
                    title="부품 제거"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}