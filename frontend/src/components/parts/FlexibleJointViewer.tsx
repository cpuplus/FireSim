// src/components/parts/FlexibleJointViewer.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// DB에서 받아오는 규격 스펙 인터페이스
export interface FlexibleJointSpec {
  piperDiameter?: number;
  outerDiameter?: number;
  flangeThickness?: number;
  pitchCircleDiameter?: number;
  boltHoleSpec?: string;
  length?: number;
}

// 뷰어가 부모로부터 받을 Props
export interface FlexibleJointViewerProps {
  partId?: string;
  orientation?: "horizontal" | "vertical";
  onPartClick?: (partName: string) => void;
  spec?: FlexibleJointSpec | null;
}

/**
 * 전달받은 스펙을 바탕으로 플렉시블 조인트 3D 모델을 생성하는 함수
 */
export function buildFlexibleJointGroup(
  dbSpec?: FlexibleJointSpec | null,
  orientation: "horizontal" | "vertical" = "horizontal",
): THREE.Group {
  const jointGroup = new THREE.Group();
  jointGroup.name = "flexible-joint-dynamic";

  const piperDiameter = dbSpec?.piperDiameter ?? 40;
  const outerDiameter = dbSpec?.outerDiameter ?? 135;
  const flangeThickness = dbSpec?.flangeThickness ?? 16;
  const pitchCircleDiameter = dbSpec?.pitchCircleDiameter ?? 105;
  const boltHoleSpec = dbSpec?.boltHoleSpec ?? "4-ø19";
  const length = dbSpec?.length ?? 230;

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

  const pipeRadius = piperDiameter / 2;
  const flangeOuterRadius = outerDiameter / 2;
  const boltCircleRadius = pitchCircleDiameter / 2;

  const parseBoltSpec = (specStr: string) => {
    if (!specStr) return { count: 4, holeRadius: 4 };
    const parts = specStr.split("-");
    const count = parseInt(parts[0]) || 4;
    const holeMatch = parts[1] ? parts[1].replace(/[^0-9.]/g, "") : "8";
    const holeRadius = parseFloat(holeMatch) / 2 || 4;
    return { count, holeRadius };
  };

  const { count: boltCount, holeRadius: boltHoleRadius } =
    parseBoltSpec(boltHoleSpec);

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
    flangeExtrudeSettings,
  );
  flangeGeometry.center();

  const snapMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const isVertical = orientation === "vertical";

  // 첫 번째 플랜지
  const firstFlange = new THREE.Mesh(flangeGeometry, flangeMat);
  firstFlange.name = isVertical ? "플랜지 (하단)" : "플랜지 (좌측)";
  if (isVertical) {
    firstFlange.rotation.x = Math.PI / 2;
    firstFlange.position.set(0, -length / 2 + flangeThickness / 2, 0);
  } else {
    firstFlange.rotation.y = Math.PI / 2;
    firstFlange.position.set(-length / 2 + flangeThickness / 2, 0, 0);
  }
  firstFlange.castShadow = true;
  jointGroup.add(firstFlange);

  const firstSnapSurface = new THREE.Mesh(
    new THREE.CircleGeometry(flangeOuterRadius - 5, 32),
    snapMat,
  );
  firstSnapSurface.name = isVertical
    ? "스냅 서피스 (하단)"
    : "스냅 서피스 (좌측)";
  if (isVertical) {
    firstSnapSurface.rotation.x = -Math.PI / 2;
    firstSnapSurface.position.set(0, -length / 2 - 1.1, 0);
  } else {
    firstSnapSurface.rotation.y = -Math.PI / 2;
    firstSnapSurface.position.set(-length / 2 - 1.1, 0, 0);
  }
  jointGroup.add(firstSnapSurface);

  for (let i = 0; i < boltCount; i++) {
    const angle = (i / boltCount) * Math.PI * 2 + Math.PI / 4;
    const p1 = Math.cos(angle) * boltCircleRadius;
    const p2 = Math.sin(angle) * boltCircleRadius;
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(
        boltHoleRadius - 0.5,
        boltHoleRadius - 0.5,
        flangeThickness + 8,
        16,
      ),
      boltMat,
    );
    bolt.name = `볼트 (${i + 1})`;
    if (isVertical) {
      bolt.position.set(p1, -length / 2 + flangeThickness / 2, p2);
    } else {
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(-length / 2 + flangeThickness / 2, p2, p1);
    }
    jointGroup.add(bolt);
  }

  // 두 번째 플랜지
  const secondFlange = new THREE.Mesh(flangeGeometry, flangeMat);
  secondFlange.name = isVertical ? "플랜지 (상단)" : "플랜지 (우측)";
  if (isVertical) {
    secondFlange.rotation.x = Math.PI / 2;
    secondFlange.position.set(0, length / 2 - flangeThickness / 2, 0);
  } else {
    secondFlange.rotation.y = Math.PI / 2;
    secondFlange.position.set(length / 2 - flangeThickness / 2, 0, 0);
  }
  secondFlange.castShadow = true;
  jointGroup.add(secondFlange);

  const secondSnapSurface = new THREE.Mesh(
    new THREE.CircleGeometry(flangeOuterRadius - 5, 32),
    snapMat,
  );
  secondSnapSurface.name = isVertical
    ? "스냅 서피스 (상단)"
    : "스냅 서피스 (우측)";
  if (isVertical) {
    secondSnapSurface.rotation.x = Math.PI / 2;
    secondSnapSurface.position.set(0, length / 2 + 1.1, 0);
  } else {
    secondSnapSurface.rotation.y = -Math.PI / 2;
    secondSnapSurface.position.set(length / 2 + 1.1, 0, 0);
  }
  jointGroup.add(secondSnapSurface);

  for (let i = 0; i < boltCount; i++) {
    const angle = (i / boltCount) * Math.PI * 2 + Math.PI / 4;
    const p1 = Math.cos(angle) * boltCircleRadius;
    const p2 = Math.sin(angle) * boltCircleRadius;
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(
        boltHoleRadius - 0.5,
        boltHoleRadius - 0.5,
        flangeThickness + 8,
        16,
      ),
      boltMat,
    );
    bolt.name = `볼트 (${i + 1 + boltCount})`;
    if (isVertical) {
      bolt.position.set(p1, length / 2 - flangeThickness / 2, p2);
    } else {
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(length / 2 - flangeThickness / 2, p2, p1);
    }
    jointGroup.add(bolt);
  }

  // 벨로우즈 및 부속품
  const bellowsLength = Math.max(10, length - flangeThickness * 2 - 20);
  const bellowsRadius = pipeRadius * 1.3;

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
  bellowsMesh.name = "벨로우즈 본체";
  jointGroup.add(bellowsMesh);

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
  braidMesh.name = "외부 그물망";
  jointGroup.add(braidMesh);

  ([-bellowsLength / 2 - 5, bellowsLength / 2 + 5] as number[]).forEach(
    (pos, idx) => {
      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(pipeRadius + 2, bellowsRadius + 2, 12, 32),
        rubberCollarMat,
      );
      collar.name = `실링 칼라 (${idx + 1})`;
      if (isVertical) {
        collar.position.set(0, pos, 0);
      } else {
        collar.rotation.z = Math.PI / 2;
        collar.position.set(pos, 0, 0);
      }
      jointGroup.add(collar);
    },
  );

  // 💡 바운딩 박스를 계산하여 최하단이 정확히 바닥(Y=0)에 오도록 자동 정렬
  jointGroup.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(jointGroup);
  jointGroup.position.y -= box.min.y;

  return jointGroup;
}

