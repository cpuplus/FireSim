import React, { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface EquipmentModelProps {
  modelPath: string;
}

const ModelLoader: React.FC<{ url: string }> = ({ url }) => {
  const { scene } = useGLTF(url);

  // 모델의 중심을 잡고 크기를 자동으로 조절하기 위한 clone 생성
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    // 바운딩 박스를 계산하여 크기와 위치 정렬
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // 모델이 너무 크거나 작으면 적정한 크기(예: 2단위)로 자동 스케일 조정
    if (maxDim > 0) {
      const scaleFactor = 2.0 / maxDim;
      clone.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    // 바닥면에 모델 하단이 오도록 위치 조정
    box.setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center); // 중심을 원점으로 이동
    clone.position.y += (box.max.y - box.min.y) / 2; // 바닥에 안착

    return clone;
  }, [scene]);

  return <primitive object={clonedScene} />;
};

// GLTF 모델 미지정 시 표시할 백업(Fallback) 3D 메시
const FallbackMesh: React.FC = () => (
  <mesh position={[0, 0.75, 0]}>
    <boxGeometry args={[1.5, 1.5, 1.5]} />
    <meshStandardMaterial color="#d32f2f" metalness={0.4} roughness={0.3} />
  </mesh>
);

export const EquipmentModel: React.FC<EquipmentModelProps> = ({
  modelPath,
}) => {
  return (
    <Suspense fallback={<FallbackMesh />}>
      {modelPath ? <ModelLoader url={modelPath} /> : <FallbackMesh />}
    </Suspense>
  );
};
