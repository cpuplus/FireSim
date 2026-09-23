// src/components/parts/PipeViewer.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface PipeSpec {
  outerDiameter?: number;
  thickness?: number;
  length?: number;
  materialType?: "steel" | "cpvc";
  material?: "steel" | "cpvc";
  type?: "steel" | "cpvc";
  name?: string;
}

export interface PipeViewerProps {
  partId?: string; // 💡 이 partId 값을 활용합니다!
  orientation?: "horizontal" | "vertical";
  onPartClick?: (partName: string) => void;
  spec?: PipeSpec | null;
}

export function buildPipeGroup(
  dbSpec?: PipeSpec | null,
  orientation: "horizontal" | "vertical" = "horizontal",
  partId?: string, // partId 인자 추가
): THREE.Group {
  const pipeGroup = new THREE.Group();
  pipeGroup.name = "pipe-dynamic";

  const outerDiameter = dbSpec?.outerDiameter ?? 48.2;
  const thickness = dbSpec?.thickness ?? 3.58;
  const length = dbSpec?.length ?? 300;

  const lowerPartId = (partId ?? "").toLowerCase();
  const rawMaterial = (
    dbSpec?.materialType ??
    dbSpec?.material ??
    dbSpec?.type ??
    ""
  ).toLowerCase();
  const specName = (dbSpec?.name ?? "").toLowerCase();

  // 💡 2. 'cpvc'가 명시되어 있지 않고, partId나 이름에 'spp', 'steel', '강관', '철' 등이 포함되어 있다면 강관으로 판정
  const isCpvc =
    lowerPartId.includes("cpvc") ||
    rawMaterial.includes("cpvc") ||
    specName.includes("cpvc") ||
    specName.includes("주황");

  const isSteel =
    lowerPartId.includes("spp") ||
    lowerPartId.includes("steel") ||
    lowerPartId.includes("pipe") ||
    rawMaterial.includes("steel") ||
    rawMaterial.includes("spp") ||
    specName.includes("강관") ||
    specName.includes("탄소강");

  // 만약 둘 다 해당하지 않는다면 기본값은 강관(steel)으로 처리 (혹은 필요에 따라 조정 가능)
  const isCpvcFinal = isCpvc && !isSteel;

  if (outerDiameter <= 0 || thickness <= 0) {
    return pipeGroup;
  }

  const outerRadius = outerDiameter / 2;
  const innerRadius = Math.max(0, outerRadius - thickness);

  let pipeMat: THREE.MeshStandardMaterial;

  if (!isCpvcFinal) {
    // ⚙️ 탄소강관 (SPP / KS D 3562 스타일)
    pipeMat = new THREE.MeshStandardMaterial({
      color: 0xce2028, // 💡 선명하고 밝은 고광택 적색 헥스 코드
      roughness: 0.2, // 💡 표면 거칠기를 낮추어 광택(반짝임)을 극대화
      metalness: 0.3, // 💡 금속성 질감을 약간 주어 주변 조명을 반사하도록 설정
      side: THREE.DoubleSide,
    });
  } else {
    // 🍊 소방용 CPVC 배관 스타일: 선명한 주황색
    pipeMat = new THREE.MeshStandardMaterial({
      color: 0xe65c00,
      roughness: 0.35,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
  }

  const snapMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const isVertical = orientation === "vertical";

  const createPipeShape = () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    const innerHole = new THREE.Path();
    innerHole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(innerHole);

    return shape;
  };

  const extrudeSettings = {
    depth: length,
    bevelEnabled: false,
    steps: 1,
  };

  const pipeGeometry = new THREE.ExtrudeGeometry(
    createPipeShape(),
    extrudeSettings,
  );
  pipeGeometry.center();

  const pipeMesh = new THREE.Mesh(pipeGeometry, pipeMat);
  pipeMesh.name = !isCpvcFinal ? "강관(SPP) 파이프 본체" : "CPVC 파이프 본체";
  pipeMesh.castShadow = true;
  pipeMesh.receiveShadow = true;

  if (isVertical) {
    pipeMesh.rotation.x = Math.PI / 2;
  } else {
    pipeMesh.rotation.y = Math.PI / 2;
  }
  pipeGroup.add(pipeMesh);

  const snapSurfaceGeo = new THREE.CircleGeometry(outerRadius, 32);

  const snap1 = new THREE.Mesh(snapSurfaceGeo, snapMat);
  snap1.name = isVertical ? "스냅 서피스 (하단)" : "스냅 서피스 (좌측)";
  if (isVertical) {
    snap1.rotation.x = -Math.PI / 2;
    snap1.position.set(0, -length / 2 - 0.5, 0);
  } else {
    snap1.rotation.y = -Math.PI / 2;
    snap1.position.set(-length / 2 - 0.5, 0, 0);
  }
  pipeGroup.add(snap1);

  const snap2 = new THREE.Mesh(snapSurfaceGeo, snapMat);
  snap2.name = isVertical ? "스냅 서피스 (상단)" : "스냅 서피스 (우측)";
  if (isVertical) {
    snap2.rotation.x = Math.PI / 2;
    snap2.position.set(0, length / 2 + 0.5, 0);
  } else {
    snap2.rotation.y = Math.PI / 2;
    snap2.position.set(length / 2 + 0.5, 0, 0);
  }
  pipeGroup.add(snap2);

  return pipeGroup;
}

export default function PipeViewer({
  partId,
  orientation = "horizontal",
  onPartClick,
  spec,
}: PipeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

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
    controls.target.set(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(300, 500, 300);
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(600, 30, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -60;
    scene.add(gridHelper);

    // 💡 partId를 함께 전달하여 재질을 자동 판별합니다.
    const pipeGroup = buildPipeGroup(spec, orientation, partId);
    scene.add(pipeGroup);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pipeGroup.children, true);

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

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      controls.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [spec, orientation, onPartClick, partId]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
