// src/components/parts/SliponFlangeViewer.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// DB에서 받아오는 슬립온 플랜지 규격 스펙 인터페이스
export interface SliponFlangeSpec {
  innerDiameter?: number;
  outerDiameter?: number;
  thickness?: number;
  pitchCircleDiameter?: number;
  numberOfHoles?: number;
  holeDiameter?: number;
  nominalBoltSize?: string;
}

// 뷰어가 부모로부터 받을 Props
export interface SliponFlangeViewerProps {
  partId?: string;
  orientation?: "horizontal" | "vertical";
  onPartClick?: (partName: string) => void;
  spec?: SliponFlangeSpec | null;
}

/**
 * 전달받은 스펙을 바탕으로 슬립온 플랜지(SOP) 3D 모델을 생성하는 함수
 */
export function buildSliponFlangeGroup(
  dbSpec?: SliponFlangeSpec | null,
  orientation: "horizontal" | "vertical" = "horizontal",
): THREE.Group {
  const flangeGroup = new THREE.Group();
  flangeGroup.name = "slipon-flange-dynamic";

  const innerDiameter = dbSpec?.innerDiameter ?? 0;
  const outerDiameter = dbSpec?.outerDiameter ?? 0;
  const thickness = dbSpec?.thickness ?? 0;
  const pitchCircleDiameter = dbSpec?.pitchCircleDiameter ?? 0;
  const numberOfHoles = dbSpec?.numberOfHoles ?? 0;
  const holeDiameter = dbSpec?.holeDiameter ?? 0;

  if (outerDiameter <= 0 || thickness <= 0 || numberOfHoles <= 0) {
    return flangeGroup;
  }

  const flangeMat = new THREE.MeshStandardMaterial({
    color: 0xce2028,
    roughness: 0.2,
    metalness: 0.3,
    side: THREE.DoubleSide,
  });
  const boltMat = new THREE.MeshStandardMaterial({
    color: 0xce2028,
    roughness: 0.2,
    metalness: 0.3,
  });

  const flangeOuterRadius = outerDiameter / 2;
  const innerRadius = innerDiameter / 2;
  const boltCircleRadius = pitchCircleDiameter / 2;
  const boltHoleRadius = holeDiameter / 2;
  const boltCount = numberOfHoles;

  // 플랜지 외경 및 볼트 홀 모양 정의
  const createFlangeShape = () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, flangeOuterRadius, 0, Math.PI * 2, false);

    if (innerRadius > 0) {
      const centerHole = new THREE.Path();
      centerHole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
      shape.holes.push(centerHole);
    }

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

  const flangeExtrudeSettings = {
    depth: thickness,
    bevelEnabled: false,
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

  // 플랜지 본체 메쉬 생성
  const flangeMesh = new THREE.Mesh(flangeGeometry, flangeMat);
  flangeMesh.name = "슬립온 플랜지 본체";
  flangeMesh.castShadow = true;
  if (isVertical) {
    flangeMesh.rotation.x = Math.PI / 2;
  } else {
    flangeMesh.rotation.y = Math.PI / 2;
  }
  flangeGroup.add(flangeMesh);

  // 스냅 서피스 생성
  const snapSurface = new THREE.Mesh(
    new THREE.CircleGeometry(Math.max(0, flangeOuterRadius - 5), 32),
    snapMat,
  );
  snapSurface.name = "스냅 서피스";
  if (isVertical) {
    snapSurface.rotation.x = -Math.PI / 2;
    snapSurface.position.set(0, thickness / 2 + 1.1, 0);
  } else {
    snapSurface.rotation.y = -Math.PI / 2;
    snapSurface.position.set(thickness / 2 + 1.1, 0, 0);
  }
  flangeGroup.add(snapSurface);

  // 볼트 결합 생성
  for (let i = 0; i < boltCount; i++) {
    const angle = (i / boltCount) * Math.PI * 2;
    const p1 = Math.cos(angle) * boltCircleRadius;
    const p2 = Math.sin(angle) * boltCircleRadius;
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(
        Math.max(0, boltHoleRadius - 0.5),
        Math.max(0, boltHoleRadius - 0.5),
        thickness + 12,
        16,
      ),
      boltMat,
    );
    bolt.name = `볼트 (${i + 1})`;
    if (isVertical) {
      bolt.position.set(p1, 0, p2);
    } else {
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(0, p2, p1);
    }
    flangeGroup.add(bolt);
  }

  // 바운딩 박스를 계산하여 최하단이 정확히 바닥(Y=0)에 오도록 자동 정렬
  flangeGroup.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(flangeGroup);
  flangeGroup.position.y -= box.min.y;

  return flangeGroup;
}

/**
 * 뷰어 메인 컴포넌트
 */
export default function SliponFlangeViewer({
  orientation = "horizontal",
  onPartClick,
  spec,
}: SliponFlangeViewerProps) {
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
    camera.position.set(400, 250, 400);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 80, 0); // 모델 중앙을 바라보도록 설정

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(300, 500, 300);
    scene.add(dirLight);

    // 그리드를 바닥 레벨(Y=0)에 배치
    const gridHelper = new THREE.GridHelper(600, 30, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 전달된 spec 데이터를 바탕으로 3D 그룹 생성
    const flangeGroup = buildSliponFlangeGroup(spec, orientation);
    scene.add(flangeGroup);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(flangeGroup.children, true);

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
