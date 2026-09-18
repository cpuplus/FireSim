// src/App.tsx
import React, { useState } from "react";
import PumpPerformancePage from "./pages/PumpPerformancePage";
import WaterFireFightingPage from "./pages/WaterFireFightingPage";
import PartManagementPage from "./pages/PartManagementPage";
import { PartProvider } from "./context/PartContext"; // 추가

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    "none" | "main" | "assembly" | "parts"
  >("none");

  return (
    <PartProvider>
      {" "}
      {/* 전역 컨텍스트로 감싸기 */}
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          margin: 0,
          padding: 0,
          overflow: "hidden",
          background: "#111",
          boxSizing: "border-box",
        }}
      >
        {/* 상단 네비게이션 헤더 */}
        <div
          style={{
            padding: "12px 24px",
            background: "rgba(24, 28, 36, 0.95)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <h2
              style={{
                color: "#38bdf8",
                margin: 0,
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              FireSim 3D 관제 시스템
            </h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setCurrentTab("main")}
                style={{
                  background:
                    currentTab === "main"
                      ? "rgba(56, 189, 248, 0.15)"
                      : "transparent",
                  color: currentTab === "main" ? "#38bdf8" : "#94a3b8",
                  border:
                    currentTab === "main"
                      ? "1px solid rgba(56, 189, 248, 0.3)"
                      : "1px solid transparent",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                펌프 성능 시험
              </button>

              <button
                onClick={() => setCurrentTab("assembly")}
                style={{
                  background:
                    currentTab === "assembly"
                      ? "rgba(56, 189, 248, 0.15)"
                      : "transparent",
                  color: currentTab === "assembly" ? "#38bdf8" : "#94a3b8",
                  border:
                    currentTab === "assembly"
                      ? "1px solid rgba(56, 189, 248, 0.3)"
                      : "1px solid transparent",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                수계소화설비 시공실무
              </button>

              <button
                onClick={() => setCurrentTab("parts")}
                style={{
                  background:
                    currentTab === "parts"
                      ? "rgba(56, 189, 248, 0.15)"
                      : "transparent",
                  color: currentTab === "parts" ? "#38bdf8" : "#94a3b8",
                  border:
                    currentTab === "parts"
                      ? "1px solid rgba(56, 189, 248, 0.3)"
                      : "1px solid transparent",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                부품 목록 관리
              </button>
            </div>
          </div>
          <div style={{ color: "#94a3b8", fontSize: "13px" }}>
            상태: <b style={{ color: "#34d399" }}>실시간 연동 중</b>
          </div>
        </div>

        {currentTab === "none" && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0f172a",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            상단 메뉴에서 원하는 항목을 선택해 주세요.
          </div>
        )}

        {currentTab === "main" && <PumpPerformancePage />}
        {currentTab === "assembly" && <WaterFireFightingPage />}
        {currentTab === "parts" && <PartManagementPage />}
      </div>
    </PartProvider>
  );
}
