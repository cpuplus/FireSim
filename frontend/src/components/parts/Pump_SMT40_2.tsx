// src/components/parts/Pump_SMT40_2.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface PumpProps {
  pumpType?: string;
}

export function buildPumpGroup(): THREE.Group {
  const pumpGroup = new THREE.Group();
  pumpGroup.name = "pump-smt40-2";

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
    transparent: true,
    opacity: 1.0, // 👈 0.0(완전 투명) ~ 1.0(불투명) 사이 값으로 조절하세요.
    depthWrite: false, // 투명 렌더링 꼬임 방지
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

  // 스냅 서피스 공통 재질 (반투명 파란색)
  const snapMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  // A. 하단 철제 베이스 프레임 (가로 760, 세로 300, 높이 75 규격 반영 및 바닥 밀착)
  const BED_LENGTH = 760;
  const BED_WIDTH = 300;
  const BED_HEIGHT = 75;

  const bedGeo = new THREE.BoxGeometry(BED_LENGTH, BED_HEIGHT, BED_WIDTH);
  const bed = new THREE.Mesh(bedGeo, baseMat);
  bed.position.set(0, BED_HEIGHT / 2, 0);
  bed.castShadow = true;
  bed.receiveShadow = true;
  pumpGroup.add(bed);

  const shaftLocalY = BED_HEIGHT + 160; // H1(160) 기준

  // B. 모터 본체 (좌측)
  const motorRadius = 82;
  const motorBodyGeo = new THREE.CylinderGeometry(motorRadius, motorRadius, 175, 32);
  const motorBody = new THREE.Mesh(motorBodyGeo, motorBodyMat);
  motorBody.rotation.z = Math.PI / 2;
  motorBody.position.set(-210, shaftLocalY, 0);
  motorBody.castShadow = true;
  pumpGroup.add(motorBody);

  const motorMountGeo = new THREE.BoxGeometry(130, 57, 110);
  const motorMount = new THREE.Mesh(motorMountGeo, motorBodyMat);
  motorMount.position.set(-210, BED_HEIGHT + 48.5, 0);
  motorMount.castShadow = true;
  pumpGroup.add(motorMount);

  const motorMountBaseGeo = new THREE.BoxGeometry(160, 6, 140);
  const motorMountBase = new THREE.Mesh(motorMountBaseGeo, motorBodyMat);
  motorMountBase.position.set(-210, BED_HEIGHT + 3, 0);
  motorMountBase.castShadow = true;
  pumpGroup.add(motorMountBase);

  const finCount = 32;
  for (let i = 0; i < finCount; i++) {
    const angle = (i / finCount) * Math.PI * 2;
    const finHolder = new THREE.Group();
    finHolder.rotation.x = angle;
    finHolder.position.set(-210, shaftLocalY, 0);

    const finGeo = new THREE.BoxGeometry(145, 24, 5);
    const fin = new THREE.Mesh(finGeo, finMat);
    fin.position.set(0, motorRadius + 12, 0);
    finHolder.add(fin);
    pumpGroup.add(finHolder);
  }

  const fanCover = new THREE.Mesh(
    new THREE.CylinderGeometry(75, motorRadius, 45, 32),
    motorBodyMat
  );
  fanCover.rotation.z = Math.PI / 2;
  fanCover.position.set(-325, shaftLocalY, 0);
  pumpGroup.add(fanCover);

  const terminalBox = new THREE.Mesh(
    new THREE.BoxGeometry(75, 50, 75),
    motorBodyMat
  );
  terminalBox.position.set(-210, shaftLocalY + 58, 0);
  pumpGroup.add(terminalBox);

  // C. 커플링 안전 보호 덮개
  const guardGroup = new THREE.Group();
  guardGroup.position.set(-80, BED_HEIGHT, 0);
  const guardRadius = 65,
    guardLength = 85,
    guardHeight = 160;

  const archMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(guardRadius, guardRadius, guardLength, 32, 1, true, 0, Math.PI),
    yellowGuardMat
  );
  archMesh.rotation.z = Math.PI / 2;
  archMesh.position.set(0, guardHeight, 0);
  guardGroup.add(archMesh);

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(guardLength, guardHeight, 3),
    yellowGuardMat
  );
  leftWall.position.set(0, guardHeight / 2, -guardRadius);
  guardGroup.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(guardLength, guardHeight, 3),
    yellowGuardMat
  );
  rightWall.position.set(0, guardHeight / 2, guardRadius);
  guardGroup.add(rightWall);

  [-guardRadius, guardRadius].forEach((zPos) => {
    const isRight = zPos > 0;
    const flangeWing = new THREE.Mesh(
      new THREE.BoxGeometry(guardLength, 3, 18),
      yellowGuardMat
    );
    flangeWing.position.set(0, 1.5, isRight ? zPos + 9 : zPos - 9);
    guardGroup.add(flangeWing);
  });
  pumpGroup.add(guardGroup);

  // D. 펌프 본체 부
  const voluteGeo = new THREE.CylinderGeometry(90, 90, 180, 32);
  const voluteBody = new THREE.Mesh(voluteGeo, pumpBodyMat);
  voluteBody.rotation.z = Math.PI / 2;
  voluteBody.position.set(140, shaftLocalY, 0);
  voluteBody.castShadow = true;
  pumpGroup.add(voluteBody);

  const leftProtrusion = new THREE.Mesh(
    new THREE.CylinderGeometry(40, 55, 65, 32),
    pumpBodyMat
  );
  leftProtrusion.rotation.z = Math.PI / 2;
  leftProtrusion.position.set(27.5, shaftLocalY, 0);
  pumpGroup.add(leftProtrusion);

  const leftCap = new THREE.Mesh(
    new THREE.CylinderGeometry(35, 35, 15, 32),
    pumpBodyMat
  );
  leftCap.rotation.z = Math.PI / 2;
  leftCap.position.set(-10, shaftLocalY, 0);
  pumpGroup.add(leftCap);

  const rightProtrusion = new THREE.Mesh(
    new THREE.CylinderGeometry(55, 40, 65, 32),
    pumpBodyMat
  );
  rightProtrusion.rotation.z = Math.PI / 2;
  rightProtrusion.position.set(252.5, shaftLocalY, 0);
  pumpGroup.add(rightProtrusion);

  const rightCap = new THREE.Mesh(
    new THREE.CylinderGeometry(35, 35, 15, 32),
    pumpBodyMat
  );
  rightCap.rotation.z = Math.PI / 2;
  rightCap.position.set(290, shaftLocalY, 0);
  pumpGroup.add(rightCap);

  const shaftGeo = new THREE.CylinderGeometry(18, 18, 380, 24);
  const mainShaft = new THREE.Mesh(shaftGeo, stainlessShaftMat);
  mainShaft.rotation.z = Math.PI / 2;
  mainShaft.position.set(-15, shaftLocalY, 0);
  pumpGroup.add(mainShaft);

  // 공통 볼트 규격 설정 (4-Ø19 -> 반지름 9.5)
  const boltCount = 4;
  const boltHoleRadius = 19 / 2; 
  const flangeThickness = 16;

  // ==========================================
  // 1) 흡입관 및 플랜지 규격 (반지름 25, 외경 155/2, 두께 16)
  // ==========================================
  const suctionPipeRadius = 25;
  const suctionFlangeOuterRadius = 155 / 2;
  const suctionBoltCircleRadius = 120 / 2;

  const createSuctionFlangeShape = () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, suctionFlangeOuterRadius, 0, Math.PI * 2, false);
    const centerHole = new THREE.Path();
    centerHole.absarc(0, 0, suctionPipeRadius, 0, Math.PI * 2, true);
    shape.holes.push(centerHole);

    for (let i = 0; i < boltCount; i++) {
      const angle = (i / boltCount) * Math.PI * 2;
      const bx = Math.cos(angle) * suctionBoltCircleRadius;
      const by = Math.sin(angle) * suctionBoltCircleRadius;
      const boltHole = new THREE.Path();
      boltHole.absarc(bx, by, boltHoleRadius, 0, Math.PI * 2, true);
      shape.holes.push(boltHole);
    }
    return shape;
  };

  const suctionFlangeGeometry = new THREE.ExtrudeGeometry(createSuctionFlangeShape(), {
    depth: flangeThickness,
    bevelEnabled: false,
  });

  const suctionPipeLength = 30;
  const suctionX = 80;
  const suctionZCenter = 95;

  const suctionPipeGeo = new THREE.CylinderGeometry(suctionPipeRadius, suctionPipeRadius, suctionPipeLength, 32, 1, true);
  const suctionPipe = new THREE.Mesh(suctionPipeGeo, pumpBodyMat);
  suctionPipe.rotation.x = Math.PI / 2;
  suctionPipe.position.set(suctionX, shaftLocalY, suctionZCenter);
  pumpGroup.add(suctionPipe);

  const suctionFlangeZ = suctionZCenter + suctionPipeLength / 2;
  const suctionFlange = new THREE.Mesh(suctionFlangeGeometry, pumpBodyMat);
  suctionFlange.name = "flange_suction";
  suctionFlange.position.set(suctionX, shaftLocalY, suctionFlangeZ);
  pumpGroup.add(suctionFlange);

  const suctionSnapSurface = new THREE.Mesh(
    new THREE.CircleGeometry(suctionFlangeOuterRadius - 5, 32),
    snapMat
  );
  suctionSnapSurface.name = "snap_surface_suction";
  suctionSnapSurface.rotation.y = Math.PI;
  suctionSnapSurface.position.set(suctionX, shaftLocalY, suctionFlangeZ + flangeThickness + 0.1);
  pumpGroup.add(suctionSnapSurface);

  const suctionHole = new THREE.Mesh(
    new THREE.CircleGeometry(suctionPipeRadius - 0.5, 32),
    holeMat
  );
  suctionHole.position.set(suctionX, shaftLocalY, 80);
  pumpGroup.add(suctionHole);

  // ==========================================
  // 2) 토출관 및 플랜지 규격 (반지름 20, 외경 135/2, 두께 16)
  // ==========================================
  const dischargePipeRadius = 20;
  const dischargeFlangeOuterRadius = 135 / 2;
  const dischargeBoltCircleRadius = 105 / 2;

  const createDischargeFlangeShape = () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, dischargeFlangeOuterRadius, 0, Math.PI * 2, false);
    const centerHole = new THREE.Path();
    centerHole.absarc(0, 0, dischargePipeRadius, 0, Math.PI * 2, true);
    shape.holes.push(centerHole);

    for (let i = 0; i < boltCount; i++) {
      const angle = (i / boltCount) * Math.PI * 2;
      const bx = Math.cos(angle) * dischargeBoltCircleRadius;
      const by = Math.sin(angle) * dischargeBoltCircleRadius;
      const boltHole = new THREE.Path();
      boltHole.absarc(bx, by, boltHoleRadius, 0, Math.PI * 2, true);
      shape.holes.push(boltHole);
    }
    return shape;
  };

  const dischargeFlangeGeometry = new THREE.ExtrudeGeometry(createDischargeFlangeShape(), {
    depth: flangeThickness,
    bevelEnabled: false,
  });

  const dischargePipeY = 320;
  const dischargePipeGeo = new THREE.CylinderGeometry(dischargePipeRadius, dischargePipeRadius, 60, 32, 1, true);
  const dischargePipe = new THREE.Mesh(dischargePipeGeo, pumpBodyMat);
  dischargePipe.position.set(190, dischargePipeY, 0);
  pumpGroup.add(dischargePipe);

  const dischargeFlangeY = 360;
  const dischargeFlange = new THREE.Mesh(dischargeFlangeGeometry, pumpBodyMat);
  dischargeFlange.name = "flange_discharge";
  dischargeFlange.rotation.x = Math.PI / 2;
  dischargeFlange.position.set(190, dischargeFlangeY, 0);
  pumpGroup.add(dischargeFlange);

  const dischargeSnapSurface = new THREE.Mesh(
    new THREE.CircleGeometry(dischargeFlangeOuterRadius - 5, 32),
    snapMat
  );
  dischargeSnapSurface.name = "snap_surface_discharge";
  dischargeSnapSurface.rotation.x = Math.PI / 2;
  dischargeSnapSurface.position.set(190, dischargeFlangeY + 0.1, 0);
  pumpGroup.add(dischargeSnapSurface);

  // 다리 및 베이스 발판
  [80, 200].forEach((xPos) => {
    [-1, 1].forEach((dir) => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(24, 115, 16),
        pumpBodyMat
      );
      leg.position.set(xPos, BED_HEIGHT + 43, dir * 55);
      leg.rotation.x = dir * -0.32;
      leg.castShadow = true;
      pumpGroup.add(leg);
    });

    const footPlate = new THREE.Mesh(
      new THREE.BoxGeometry(32, 12, 180),
      pumpBodyMat
    );
    footPlate.position.set(xPos, BED_HEIGHT + 6, 0);
    footPlate.castShadow = true;
    pumpGroup.add(footPlate);
  });

  return pumpGroup;
}

/**
 * 단독 렌더링용 메인 컴포넌트 (단품 뷰어용)
 */
export default function Pump_SMT40_2({ pumpType }: PumpProps) {
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
    camera.position.set(450, 250, 450);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 40, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(400, 600, 400);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 1, 600);
    pointLight.position.set(-200, 300, 200);
    scene.add(pointLight);

    const gridHelper = new THREE.GridHelper(1000, 40, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const pumpGroup = buildPumpGroup();
    scene.add(pumpGroup);

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

      scene.traverse((object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat: any) => mat.dispose());
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
        background: "radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)",
      }}
    />
  );
}