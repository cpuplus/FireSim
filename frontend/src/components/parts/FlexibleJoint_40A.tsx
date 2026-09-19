// src/components/parts/FlexibleJoint_40A.tsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface FlexibleJoint_40AProps {
  jointType?: "standard" | "flanged";
  lengthMm?: number; // 도면 규격 L=230mm 기본
  orientation?: "horizontal" | "vertical"; // 방향 선택 옵션 추가 (기본값: horizontal)
}

/**
 * 40A 플렉시블 조인트 3D 모델을 생성하여 THREE.Group으로 반환하는 공통 함수
 * - orientation이 "vertical"인 경우 세로 방향(Y축 기준)으로 모델과 스냅 서피스가 생성됩니다.
 */
export function buildFlexibleJointGroup(
  lengthMm: number = 230,
  orientation: "horizontal" | "vertical" = "horizontal"
): THREE.Group {
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
  });
  const braidMat = new THREE.MeshStandardMaterial({
    color: 0xcfd8dc,
    roughness: 0.2,
    metalness: 0.9,
    wireframe: true,
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

  // 조립용 스냅 서피스 재질 (두께 0, 선명한 빨간색, 양면 렌더링)
  const snapMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.0, // 👈 투명도를 0으로 설정
    depthWrite: false, // 투명 부품 간 렌더링 꼬임 방지
    side: THREE.DoubleSide,
  });

  const isVertical = orientation === "vertical";

  // 1) 첫 번째 플랜지 (Horizontal인 경우 좌측[-X], Vertical인 경우 하단[-Y])
  const firstFlange = new THREE.Mesh(flangeGeometry, flangeMat);
  firstFlange.name = isVertical ? "flange_bottom" : "flange_left";
  if (isVertical) {
    firstFlange.rotation.x = Math.PI / 2;
    firstFlange.position.set(0, -lengthMm / 2 + flangeThickness / 2, 0);
  } else {
    firstFlange.rotation.y = Math.PI / 2;
    firstFlange.position.set(-lengthMm / 2 + flangeThickness / 2, 0, 0);
  }
  firstFlange.castShadow = true;
  jointGroup.add(firstFlange);

  // 첫 번째 스냅 서피스
  const firstSnapSurface = new THREE.Mesh(
    new THREE.CircleGeometry(flangeOuterRadius - 5, 32),
    snapMat
  );
  firstSnapSurface.name = isVertical ? "snap_surface_bottom" : "snap_surface_left";
  if (isVertical) {
    firstSnapSurface.rotation.x = -Math.PI / 2;
    firstSnapSurface.position.set(0, -lengthMm / 2 - 1.1, 0);
  } else {
    firstSnapSurface.rotation.y = -Math.PI / 2;
    firstSnapSurface.position.set(-lengthMm / 2 - 1.1, 0, 0);
  }
  jointGroup.add(firstSnapSurface);

  // 첫 번째 볼트들
  for (let i = 0; i < boltCount; i++) {
    const angle = (i / boltCount) * Math.PI * 2 + Math.PI / 4;
    const p1 = Math.cos(angle) * boltCircleRadius;
    const p2 = Math.sin(angle) * boltCircleRadius;
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.5, flangeThickness + 8, 16),
      boltMat
    );
    if (isVertical) {
      bolt.position.set(p1, -lengthMm / 2 + flangeThickness / 2, p2);
    } else {
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(-lengthMm / 2 + flangeThickness / 2, p2, p1);
    }
    jointGroup.add(bolt);
  }

  // 2) 두 번째 플랜지 (Horizontal인 경우 우측[+X], Vertical인 경우 상단[+Y])
  const secondFlange = new THREE.Mesh(flangeGeometry, flangeMat);
  secondFlange.name = isVertical ? "flange_top" : "flange_right";
  if (isVertical) {
    secondFlange.rotation.x = Math.PI / 2;
    secondFlange.position.set(0, lengthMm / 2 - flangeThickness / 2, 0);
  } else {
    secondFlange.rotation.y = Math.PI / 2;
    secondFlange.position.set(lengthMm / 2 - flangeThickness / 2, 0, 0);
  }
  secondFlange.castShadow = true;
  jointGroup.add(secondFlange);

  // 두 번째 스냅 서피스
  const secondSnapSurface = new THREE.Mesh(
    new THREE.CircleGeometry(flangeOuterRadius - 5, 32),
    snapMat
  );
  secondSnapSurface.name = isVertical ? "snap_surface_top" : "snap_surface_right";
  if (isVertical) {
    secondSnapSurface.rotation.x = Math.PI / 2;
    secondSnapSurface.position.set(0, lengthMm / 2 + 1.1, 0);
  } else {
    secondSnapSurface.rotation.y = Math.PI / 2;
    secondSnapSurface.position.set(lengthMm / 2 + 1.1, 0, 0);
  }
  jointGroup.add(secondSnapSurface);

  // 두 번째 볼트들
  for (let i = 0; i < boltCount; i++) {
    const angle = (i / boltCount) * Math.PI * 2 + Math.PI / 4;
    const p1 = Math.cos(angle) * boltCircleRadius;
    const p2 = Math.sin(angle) * boltCircleRadius;
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.5, flangeThickness + 8, 16),
      boltMat
    );
    if (isVertical) {
      bolt.position.set(p1, lengthMm / 2 - flangeThickness / 2, p2);
    } else {
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(lengthMm / 2 - flangeThickness / 2, p2, p1);
    }
    jointGroup.add(bolt);
  }

  // 3) 벨로우즈 (Bellows)
  const bellowsLength = lengthMm - flangeThickness * 2 - 20;
  const bellowsRadius = 26;

  const points = [];
  const segmentsCount = 24;
  const span = bellowsLength;
  for (let i = 0; i <= segmentsCount; i++) {
    const t = i / segmentsCount;
    const pos = (t - 0.5) * span;
    const r = bellowsRadius + Math.sin(t * Math.PI * 10) * 4;
    points.push(new THREE.Vector2(r, pos));
  }

  const bellowsGeo = new THREE.LatheGeometry(points, 32);
  if (!isVertical) {
    bellowsGeo.rotateZ(Math.PI / 2);
  }
  const bellowsMesh = new THREE.Mesh(bellowsGeo, bellowsMat);
  bellowsMesh.name = "bellowsMesh";
  jointGroup.add(bellowsMesh);

  // 4) 외부 금속 그물망 (Braid)
  const braidPoints = [];
  for (let i = 0; i <= segmentsCount; i++) {
    const t = i / segmentsCount;
    const pos = (t - 0.5) * span;
    const r = bellowsRadius + 3.5 + Math.sin(t * Math.PI * 10) * 2;
    braidPoints.push(new THREE.Vector2(r, pos));
  }
  const braidGeo = new THREE.LatheGeometry(braidPoints, 18);
  if (!isVertical) {
    braidGeo.rotateZ(Math.PI / 2);
  }
  const braidMesh = new THREE.Mesh(braidGeo, braidMat);
  braidMesh.name = "braidMesh";
  jointGroup.add(braidMesh);

  // 5) 실링 칼라 (Collar)
  [-bellowsLength / 2 - 5, bellowsLength / 2 + 5].forEach((pos) => {
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(pipeRadius + 2, bellowsRadius + 2, 12, 32),
      rubberCollarMat
    );
    if (isVertical) {
      collar.position.set(0, pos, 0);
    } else {
      collar.rotation.z = Math.PI / 2;
      collar.position.set(pos, 0, 0);
    }
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
  orientation = "horizontal",
}: FlexibleJoint_40AProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(300, 500, 300);
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(800, 30, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -90;
    scene.add(gridHelper);

    const jointGroup = buildFlexibleJointGroup(lengthMm, orientation);
    scene.add(jointGroup);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
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

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [lengthMm, orientation]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}