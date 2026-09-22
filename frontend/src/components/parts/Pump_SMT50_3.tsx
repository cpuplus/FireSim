// src/components/parts/Pump_SMT50_3.tsx

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ==========================================
// 📌 [투명도 설정 옵션] (전체 불투명 1.0)
// ==========================================
const OPACITY = {
  BASE: 1.0, // 베이스 프레임
  PUMP: 1.0, // 펌프
  GUARD: 1.0, // 안전 커버
  MOTOR: 1.0, // 모터
  TERMINAL: 1.0, // 전기 단자함
};

// ==========================================
// 📌 [하드코딩 치수 규격 모음 (연동 해제 및 독립 설정)]
// ==========================================

const PUMP_X_OFFSET = 60; // 펌프 오른쪽(+X) 이동 Offset

const BASE_SPEC = {
  BED_LENGTH: 700, // 베드 전체 길이
  BED_WIDTH: 226, // 베드 폭
  BED_HEIGHT: 75, // 베드 프레임 두께 (상단 Y 좌표)
  FRAME_THICKNESS: 15, // 베드 프레임 두께
  LEG_X_POSITIONS: [80 + PUMP_X_OFFSET, 200 + PUMP_X_OFFSET],
  FOOT_PLATE_SIZE: [32, 20, 140] as [number, number, number], // 💡 윗판(발판) 두께 충분히 확장
  LEG_SIZE: [40, 16, 35] as [number, number, number],
};

// 💡 모터 전용 독자적 높이 규격 (베드 상단 기준)
const MOTOR_SPEC = {
  RADIUS: 122,
  LENGTH: 200,
  SHAFT_RADIUS: 14,
  SHAFT_LENGTH: 60,
  INSTALL_Y: 75 + 140, // 베드 상단(75) + 모터 샤프트 중심 높이
  FOOT: {
    LENGTH_X: 172,
    WIDTH_Z: 226,
    THICKNESS: 14,
    FOOT_WIDTH: 41,
    HOLE_PITCH_X: 140,
    HOLE_PITCH_Z: 190,
  },
  FIN_COUNT: 32,
  FIN_SIZE: [195, 18, 4] as [number, number, number],
  FAN_COVER: {
    RADIUS_TOP: 115,
    LENGTH: 116,
  },
  TERMINAL_BOX: {
    SIZE: [110, 100, 84] as [number, number, number],
    OFFSET_Z: 164,
    OFFSET_Y: -10,
  },
  EYEBOLT: {
    OUTER_RADIUS: 18,
    INNER_RADIUS: 10,
    THICKNESS: 8,
    TOP_Y: 166.2,
  },
  GUARD: {
    LENGTH: 75, // 안전판 폭
    HEIGHT: 140, // 독립된 안전판 다리 높이
  },
};

// 💡 펌프 전용 독자적 높이 규격
const PUMP_SPEC = {
  VOLUTE_RADIUS: 110,
  VOLUTE_LENGTH: 213,
  SHAFT_RADIUS: 18,
  SHAFT_LENGTH: 380,
  INSTALL_Y: 75 + 140, // 모터와 샤프트 중심 일치
  LEG_HEIGHT: 130, // 💡 사선 지지대 높이 정밀 조정
  COMMON_FLANGE: {
    BOLT_COUNT: 4,
    BOLT_HOLE_RADIUS: 19 / 2,
    FLANGE_THICKNESS: 16,
  },
  SUCTION: {
    PIPE_RADIUS: 25,
    FLANGE_OUTER_RADIUS: 155 / 2,
    BOLT_CIRCLE_RADIUS: 120 / 2,
    PIPE_LENGTH: 30,
    X_POS: 80 + PUMP_X_OFFSET,
    Z_CENTER: 115,
  },
  DISCHARGE: {
    PIPE_RADIUS: 20,
    FLANGE_OUTER_RADIUS: 135 / 2,
    BOLT_CIRCLE_RADIUS: 105 / 2,
    PIPE_OFFSET_Y: 100,
    FLANGE_OFFSET_Y: 140,
    X_POS: 190 + PUMP_X_OFFSET,
  },
};

interface PumpProps {
  pumpType?: string;
}

