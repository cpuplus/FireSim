// src/pages/PartManagementPage.tsx
import React from "react";
import ComponentList from "../components/ComponentList";
import Pump_024_45 from "../components/parts/Pump_024_45";
import FlexibleJoint_40A from "../components/parts/FlexibleJoint_40A";
import { usePartContext } from "../context/PartContext";

export default function PartManagementPage() {
  const { selectedPartIds } = usePartContext();

  // 현재 선택된 단 1개의 부품 ID
  const activePartId = selectedPartIds[0] || "pump-024-45";

  // 선택된 ID에 따른 부품 명칭 매핑
  const getPartName = (id: string) => {
    switch (id) {
      case "pump-024-45":
        return "가압송수장치 (024_45)";
      case "flexible-joint-40a":
        return "플렉시블 조인트 (40A)";
      case "pipe-20a":
        return "배관 (20A)";
      case "pipe-25a":
        return "배관 (25A)";
      case "pipe-32a":
        return "배관 (32A)";
      case "pipe-40a":
        return "배관 (40A)";
      default:
        return "선택된 부품";
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
      <ComponentList />

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
            부품 목록 관리 및 상세 뷰어 ({getPartName(activePartId)})
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