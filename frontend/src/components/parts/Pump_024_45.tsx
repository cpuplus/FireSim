// src/components/parts/Pump_024_45.tsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface PumpProps {
  pumpType?: string;
}

/**
 * 기존 정밀 펌프 3D 모델을 생성하여 THREE.Group으로 반환하는 공통 함수
 */
export function buildPumpGroup(): THREE.Group {
  const pumpGroup = new THREE.Group();

  // 재질 정의
  const motorBodyMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.4,
    metalness: 0.6,
  });
  const finMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.2,
    metalness: 0.95,
  });
  const pumpBodyMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.3,
    metalness: 0.7,
    side: THREE.DoubleSide,
  });
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.6,
    metalness: 0.8,
  });
  const holeMat = new THREE.MeshBasicMaterial({
    color: 0x050505,
    side: THREE.DoubleSide,
  });
  const stainlessShaftMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.1,
    metalness: 0.95,
  });
  const yellowGuardMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.3,
    metalness: 0.4,
    side: THREE.DoubleSide,
  });

  // A. 하단 철제 베이스 프레임
  const bedGeo = new THREE.BoxGeometry(720, 20, 320);
  const bed = new THREE.Mesh(bedGeo, baseMat);
  bed.position.set(0, -35, 0);
  bed.castShadow = true;
  bed.receiveShadow = true;
  pumpGroup.add(bed);

  const lipGeo = new THREE.BoxGeometry(730, 8, 330);
  const lip = new THREE.Mesh(lipGeo, baseMat);
  lip.position.set(0, -22, 0);
  pumpGroup.add(lip);

  // B. 모터 본체 (좌측)
  const motorRadius = 82;
  const motorBodyGeo = new THREE.CylinderGeometry(
    motorRadius,
    motorRadius,
    175,
    32,
  );
  const motorBody = new THREE.Mesh(motorBodyGeo, motorBodyMat);
  motorBody.rotation.z = Math.PI / 2;
  motorBody.position.set(-210, 114, 0);
  motorBody.castShadow = true;
  pumpGroup.add(motorBody);

  const motorMountGeo = new THREE.BoxGeometry(130, 57, 110);
  const motorMount = new THREE.Mesh(motorMountGeo, motorBodyMat);
  motorMount.position.set(-210, 3.5, 0);
  motorMount.castShadow = true;
  pumpGroup.add(motorMount);

  const motorMountBaseGeo = new THREE.BoxGeometry(160, 6, 140);
  const motorMountBase = new THREE.Mesh(motorMountBaseGeo, motorBodyMat);
  motorMountBase.position.set(-210, -22, 0);
  motorMountBase.castShadow = true;
  pumpGroup.add(motorMountBase);

  const finCount = 32;
  for (let i = 0; i < finCount; i++) {
    const angle = (i / finCount) * Math.PI * 2;
    const finHolder = new THREE.Group();
    finHolder.rotation.x = angle;
    finHolder.position.set(-210, 114, 0);
    const finGeo = new THREE.BoxGeometry(145, 24, 0.9);
    const fin = new THREE.Mesh(finGeo, finMat);
    fin.position.set(0, motorRadius + 12, 0);
    finHolder.add(fin);
    pumpGroup.add(finHolder);
  }
  const fanCover = new THREE.Mesh(
    new THREE.CylinderGeometry(75, motorRadius, 45, 32),
    motorBodyMat,
  );
  fanCover.rotation.z = Math.PI / 2;
  fanCover.position.set(-325, 114, 0);
  pumpGroup.add(fanCover);

  const terminalBox = new THREE.Mesh(
    new THREE.BoxGeometry(75, 50, 75),
    motorBodyMat,
  );
  terminalBox.position.set(-210, 172, 0);
  pumpGroup.add(terminalBox);

  // C. 커플링 안전 보호 덮개
  const guardGroup = new THREE.Group();
  guardGroup.position.set(-80, -25, 0);
  const guardRadius = 65,
    guardLength = 85,
    shaftLocalY = 139;

  const archMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(
      guardRadius,
      guardRadius,
      guardLength,
      32,
      1,
      true,
      0,
      Math.PI,
    ),
    yellowGuardMat,
  );
  archMesh.rotation.z = Math.PI / 2;
  archMesh.position.set(0, shaftLocalY, 0);
  guardGroup.add(archMesh);

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(guardLength, shaftLocalY, 3),
    yellowGuardMat,
  );
  leftWall.position.set(0, shaftLocalY / 2, -guardRadius);
  guardGroup.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(guardLength, shaftLocalY, 3),
    yellowGuardMat,
  );
  rightWall.position.set(0, shaftLocalY / 2, guardRadius);
  guardGroup.add(rightWall);

  [-guardRadius, guardRadius].forEach((zPos) => {
    const isRight = zPos > 0;
    const flangeWing = new THREE.Mesh(
      new THREE.BoxGeometry(guardLength, 3, 18),
      yellowGuardMat,
    );
    flangeWing.position.set(0, 1.5, isRight ? zPos + 9 : zPos - 9);
    guardGroup.add(flangeWing);
  });
  pumpGroup.add(guardGroup);

  // D. 펌프 본체 부 (0.24-45)
  const voluteGeo = new THREE.CylinderGeometry(90, 90, 160, 32);
  const voluteBody = new THREE.Mesh(voluteGeo, pumpBodyMat);
  voluteBody.rotation.z = Math.PI / 2;
  voluteBody.position.set(140, 114, 0);
  voluteBody.castShadow = true;
  pumpGroup.add(voluteBody);

  const leftProtrusion = new THREE.Mesh(
    new THREE.CylinderGeometry(40, 55, 65, 32),
    pumpBodyMat,
  );
  leftProtrusion.rotation.z = Math.PI / 2;
  leftProtrusion.position.set(27.5, 114, 0);
  pumpGroup.add(leftProtrusion);

  const leftCap = new THREE.Mesh(
    new THREE.CylinderGeometry(35, 35, 15, 32),
    pumpBodyMat,
  );
  leftCap.rotation.z = Math.PI / 2;
  leftCap.position.set(-10, 114, 0);
  pumpGroup.add(leftCap);

  const rightProtrusion = new THREE.Mesh(
    new THREE.CylinderGeometry(55, 40, 65, 32),
    pumpBodyMat,
  );
  rightProtrusion.rotation.z = Math.PI / 2;
  rightProtrusion.position.set(252.5, 114, 0);
  pumpGroup.add(rightProtrusion);

  const rightCap = new THREE.Mesh(
    new THREE.CylinderGeometry(35, 35, 15, 32),
    pumpBodyMat,
  );
  rightCap.rotation.z = Math.PI / 2;
  rightCap.position.set(290, 114, 0);
  pumpGroup.add(rightCap);

  const shaftGeo = new THREE.CylinderGeometry(18, 18, 380, 24);
  const mainShaft = new THREE.Mesh(shaftGeo, stainlessShaftMat);
  mainShaft.rotation.z = Math.PI / 2;
  mainShaft.position.set(-15, 114, 0);
  pumpGroup.add(mainShaft);

  // 플랜지
  const pipeRadius = 20;
  const flangeOuterRadius = 48;
  const boltCount = 4;
  const boltCircleRadius = 36;
  const boltHoleRadius = 3.5;

  const createFlangeShape = () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, flangeOuterRadius, 0, Math.PI * 2, false);
    const centerHole = new THREE.Path();
    centerHole.absarc(0, 0, pipeRadius, 0, Math.PI * 2, true);
    shape.holes.push(centerHole);

    for (let i = 0; i < boltCount; i++) {
      const angle = (i / boltCount) * Math.PI * 2;
      const bx = Math.cos(angle) * boltCircleRadius;
      const by = Math.sin(angle) * boltCircleRadius;
      const boltHole = new THREE.Path();
      boltHole.absarc(bx, by, boltHoleRadius, 0, Math.PI * 2, true);
      shape.holes.push(boltHole);
    }
    return shape;
  };

  const flangeShape = createFlangeShape();
  const flangeGeometry = new THREE.ExtrudeGeometry(flangeShape, {
    depth: 12,
    bevelEnabled: false,
  });

  // 흡입관
  const suctionPipeLength = 30;
  const suctionX = 80;

  const suctionPipeGeo = new THREE.CylinderGeometry(
    pipeRadius,
    pipeRadius,
    suctionPipeLength,
    32,
    1,
    true,
  );
  const suctionPipe = new THREE.Mesh(suctionPipeGeo, pumpBodyMat);
  suctionPipe.rotation.x = Math.PI / 2;
  suctionPipe.position.set(suctionX, 114, 95);
  pumpGroup.add(suctionPipe);

  const suctionFlange = new THREE.Mesh(flangeGeometry, pumpBodyMat);
  suctionFlange.position.set(suctionX, 114, 95 + suctionPipeLength / 2);
  pumpGroup.add(suctionFlange);

  const suctionHole = new THREE.Mesh(
    new THREE.CircleGeometry(pipeRadius - 0.5, 32),
    holeMat,
  );
  suctionHole.position.set(suctionX, 114, 80);
  pumpGroup.add(suctionHole);

  // 토출관
  const dischargePipeGeo = new THREE.CylinderGeometry(
    pipeRadius,
    pipeRadius,
    60,
    32,
    1,
    true,
  );
  const dischargePipe = new THREE.Mesh(dischargePipeGeo, pumpBodyMat);
  dischargePipe.position.set(190, 198, 0);
  pumpGroup.add(dischargePipe);

  const dischargeFlange = new THREE.Mesh(flangeGeometry, pumpBodyMat);
  dischargeFlange.rotation.x = Math.PI / 2;
  dischargeFlange.position.set(190, 228, 0);
  pumpGroup.add(dischargeFlange);

  // 다리 및 베이스 발판
  [80, 200].forEach((xPos) => {
    [-1, 1].forEach((dir) => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(24, 115, 16),
        pumpBodyMat,
      );
      leg.position.set(xPos, 38, dir * 55);
      leg.rotation.x = dir * -0.32;
      leg.castShadow = true;
      pumpGroup.add(leg);
    });

    const footPlate = new THREE.Mesh(
      new THREE.BoxGeometry(32, 12, 180),
      pumpBodyMat,
    );
    footPlate.position.set(xPos, -12, 0);
    footPlate.castShadow = true;
    pumpGroup.add(footPlate);
  });

  return pumpGroup;
}

/**
 * 단독 렌더링용 기존 메인 컴포넌트
 */
export default function Pump_024_45({ pumpType }: PumpProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. 씬, 카메라, 렌더러 설정
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f19);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      2000,
    );
    camera.position.set(450, 250, 450);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 오비트 컨트롤
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 40, 0);

    // 2. 조명 설정
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(400, 600, 400);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 1, 600);
    pointLight.position.set(-200, 300, 200);
    scene.add(pointLight);

    // 바닥 그리드
    const gridHelper = new THREE.GridHelper(1000, 40, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -45;
    scene.add(gridHelper);

    // 3. 공통 함수로 생성한 펌프 그룹 추가
    const pumpGroup = buildPumpGroup();
    scene.add(pumpGroup);

    // 4. 애니메이션 루프
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
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [pumpType]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        background:
          "radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)",
      }}
    />
  );
}
