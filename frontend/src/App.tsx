import React, { useRef } from "react";
import FireSimViewer from "./components/FireSimViewer";
import InspectionPanel from "./components/InspectionPanel";
import type { InspectionPanelRef } from "./components/InspectionPanel";
import { createInspectionResult } from "./services/api";

function App() {
  const panelRef = useRef<InspectionPanelRef>(null);

  // 3D 수계소화설비 모델을 클릭했을 때 실행될 점검 완료 핸들러
  const handleEquipmentClick = async () => {
    try {
      await createInspectionResult({
        userId: 1,
        equipmentTypeId: 1, // 수계소화설비 ID 고정
        score: 100,
        isPassed: true,
        completionTimeSeconds: Math.floor(Math.random() * 30) + 15,
        detailsJson: JSON.stringify({
          action: "3D 뷰어에서 '수계소화설비' 직접 클릭 점검 완료",
          equipmentName: "수계소화설비",
          status: "정상 개방 및 압력 유지",
        }),
      });
      alert("🧯 [수계소화설비] 점검이 완료되어 결과가 서버에 저장되었습니다!");

      // 우측 상단 대시보드 패널 실시간 새로고침
      if (panelRef.current) {
        panelRef.current.refresh();
      }
    } catch (error) {
      console.error("설비 점검 저장 실패:", error);
      alert("점검 결과 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        background: "#111",
      }}
    >
      {/* 상단 관제 헤더 바 */}
      <div
        style={{
          padding: "15px 24px",
          background: "rgba(24, 28, 36, 0.95)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
          <span
            style={{
              background: "rgba(56, 189, 248, 0.1)",
              color: "#38bdf8",
              padding: "3px 10px",
              borderRadius: "4px",
              fontSize: "12px",
              border: "1px solid rgba(56, 189, 248, 0.2)",
            }}
          >
            수계소화설비
          </span>
        </div>
        <div style={{ color: "#94a3b8", fontSize: "13px" }}>
          모니터링 상태: <b style={{ color: "#34d399" }}>실시간 연동 중</b>
        </div>
      </div>

      {/* 3D 시뮬레이터 뷰어 영역 */}
      <div style={{ padding: "24px", maxWidth: "850px" }}>
        <p style={{ color: "#94a3b8", margin: "0 0 12px 0", fontSize: "14px" }}>
          💡 3D 뷰어의 <b style={{ color: "#fff" }}>수계소화설비 모델</b>을
          클릭하여 점검을 완료하세요.
        </p>
        <FireSimViewer
          selectedModelPath="/models/valve_ii.glb"
          onSelectEquipment={handleEquipmentClick}
        />
      </div>

      {/* 우측 상단 관제 대시보드 패널 */}
      <InspectionPanel ref={panelRef} />
    </div>
  );
}

export default App;
