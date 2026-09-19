// src/pages/WaterFireFightingPage.tsx
import { useState } from "react";
import ComponentList from "../components/ComponentList";
import Pump_024_45 from "../components/parts/Pump_024_45";
import FlexibleJoint_40A from "../components/parts/FlexibleJoint_40A";

export default function WaterFireFightingPage() {
  // 오직 1개의 선택된 부품 ID만 다룹니다 (기본값: 펌프)
  const [activePartId, setActivePartId] = useState<string>("pump-024-45");

  // 단일 선택 변경 처리 함수
  const handleSelectPart = (partId: string) => {
    setActivePartId(partId); // 배열 추가가 아닌 덮어쓰기
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
      {/* 사이드바 */}
      <ComponentList
        activePartId={activePartId}
        onSelectPart={handleSelectPart}
      />

      {/* 우측 3D 상세 뷰어 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          overflow: "hidden",
        }}
      >
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
            부품 상세 뷰어
          </div>
          <div style={{ color: "#94a3b8", fontSize: "13px" }}>
            좌측 메뉴에서 단일 부품을 선택하면 3D 모델을 확인하실 수 있습니다.
          </div>
        </div>

        {/* 3D 화면 */}
        <div
          style={{
            flex: 1,
            position: "relative",
            background: "#111827",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {activePartId === "flexible-joint-40a" ? (
            <FlexibleJoint_40A />
          ) : (
            <Pump_024_45 pumpType="0.24-45" />
          )}
        </div>
      </div>
    </div>
  );
}
