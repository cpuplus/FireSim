import React from "react";
import FireSimViewer from "./components/FireSimViewer"; // 기존 3D 뷰어 컴포넌트
import InspectionPanel from "./components/InspectionPanel";

function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* 3D 시뮬레이터 뷰어 */}
      <FireSimViewer />

      {/* 우측 상단에 표시될 검사 결과 패널 */}
      <InspectionPanel />
    </div>
  );
}

export default App;
