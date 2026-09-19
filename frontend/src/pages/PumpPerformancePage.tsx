// src/pages/PumpPerformancePage.tsx
import { useRef } from "react";
import FireSimViewer from "../components/FireSimViewer";
import InspectionPanel from "../components/InspectionPanel";
import type { InspectionPanelRef } from "../components/InspectionPanel";

export default function PumpPerformancePage() {
  const panelRef = useRef<InspectionPanelRef>(null);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          flex: 1,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <p
          style={{
            color: "#94a3b8",
            margin: "0 0 12px 0",
            fontSize: "14px",
          }}
        >
          💡 펌프 성능 시험 종합 3D 뷰어
        </p>
        <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
          <FireSimViewer
            selectedModelPath="/models/valve_ii.glb"
            onSelectEquipment={() => {}}
          />
        </div>
      </div>
      <div
        style={{
          width: "380px",
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(18, 22, 28, 0.95)",
          overflowY: "auto",
        }}
      >
        <InspectionPanel ref={panelRef} />
      </div>
    </div>
  );
}