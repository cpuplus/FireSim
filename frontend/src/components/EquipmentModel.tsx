import React, { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface EquipmentModelProps {
  modelPath: string;
  onSelect?: () => void;
}

interface ModelLoaderProps {
  url: string;
  onSelect?: () => void;
}

const ModelLoader: React.FC<ModelLoaderProps> = ({ url, onSelect }) => {
  const { scene } = useGLTF(url);

  // 모델의 중심을 잡고 크기를 자동으로 조절하기 위한 clone 생성
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    // 바운딩 박스를 계산하여 크기와 위치 정렬
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    if (maxDim > 0) {
      const scaleFactor = 2.0 / maxDim;
      clone.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }

    box.setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    clone.position.y += (box.max.y - box.min.y) / 2;

    return clone;
  }, [scene]);

  return (
    <primitive 
      object={clonedScene} 
      onClick={(e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        console.log('3D 소방 설비 모델이 클릭되었습니다!');
        if (onSelect) {
          onSelect(); // 부모 함수 안전하게 호출
        }
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'default')}
    />
  );
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
  onSelect,
}) => {
  return (
    <Suspense fallback={<FallbackMesh />}>
      {modelPath ? <ModelLoader url={modelPath} onSelect={onSelect} /> : <FallbackMesh />}
    </Suspense>
  );
};