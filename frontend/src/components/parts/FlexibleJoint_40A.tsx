// src/components/parts/FlexibleJoint_40A.tsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface FlexibleJoint_40AProps {
  jointType?: "standard" | "flanged";
  lengthMm?: number; // 도면 규격 L=230mm 기본
}

/**
 * 40A 플렉시블 조인트 3D 모델을 생성하여 THREE.Group으로 반환하는 공통 함수
 * - 조립 화면(AssemblyViewer) 및 단독 화면에서 공통으로 호출하여 사용
 */
export function buildFlexibleJointGroup(lengthMm: number = 230): THREE.Group {
  const jointGroup = new THREE.Group();
  jointGroup.name = "flexible-joint-40a";

  // 재질 정의
  const flangeMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.3,
    metalness: 0.85,
  });
  const boltMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.2,
    metalness: 0.95,
  });
  const bellowsMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.5,
    metalness: 0.5,
    bumpScale: 0.05,
  });
  const braidMat = new THREE.MeshStandardMaterial({
    color: 0xcfd8dc,
    roughness: 0.2,
    metalness: 0.9,
    wireframe: true, // 금속 그물망(Braid) 효과
  });
  const rubberCollarMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.8,
    metalness: 0.1,
  });

  // 40A 규격 스펙 적용
  const pipeRadius = 20;
  const flangeOuterRadius = 50;
  const flangeThickness = 14;
  const boltCount = 4;
  const boltCircleRadius = 42;
  const boltHoleRadius = 4;

  const createFlangeShape = () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, flangeOuterRadius, 0, Math.PI * 2, false);

    const centerHole = new THREE.Path();
    centerHole.absarc(0, 0, pipeRadius, 0, Math.PI * 2, true);
    shape.holes.push(centerHole);

    for (let i = 0; i < boltCount; i++) {
      const angle = (i / boltCount) * Math.PI * 2 + Math.PI / 4;
      const bx = Math.cos(angle) * boltCircleRadius;
      const by = Math.sin(angle) * boltCircleRadius;
      const boltHole = new THREE.Path();
      boltHole.absarc(bx, by, boltHoleRadius, 0, Math.PI * 2, true);
      shape.holes.push(boltHole);
    }
    return shape;
  };

  const flangeExtrudeSettings = {
    depth: flangeThickness,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 1,
    bevelThickness: 1,
  };
  const flangeGeometry = new THREE.ExtrudeGeometry(
    createFlangeShape(),
    flangeExtrudeSettings
  );
  flangeGeometry.center();

  // 1) 좌측 플랜지 (💡 확장성 있는 메쉬 이름 지정)
  const leftFlange = new THREE.Mesh(flangeGeometry, flangeMat);
  leftFlange.name = "flange_left";
  leftFlange.rotation.y = Math.PI / 2;
  leftFlange.position.set(-lengthMm / 2 + flangeThickness / 2, 0, 0);
  leftFlange.castShadow = true;
  jointGroup.add(leftFlange);

  // 좌측 플랜지 볼트
  for (let i = 0; i < boltCount; i++) {
    const angle = (i / boltCount) * Math.PI * 2 + Math.PI / 4;
    const bz = Math.cos(angle) * boltCircleRadius;
    const by = Math.sin(angle) * boltCircleRadius;
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.5, flangeThickness + 8, 16),
      boltMat
    );
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(-lengthMm / 2 + flangeThickness / 2, by, bz);
    jointGroup.add(bolt);
  }

  // 2) 우측 플랜지 (💡 확장성 있는 메쉬 이름 지정)
  const rightFlange = new THREE.Mesh(flangeGeometry, flangeMat);
  rightFlange.name = "flange_right";
  rightFlange.rotation.y = Math.PI / 2;
  rightFlange.position.set(lengthMm / 2 - flangeThickness / 2, 0, 0);
  rightFlange.castShadow = true;
  jointGroup.add(rightFlange);

  // 우측 플랜지 볼트
  for (let i = 0; i < boltCount; i++) {
    const angle = (i / boltCount) * Math.PI * 2 + Math.PI / 4;
    const bz = Math.cos(angle) * boltCircleRadius;
    const by = Math.sin(angle) * boltCircleRadius;
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.5, flangeThickness + 8, 16),
      boltMat
    );
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(lengthMm / 2 - flangeThickness / 2, by, bz);
    jointGroup.add(bolt);
  }

  // 3) 벨로우즈 (Bellows)
  const bellowsLength = lengthMm - flangeThickness * 2 - 20;
  const bellowsRadius = 26;

  const points = [];
  const segmentsCount = 24;
  const spanX = bellowsLength;
  for (let i = 0; i <= segmentsCount; i++) {
    const t = i / segmentsCount;
    const x = (t - 0.5) * spanX;
    const r = bellowsRadius + Math.sin(t * Math.PI * 10) * 4;
    points.push(new THREE.Vector2(r, x));
  }

  const bellowsGeo = new THREE.LatheGeometry(points, 32);
  bellowsGeo.rotateZ(Math.PI / 2);
  const bellowsMesh = new THREE.Mesh(bellowsGeo, bellowsMat);
  bellowsMesh.name = "bellowsMesh";
  jointGroup.add(bellowsMesh);

  // 4) 외부 금속 그물망 (Braid)
  const braidPoints = [];
  for (let i = 0; i <= segmentsCount; i++) {
    const t = i / segmentsCount;
    const x = (t - 0.5) * spanX;
    const r = bellowsRadius + 3.5 + Math.sin(t * Math.PI * 10) * 2;
    braidPoints.push(new THREE.Vector2(r, x));
  }
  const braidGeo = new THREE.LatheGeometry(braidPoints, 18);
  braidGeo.rotateZ(Math.PI / 2);
  const braidMesh = new THREE.Mesh(braidGeo, braidMat);
  braidMesh.name = "braidMesh";
  jointGroup.add(braidMesh);

  // 5) 양 끝단 고무/메탈 실링 칼라 (Collar)
  [-bellowsLength / 2 - 5, bellowsLength / 2 + 5].forEach((posX) => {
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(pipeRadius + 2, bellowsRadius + 2, 12, 32),
      rubberCollarMat
    );
    collar.rotation.z = Math.PI / 2;
    collar.position.set(posX, 0, 0);
    jointGroup.add(collar);
  });

  return jointGroup;
}

