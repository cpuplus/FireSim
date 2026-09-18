import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface FlexibleJoint_40AProps {
  jointType?: "standard" | "flanged";
  lengthMm?: number; // 도면 규격 L=230mm 기본
}

export default function FlexibleJoint_40A({
  jointType = "flanged",
  lengthMm = 230,
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
    // 40A 플렉시블 조인트 전체 규격(L=230mm)을 감상하기 적절한 카메라 거리
    camera.position.set(300, 180, 300);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

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

    const jointGroup = new THREE.Group();
    scene.add(jointGroup);

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
      wireframe: true, // 와이어프레임 메쉬로 금속 그물망(Braid) 효과 연출
    });
    const rubberCollarMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.1,
    });
    const holeMat = new THREE.MeshBasicMaterial({
      color: 0x030712,
      side: THREE.DoubleSide,
    });

    // 40A 규격 스펙 적용 (관경 내부 반지름 ~20mm, 플랜지 외경 ~120mm, 볼트 PCD 등)
    const pipeRadius = 20;
    const flangeOuterRadius = 60;
    const flangeThickness = 14;
    const boltCount = 4; // 40A 표준 4개 이상의 볼트 구멍 (보통 4~8홀)
    const boltCircleRadius = 42;
    const boltHoleRadius = 4;

    const createFlangeShape = () => {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, flangeOuterRadius, 0, Math.PI * 2, false);

      // 중앙 관통 구멍 (40A)
      const centerHole = new THREE.Path();
      centerHole.absarc(0, 0, pipeRadius, 0, Math.PI * 2, true);
      shape.holes.push(centerHole);

      // 4개 볼트 홀
      for (let i = 0; i < boltCount; i++) {
        const angle = (i / boltCount) * Math.PI * 2 + Math.PI / 4; // 45도 회전 대칭
        const bx = Math.cos(angle) * boltCircleRadius;
        const by = Math.sin(angle) * boltCircleRadius;
        const boltHole = new THREE.Path();
        boltHole.absarc(bx, by, boltHoleRadius, 0, Math.PI * 2, true);
        shape.holes.push(boltHole);
      }
      return shape;
    };

    const flangeExtrudeSettings = { depth: flangeThickness, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 1, bevelThickness: 1 };
    const flangeGeometry = new THREE.ExtrudeGeometry(createFlangeShape(), flangeExtrudeSettings);
    // 중앙 정렬을 위한 지오메트리 중심 이동
    flangeGeometry.center();

    // 1) 좌측 플랜지 (X 위치: -115)
    const leftFlange = new THREE.Mesh(flangeGeometry, flangeMat);
    leftFlange.rotation.y = Math.PI / 2;
    leftFlange.position.set(-lengthMm / 2 + flangeThickness / 2, 0, 0);
    leftFlange.castShadow = true;
    jointGroup.add(leftFlange);

    // 좌측 플랜지 볼트 삽입 표현
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

    // 2) 우측 플랜지 (X 위치: +115)
    const rightFlange = new THREE.Mesh(flangeGeometry, flangeMat);
    rightFlange.rotation.y = Math.PI / 2;
    rightFlange.position.set(lengthMm / 2 - flangeThickness / 2, 0, 0);
    rightFlange.castShadow = true;
    jointGroup.add(rightFlange);

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

    const bellowsLength = lengthMm - flangeThickness * 2 - 20;
    const bellowsRadius = 26;

    // 벨로우즈 주름 형태를 만들기 위한 커스텀 토러스/실린더 조합 또는 LatheGeometry 생성
    const points = [];
    const segmentsCount = 24;
    const spanX = bellowsLength;
    for (let i = 0; i <= segmentsCount; i++) {
      const t = i / segmentsCount;
      const x = (t - 0.5) * spanX;
      // 주름(Ripple) 웨이브 효과 공식
      const r = bellowsRadius + Math.sin(t * Math.PI * 10) * 4;
      points.push(new THREE.Vector2(r, x));
    }

    const bellowsGeo = new THREE.LatheGeometry(points, 32);
    // LatheGeometry는 기본적으로 Y축 기준이므로 X축 방향으로 눕혀줌
    bellowsGeo.rotateZ(Math.PI / 2);
    const bellowsMesh = new THREE.Mesh(bellowsGeo, bellowsMat);
    jointGroup.add(bellowsMesh);

    // 외부 금속 그물망 (Braid) - 약간 더 큰 반경으로 감싸기
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
    jointGroup.add(braidMesh);

    // 양 끝단 고무/메탈 실링 칼라 (Collar)
    [-bellowsLength / 2 - 5, bellowsLength / 2 + 5].forEach((posX) => {
      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(pipeRadius + 2, bellowsRadius + 2, 12, 32),
        rubberCollarMat
      );
      collar.rotation.z = Math.PI / 2;
      collar.position.set(posX, 0, 0);
      jointGroup.add(collar);
    });

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // 미세한 유연성 회전/진동 애니메이션 효과 (선택적 가동감)
      bellowsMesh.rotation.x = Math.sin(Date.now() * 0.003) * 0.01;
      braidMesh.rotation.x = bellowsMesh.rotation.x;

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
  }, [lengthMm]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: "radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid rgba(56, 189, 248, 0.2)",
      }}
    >
      {/* 도면 규격 오버레이 정보 뱃지 */}
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
        <div style={{ fontWeight: "bold", color: "#38bdf8", marginBottom: "2px" }}>
          40A FLEXIBLE JOINT
        </div>
        <div>Standard Spec: L = {lengthMm}mm</div>
        <div>Flange: 4-Bolt Pattern (PCD)</div>
      </div>

      <div ref={containerRef} style={{ width: "100%", height: "100%", flex: 1 }} />
    </div>
  );
}