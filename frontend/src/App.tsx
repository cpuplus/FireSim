import React, { useState, useRef } from "react";
import FireSimViewer from "./components/FireSimViewer";
import InspectionPanel from "./components/InspectionPanel";
import type { InspectionPanelRef } from "./components/InspectionPanel";
import { createInspectionResult } from "./services/api";

function App() {
  const [selectedModelPath] = useState<string>("/models/valve_ii.glb");
  const panelRef = useRef<InspectionPanelRef>(null);

  // 3D 설비를 클릭했을 때 실행될 핸들러
  const handleEquipmentClick = async () => {
    try {
      await createInspectionResult({
        userId: 1,
        equipmentTypeId: 1,
        score: 100,
        isPassed: true,
        completionTimeSeconds: 30,
        detailsJson: JSON.stringify({
          action: "3D 뷰어 설비 직접 클릭 점검 완료",
        }),
      });
      alert("🧯 3D 설비 점검이 완료되어 결과가 서버에 저장되었습니다!");

      // 💡 설비 클릭으로 데이터가 저장된 즉시 우측 상단 패널 목록 새로고침!
      if (panelRef.current) {
        panelRef.current.refresh();
      }
    } catch (error) {
      console.error("설비 점검 저장 실패:", error);
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
      {/* 3D 시뮬레이터 뷰어 */}
      <div style={{ padding: "20px", maxWidth: "800px" }}>
        <h2 style={{ color: "#fff" }}>FireSim 3D 소방 설비 점검 시뮬레이터</h2>
        <FireSimViewer
          selectedModelPath={selectedModelPath}
          onSelectEquipment={handleEquipmentClick}
        />
      </div>

      {/* 우측 상단에 표시될 검사 결과 패널 (ref 연결) */}
      <InspectionPanel ref={panelRef} />
    </div>
  );
}

export default App;
