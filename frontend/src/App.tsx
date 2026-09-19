// src/App.tsx
import { useState } from "react";
import PumpPerformancePage from "./pages/PumpPerformancePage";
import AssemblyPracticePage from "./pages/AssemblyPracticePage"; // 수계소화설비 시공실무/조립 실습 페이지
import PartManagementPage from "./pages/PartManagementPage";
import { PartProvider } from "./context/PartContext";

export default function App() {
  // 💡 초기값 및 타입을 "assembly"(수계소화설비 시공실무)로 설정하여 첫 실행 시 기본 페이지로 지정
  const [currentTab, setCurrentTab] = useState<
    "assembly" | "main" | "parts"
  >("assembly");

  return (
    <PartProvider>
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
            {/* 💡 요청하신 메뉴 순서: 수계소화설비 시공실무 -> 펌프 성능 시험 -> 부품 목록 관리 */}
            <div style={{ display: "flex", gap: "8px" }}>
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
          
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            {/* 💡 상단 헤더 영역에 현재 페이지 이름(파일명) 표시 */}
            <div style={{ color: "#94a3b8", fontSize: "12px", background: "rgba(255, 255, 255, 0.05)", padding: "4px 10px", borderRadius: "4px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              📄 현재 파일: <span style={{ color: "#38bdf8" }}>
                {currentTab === "assembly" && "AssemblyPracticePage.tsx"}
                {currentTab === "main" && "PumpPerformancePage.tsx"}
                {currentTab === "parts" && "PartManagementPage.tsx"}
              </span>
            </div>
            <div style={{ color: "#94a3b8", fontSize: "13px" }}>
              상태: <b style={{ color: "#34d399" }}>실시간 연동 중</b>
            </div>
          </div>
        </div>

        {/* 메인 콘텐트 영역 */}
        {currentTab === "main" && <PumpPerformancePage />}
        
        {/* 수계소화설비 시공실무가 기본 화면으로 실행됨 */}
        {currentTab === "assembly" && <AssemblyPracticePage />}

        {currentTab === "parts" && <PartManagementPage />}
      </div>
    </PartProvider>
  );
}