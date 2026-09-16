import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, ContactShadows } from "@react-three/drei";
import { EquipmentModel } from "./EquipmentModel";

interface FireSimViewerProps {
  selectedModelPath?: string;
  onSelectEquipment?: () => void; // 부모로 클릭 신호를 보내는 함수 추가
}

export const FireSimViewer: React.FC<FireSimViewerProps> = ({
  selectedModelPath = "",
  onSelectEquipment,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "500px",
        background: "#1e1e1e",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Canvas camera={{ position: [4, 3, 4], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />

        {/* 3D 모델 중앙 자동 정렬 및 로드 */}
        <Center top>
          <EquipmentModel
            modelPath={selectedModelPath}
            onSelect={onSelectEquipment}
          />
        </Center>

        {/* 바닥 그림자 및 격자 */}
        <ContactShadows
          opacity={0.6}
          scale={10}
          blur={1}
          far={10}
          resolution={256}
          color="#000000"
        />
        <gridHelper args={[10, 10, "#444444", "#222222"]} />

        <OrbitControls
          makeDefault
          minDistance={1.5}
          maxDistance={12}
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
};
export default FireSimViewer;