export function buildPumpGroup(): THREE.Group {
  const rootGroup = new THREE.Group();
  rootGroup.name = "pump-smt50-3-root";

  // 재질 설정
  const motorBodyMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.4,
    metalness: 0.6,
    transparent: OPACITY.MOTOR < 1.0,
    opacity: OPACITY.MOTOR,
  });

  const terminalBoxMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    roughness: 0.5,
    metalness: 0.4,
    transparent: OPACITY.TERMINAL < 1.0,
    opacity: OPACITY.TERMINAL,
  });

  const finMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
    metalness: 0.5,
    transparent: OPACITY.MOTOR < 1.0,
    opacity: OPACITY.MOTOR,
  });

  const pumpBodyMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.4,
    metalness: 0.6,
    transparent: OPACITY.PUMP < 1.0,
    opacity: OPACITY.PUMP,
    depthWrite: OPACITY.PUMP === 1.0,
    side: THREE.DoubleSide,
  });

  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.3,
    metalness: 0.8,
    transparent: OPACITY.BASE < 1.0,
    opacity: OPACITY.BASE,
    depthWrite: OPACITY.BASE === 1.0,
  });

  const yellowGuardMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.3,
    metalness: 0.2,
    transparent: OPACITY.GUARD < 1.0,
    opacity: OPACITY.GUARD,
    depthWrite: OPACITY.GUARD === 1.0,
    side: THREE.DoubleSide,
  });

  const stainlessShaftMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.2,
    metalness: 0.8,
    transparent: OPACITY.MOTOR < 1.0,
    opacity: OPACITY.MOTOR,
  });

  const boltMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.3,
    metalness: 0.7,
    transparent: OPACITY.MOTOR < 1.0,
    opacity: OPACITY.MOTOR,
  });

  const motorCenterX = -180;

  // ==========================================
  // 1️⃣ 베이스 프레임 그룹
  // ==========================================
  const baseGroup = new THREE.Group();
  baseGroup.name = "base-group";

  const L = BASE_SPEC.BED_LENGTH;
  const W = BASE_SPEC.BED_WIDTH;
  const H = BASE_SPEC.BED_HEIGHT;
  const T = BASE_SPEC.FRAME_THICKNESS;

  const bedCenterX = -15;
  const frameZPos = W / 2 - T / 2;

  [-frameZPos, frameZPos].forEach((zPos) => {
    const sideBeam = new THREE.Mesh(
      new THREE.BoxGeometry(L, H, T * 2),
      baseMat,
    );
    sideBeam.position.set(bedCenterX, H / 2, zPos);
    baseGroup.add(sideBeam);
  });

  [bedCenterX - L / 2 + T / 2, bedCenterX + L / 2 - T / 2].forEach((xPos) => {
    const endBeam = new THREE.Mesh(
      new THREE.BoxGeometry(T, H, W - T * 2),
      baseMat,
    );
    endBeam.position.set(xPos, H / 2, 0);
    baseGroup.add(endBeam);
  });

  BASE_SPEC.LEG_X_POSITIONS.forEach((xPos) => {
    const crossBeam = new THREE.Mesh(
      new THREE.BoxGeometry(40, H, W - T * 2),
      baseMat,
    );
    crossBeam.position.set(xPos, H / 2, 0);
    baseGroup.add(crossBeam);
  });

  [
    motorCenterX - MOTOR_SPEC.FOOT.HOLE_PITCH_X / 2,
    motorCenterX + MOTOR_SPEC.FOOT.HOLE_PITCH_X / 2,
  ].forEach((xPos) => {
    const motorCrossBeam = new THREE.Mesh(
      new THREE.BoxGeometry(35, H, W - T * 2),
      baseMat,
    );
    motorCrossBeam.position.set(xPos, H / 2, 0);
    baseGroup.add(motorCrossBeam);
  });

  rootGroup.add(baseGroup);

  // ==========================================
  // 2️⃣ 모터 및 안전판 그룹
  // ==========================================
  const motorGroup = new THREE.Group();
  motorGroup.name = "motor-group";
  motorGroup.position.set(0, MOTOR_SPEC.INSTALL_Y, 0);

  const motorBodyGroup = new THREE.Group();
  const motorBody = new THREE.Mesh(
    new THREE.CylinderGeometry(
      MOTOR_SPEC.RADIUS,
      MOTOR_SPEC.RADIUS,
      MOTOR_SPEC.LENGTH,
      32,
    ),
    motorBodyMat,
  );
  motorBody.rotation.z = Math.PI / 2;
  motorBody.position.set(motorCenterX, 0, 0);
  motorBodyGroup.add(motorBody);

  for (let i = 0; i < MOTOR_SPEC.FIN_COUNT; i++) {
    const angle = (i / MOTOR_SPEC.FIN_COUNT) * Math.PI * 2;
    const finHolder = new THREE.Group();
    finHolder.rotation.x = angle;
    finHolder.position.set(motorCenterX, 0, 0);

    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(...MOTOR_SPEC.FIN_SIZE),
      finMat,
    );
    fin.position.set(0, MOTOR_SPEC.RADIUS + 8, 0);
    finHolder.add(fin);
    motorBodyGroup.add(finHolder);
  }

  const fanCover = new THREE.Mesh(
    new THREE.CylinderGeometry(
      MOTOR_SPEC.FAN_COVER.RADIUS_TOP,
      MOTOR_SPEC.RADIUS,
      MOTOR_SPEC.FAN_COVER.LENGTH,
      32,
    ),
    motorBodyMat,
  );
  fanCover.rotation.z = Math.PI / 2;
  fanCover.position.set(
    motorCenterX - MOTOR_SPEC.LENGTH / 2 - MOTOR_SPEC.FAN_COVER.LENGTH / 2,
    0,
    0,
  );
  motorBodyGroup.add(fanCover);

  const eyeOuter = MOTOR_SPEC.EYEBOLT.OUTER_RADIUS;
  const eyeInner = MOTOR_SPEC.EYEBOLT.INNER_RADIUS;
  const eyeShape = new THREE.Shape();
  eyeShape.absarc(0, 0, eyeOuter, 0, Math.PI * 2, false);
  const eyeHole = new THREE.Path();
  eyeHole.absarc(0, 0, eyeInner, 0, Math.PI * 2, true);
  eyeShape.holes.push(eyeHole);

  const eyebolt = new THREE.Mesh(
    new THREE.ExtrudeGeometry(eyeShape, {
      depth: MOTOR_SPEC.EYEBOLT.THICKNESS,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
    }),
    finMat,
  );
  eyebolt.position.set(
    motorCenterX,
    MOTOR_SPEC.EYEBOLT.TOP_Y - eyeOuter,
    -MOTOR_SPEC.EYEBOLT.THICKNESS / 2,
  );
  motorBodyGroup.add(eyebolt);

  motorGroup.add(motorBodyGroup);

  const motorFootGroup = new THREE.Group();
  const footX = MOTOR_SPEC.FOOT.LENGTH_X;
  const footZ = MOTOR_SPEC.FOOT.WIDTH_Z;
  const footThickness = MOTOR_SPEC.FOOT.THICKNESS;
  const footWidth = MOTOR_SPEC.FOOT.FOOT_WIDTH;

  const motorFootLocalY =
    -MOTOR_SPEC.INSTALL_Y + BASE_SPEC.BED_HEIGHT + footThickness / 2;

  [-1, 1].forEach((dir) => {
    const sideFoot = new THREE.Mesh(
      new THREE.BoxGeometry(footX, footThickness, footWidth + 15),
      motorBodyMat,
    );
    const zPos = dir * (footZ / 2 - footWidth / 2);
    sideFoot.position.set(motorCenterX, motorFootLocalY, zPos);
    motorFootGroup.add(sideFoot);

    const legPillar = new THREE.Mesh(
      new THREE.BoxGeometry(footX - 60, 60, 25),
      motorBodyMat,
    );
    legPillar.position.set(
      motorCenterX,
      -MOTOR_SPEC.RADIUS + 12,
      dir * (MOTOR_SPEC.RADIUS - 45),
    );
    motorFootGroup.add(legPillar);

    [
      -MOTOR_SPEC.FOOT.HOLE_PITCH_X / 2,
      MOTOR_SPEC.FOOT.HOLE_PITCH_X / 2,
    ].forEach((bx) => {
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(7, 7, 12, 6),
        boltMat,
      );
      bolt.position.set(
        motorCenterX + bx,
        motorFootLocalY + footThickness / 2,
        zPos,
      );
      motorFootGroup.add(bolt);
    });
  });
  motorGroup.add(motorFootGroup);

  const terminalBox = new THREE.Mesh(
    new THREE.BoxGeometry(...MOTOR_SPEC.TERMINAL_BOX.SIZE),
    terminalBoxMat,
  );
  terminalBox.position.set(
    motorCenterX - 10,
    MOTOR_SPEC.TERMINAL_BOX.OFFSET_Y,
    MOTOR_SPEC.TERMINAL_BOX.OFFSET_Z,
  );
  motorGroup.add(terminalBox);

  const couplingGroup = new THREE.Group();
  const motorShaftStartX = motorCenterX + MOTOR_SPEC.LENGTH / 2;
  const pumpShaftEndX = -10 + PUMP_X_OFFSET;
  const gapCenter = (motorShaftStartX + pumpShaftEndX) / 2;

  const mainShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(16, 16, pumpShaftEndX - motorShaftStartX, 24),
    stainlessShaftMat,
  );
  mainShaft.rotation.z = Math.PI / 2;
  mainShaft.position.set(gapCenter, 0, 0);
  couplingGroup.add(mainShaft);

  const motorFlange = new THREE.Mesh(
    new THREE.CylinderGeometry(55, 55, 28, 32),
    motorBodyMat,
  );
  motorFlange.rotation.z = Math.PI / 2;
  motorFlange.position.set(gapCenter - 18, 0, 0);
  couplingGroup.add(motorFlange);

  const pumpFlange = new THREE.Mesh(
    new THREE.CylinderGeometry(55, 55, 28, 32),
    pumpBodyMat,
  );
  pumpFlange.rotation.z = Math.PI / 2;
  pumpFlange.position.set(gapCenter + 14, 0, 0);
  couplingGroup.add(pumpFlange);

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const boltRadius = 38;
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(6, 6, 62, 12),
      boltMat,
    );
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(
      gapCenter + 3,
      Math.sin(angle) * boltRadius,
      Math.cos(angle) * boltRadius,
    );
    couplingGroup.add(bolt);
  }
  motorGroup.add(couplingGroup);

  const guardGroup = new THREE.Group();
  const guardX = gapCenter;
  const { LENGTH: guardLength } = MOTOR_SPEC.GUARD;
  const mountingZPos = BASE_SPEC.BED_WIDTH / 2 - BASE_SPEC.FRAME_THICKNESS / 2;
  const guardRadius = mountingZPos * 0.87;

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
  archMesh.position.set(guardX, 0, 0);
  guardGroup.add(archMesh);

  const guardLegHeight = MOTOR_SPEC.INSTALL_Y - BASE_SPEC.BED_HEIGHT;

  [-1, 1].forEach((dir) => {
    const sidePlate = new THREE.Mesh(
      new THREE.BoxGeometry(guardLength, guardLegHeight, 0.1),
      yellowGuardMat,
    );
    sidePlate.position.set(
      guardX,
      -guardLegHeight / 2,
      dir * mountingZPos * 0.87,
    );
    guardGroup.add(sidePlate);

    const bottomFlange = new THREE.Mesh(
      new THREE.BoxGeometry(guardLength, 6, 28),
      yellowGuardMat,
    );
    bottomFlange.position.set(guardX, -guardLegHeight + 3, dir * mountingZPos);
    guardGroup.add(bottomFlange);

    [-20, 20].forEach((bx) => {
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 5, 10, 6),
        boltMat,
      );
      bolt.position.set(guardX + bx, -guardLegHeight + 8, dir * mountingZPos);
      guardGroup.add(bolt);
    });
  });

  motorGroup.add(guardGroup);
  rootGroup.add(motorGroup);

  // ==========================================
  // 3️⃣ 펌프 그룹
  // ==========================================
  const pumpGroup = new THREE.Group();
  pumpGroup.position.set(0, PUMP_SPEC.INSTALL_Y, 0);

  const voluteBody = new THREE.Mesh(
    new THREE.CylinderGeometry(
      PUMP_SPEC.VOLUTE_RADIUS,
      PUMP_SPEC.VOLUTE_RADIUS,
      PUMP_SPEC.VOLUTE_LENGTH,
      32,
    ),
    pumpBodyMat,
  );
  voluteBody.rotation.z = Math.PI / 2;
  voluteBody.position.set(140 + PUMP_X_OFFSET, 0, 0);
  pumpGroup.add(voluteBody);

  const leftProtrusion = new THREE.Mesh(
    new THREE.CylinderGeometry(40, 55, 65, 32),
    pumpBodyMat,
  );
  leftProtrusion.rotation.z = Math.PI / 2;
  leftProtrusion.position.set(27.5 + PUMP_X_OFFSET, 0, 0);
  pumpGroup.add(leftProtrusion);

  const leftCap = new THREE.Mesh(
    new THREE.CylinderGeometry(35, 35, 15, 32),
    pumpBodyMat,
  );
  leftCap.rotation.z = Math.PI / 2;
  leftCap.position.set(-10 + PUMP_X_OFFSET, 0, 0);
  pumpGroup.add(leftCap);

  const rightProtrusion = new THREE.Mesh(
    new THREE.CylinderGeometry(55, 40, 65, 32),
    pumpBodyMat,
  );
  rightProtrusion.rotation.z = Math.PI / 2;
  rightProtrusion.position.set(252.5 + PUMP_X_OFFSET, 0, 0);
  pumpGroup.add(rightProtrusion);

  const rightCap = new THREE.Mesh(
    new THREE.CylinderGeometry(35, 35, 15, 32),
    pumpBodyMat,
  );
  rightCap.rotation.z = Math.PI / 2;
  rightCap.position.set(290 + PUMP_X_OFFSET, 0, 0);
  pumpGroup.add(rightCap);

  // 💡 윗판과 아랫판, 사선 지지대 연동 처리 (아래쪽으로 두께 확장)
  const footPlateThickness = BASE_SPEC.FOOT_PLATE_SIZE[1];
  const targetLegHeight = PUMP_SPEC.LEG_HEIGHT;
  const pumpFootLocalY = -PUMP_SPEC.INSTALL_Y + BASE_SPEC.BED_HEIGHT;

  BASE_SPEC.LEG_X_POSITIONS.forEach((xPos) => {
    const footPlate = new THREE.Mesh(
      new THREE.BoxGeometry(...BASE_SPEC.FOOT_PLATE_SIZE),
      pumpBodyMat,
    );
    // 💡 아래쪽(마이너스 방향)으로 두께가 늘어나도록 Y 좌표 오프셋 수정
    footPlate.position.set(xPos, pumpFootLocalY + 10, 0);
    pumpGroup.add(footPlate);

    [-1, 1].forEach((dir) => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(
          BASE_SPEC.LEG_SIZE[0] * 0.9,
          targetLegHeight,
          BASE_SPEC.LEG_SIZE[2],
        ),
        pumpBodyMat,
      );
      leg.position.set(
        xPos,
        pumpFootLocalY - footPlateThickness + targetLegHeight / 2 + 15,
        dir * 45,
      );
      leg.rotation.x = dir * -0.22;
      pumpGroup.add(leg);
    });
  });

  const {
    BOLT_COUNT: boltCount,
    BOLT_HOLE_RADIUS: boltHoleRadius,
    FLANGE_THICKNESS: flangeThickness,
  } = PUMP_SPEC.COMMON_FLANGE;

  const {
    PIPE_RADIUS: suctionPipeRadius,
    FLANGE_OUTER_RADIUS: suctionFlangeOuterRadius,
    BOLT_CIRCLE_RADIUS: suctionBoltCircleRadius,
    PIPE_LENGTH: suctionPipeLength,
    X_POS: suctionX,
    Z_CENTER: suctionZCenter,
  } = PUMP_SPEC.SUCTION;

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

  const suctionPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(
      suctionPipeRadius,
      suctionPipeRadius,
      suctionPipeLength,
      32,
      1,
      true,
    ),
    pumpBodyMat,
  );
  suctionPipe.rotation.x = Math.PI / 2;
  suctionPipe.position.set(suctionX, 0, suctionZCenter);
  pumpGroup.add(suctionPipe);

  const suctionFlange = new THREE.Mesh(
    new THREE.ExtrudeGeometry(createSuctionFlangeShape(), {
      depth: flangeThickness,
      bevelEnabled: false,
    }),
    pumpBodyMat,
  );
  suctionFlange.position.set(
    suctionX,
    0,
    suctionZCenter + suctionPipeLength / 2,
  );
  pumpGroup.add(suctionFlange);

  const {
    PIPE_RADIUS: dischargePipeRadius,
    FLANGE_OUTER_RADIUS: dischargeFlangeOuterRadius,
    BOLT_CIRCLE_RADIUS: dischargeBoltCircleRadius,
    PIPE_OFFSET_Y: dischargePipeOffsetY,
    FLANGE_OFFSET_Y: dischargeFlangeOffsetY,
    X_POS: dischargeX,
  } = PUMP_SPEC.DISCHARGE;

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

  const dischargePipe = new THREE.Mesh(
    new THREE.CylinderGeometry(
      dischargePipeRadius,
      dischargePipeRadius,
      60,
      32,
      1,
      true,
    ),
    pumpBodyMat,
  );
  dischargePipe.position.set(dischargeX, dischargePipeOffsetY, 0);
  pumpGroup.add(dischargePipe);

  const dischargeFlange = new THREE.Mesh(
    new THREE.ExtrudeGeometry(createDischargeFlangeShape(), {
      depth: flangeThickness,
      bevelEnabled: false,
    }),
    pumpBodyMat,
  );
  dischargeFlange.rotation.x = Math.PI / 2;
  dischargeFlange.position.set(dischargeX, dischargeFlangeOffsetY, 0);
  pumpGroup.add(dischargeFlange);

  rootGroup.add(pumpGroup);

  return rootGroup;
}

export default function Pump_SMT50_3({ pumpType }: PumpProps) {
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
      2000,
    );
    camera.position.set(500, 300, 500);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(-15, MOTOR_SPEC.INSTALL_Y, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(400, 600, 400);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 1, 600);
    pointLight.position.set(-100, 300, 200);
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
        background:
          "radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)",
      }}
    />
  );
}