/**
 * 뷰어 메인 컴포넌트
 */
export default function FlexibleJointViewer({
  partId,
  orientation = "horizontal",
  onPartClick,
  spec,
}: FlexibleJointViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f19);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      2000,
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(300, 500, 300);
    scene.add(dirLight);

    // 그리드를 바닥 레벨(Y=0)에 배치
    const gridHelper = new THREE.GridHelper(800, 30, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 3D 모델 생성 및 씬에 추가
    const jointGroup = buildFlexibleJointGroup(spec, orientation);
    scene.add(jointGroup);

    // 💡 1. 모델의 실제 바운딩 박스와 중심점 계산 후 동적 센터링 적용
    const box = new THREE.Box3().setFromObject(jointGroup);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // 💡 2. 카메라 타겟을 모델 중앙으로 설정
    controls.target.copy(center);

    // 💡 3. 카메라 위치를 중앙 기준 상대 좌표로 배치 (일관된 앵글 유지)
    camera.position.set(
      center.x + 400,
      center.y + 170,
      center.z + 400
    );
    camera.lookAt(center);
    controls.update();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(jointGroup.children, true);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object as THREE.Mesh;
        if (onPartClick) onPartClick(clickedObject.name || "알 수 없는 부품");
      }
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

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
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();

      scene.traverse((object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat: any) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });

      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [spec, orientation, onPartClick]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}