/**
 * 단독 렌더링용 메인 컴포넌트 (단품 뷰어용)
 */
export default function FlexibleJoint_40A({
  jointType = "flanged",
  lengthMm = 230,
}: FlexibleJoint_40AProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer 설정
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f19);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    camera.position.set(300, 180, 300);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    // 2. 조명 설정
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(300, 500, 300);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 1, 500);
    pointLight.position.set(-150, 200, 150);
    scene.add(pointLight);

    const gridHelper = new THREE.GridHelper(800, 30, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -90;
    scene.add(gridHelper);

    // 3. 공통 생성 함수 호출 및 Scene 추가
    const jointGroup = buildFlexibleJointGroup(lengthMm);
    scene.add(jointGroup);

    const bellowsMesh = jointGroup.getObjectByName("bellowsMesh");
    const braidMesh = jointGroup.getObjectByName("braidMesh");

    // 4. 애니메이션 루프
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (bellowsMesh && braidMesh) {
        bellowsMesh.rotation.x = Math.sin(Date.now() * 0.003) * 0.01;
        braidMesh.rotation.x = bellowsMesh.rotation.x;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // 5. Cleanup 구문: 메모리 누수 및 WebGL Context Lost 방지
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [lengthMm]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background:
          "radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid rgba(56, 189, 248, 0.2)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          zIndex: 10,
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          padding: "8px 14px",
          borderRadius: "8px",
          color: "#f8fafc",
          fontSize: "13px",
          fontFamily: "monospace",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            color: "#38bdf8",
            marginBottom: "2px",
          }}
        >
          40A FLEXIBLE JOINT
        </div>
        <div>Standard Spec: L = {lengthMm}mm</div>
        <div>Flange: 4-Bolt Pattern (PCD)</div>
      </div>

      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", flex: 1 }}
      />
    </div>
  );
}