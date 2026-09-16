import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export const FireSimViewer: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '500px', background: '#1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* 3D 소방 설비 박스 */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color="#d32f2f" metalness={0.4} roughness={0.3} />
        </mesh>

        <gridHelper args={[10, 10, '#444444', '#222222']} />
        <OrbitControls makeDefault minDistance={2} maxDistance={10} />
      </Canvas>
    </div>
  );
};
