// src/components/parts/CrossViewer.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSG } from "three-csg-ts";

export interface CrossSpec {
  nominalSizeMain?: string;
  nominalSizeCross?: string;
  outerDiameterMain?: number;
  outerDiameterCross?: number;
  thickness?: number;
  length?: number;
  material?: string;
}

export interface CrossViewerProps {
  partId?: string;
  orientation?: "horizontal" | "vertical";
  onPartClick?: (partName: string) => void;
  spec?: CrossSpec | null;
}

export function buildCrossGroup(
  dbSpec?: CrossSpec | null,
  _orientation: "horizontal" | "vertical" = "horizontal",
  partId?: string,
): THREE.Group {
  console.log("CrossViewer에 전달된 spec 데이터:", dbSpec);
  console.log("받은 partId:", partId);

  const crossGroup = new THREE.Group();
  crossGroup.name = "cross-dynamic";

  const outerDiameterMain = dbSpec?.outerDiameterMain ?? 63.5;
  const outerDiameterCross = dbSpec?.outerDiameterCross ?? 46.5;
  const thickness = dbSpec?.thickness ?? 3.5;

  const mainLength = outerDiameterMain * 3;
  const crossLength = outerDiameterCross * 3;

  const collarLength = 10; // 끝단 보강 테두리 길이 (10mm)
  const mainArmLength = mainLength / 2 - collarLength;
  const crossArmLength = crossLength / 2 - collarLength;

  const outerRadiusMain = outerDiameterMain / 2;
  const innerRadiusMain = Math.max(0, outerRadiusMain - thickness);

  const outerRadiusCross = outerDiameterCross / 2;
  const innerRadiusCross = Math.max(0, outerRadiusCross - thickness);

  const collarOuterRadiusMain = outerRadiusMain * 1.18;
  const collarOuterRadiusCross = outerRadiusCross * 1.18;

  if (outerRadiusMain <= 0 || outerRadiusCross <= 0 || thickness <= 0) {
    return crossGroup;
  }

  // 선명하고 밝은 고광택 적색 재질 (#CE2028)
  const fittingMat = new THREE.MeshStandardMaterial({
    color: 0xce2028,
    roughness: 0.2,
    metalness: 0.3,
    side: THREE.DoubleSide,
  });

  const snapMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  // 단면 프로파일
  const createSolidMainShape = () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadiusMain, 0, Math.PI * 2, false);
    return shape;
  };

  const createSolidCrossShape = () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadiusCross, 0, Math.PI * 2, false);
    return shape;
  };

  const createHoleMainShape = () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, innerRadiusMain, 0, Math.PI * 2, false);
    return shape;
  };

  const createHoleCrossShape = () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, innerRadiusCross, 0, Math.PI * 2, false);
    return shape;
  };

  const createMainCollarShape = () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, collarOuterRadiusMain, 0, Math.PI * 2, false);
    const innerHole = new THREE.Path();
    innerHole.absarc(0, 0, innerRadiusMain, 0, Math.PI * 2, true);
    shape.holes.push(innerHole);
    return shape;
  };

  const createCrossCollarShape = () => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, collarOuterRadiusCross, 0, Math.PI * 2, false);
    const innerHole = new THREE.Path();
    innerHole.absarc(0, 0, innerRadiusCross, 0, Math.PI * 2, true);
    shape.holes.push(innerHole);
    return shape;
  };

  // 지오메트리 생성
  const fullMainLength = mainArmLength * 2;
  const fullCrossLength = crossArmLength * 2;

  const solidMainGeo = new THREE.ExtrudeGeometry(createSolidMainShape(), {
    depth: fullMainLength,
    bevelEnabled: false,
    steps: 1,
  });

  const solidCrossGeo = new THREE.ExtrudeGeometry(createSolidCrossShape(), {
    depth: fullCrossLength,
    bevelEnabled: false,
    steps: 1,
  });

  const holeMainGeo = new THREE.ExtrudeGeometry(createHoleMainShape(), {
    depth: fullMainLength + 20,
    bevelEnabled: false,
    steps: 1,
  });

  const holeCrossGeo = new THREE.ExtrudeGeometry(createHoleCrossShape(), {
    depth: fullCrossLength + 20,
    bevelEnabled: false,
    steps: 1,
  });

  const mainCollarGeo = new THREE.ExtrudeGeometry(createMainCollarShape(), {
    depth: collarLength,
    bevelEnabled: false,
    steps: 1,
  });

  const crossCollarGeo = new THREE.ExtrudeGeometry(createCrossCollarShape(), {
    depth: collarLength,
    bevelEnabled: false,
    steps: 1,
  });

  // 1. 본체 CSG 연산
  const mainBodyMesh = new THREE.Mesh(solidMainGeo);
  mainBodyMesh.position.set(0, 0, -fullMainLength / 2);
  mainBodyMesh.updateMatrix();

  const crossBodyMesh = new THREE.Mesh(solidCrossGeo);
  crossBodyMesh.rotation.x = Math.PI / 2;
  crossBodyMesh.position.set(0, fullCrossLength / 2, 0);
  crossBodyMesh.updateMatrix();

  const holeMainMesh = new THREE.Mesh(holeMainGeo);
  holeMainMesh.position.set(0, 0, -(fullMainLength + 20) / 2);
  holeMainMesh.updateMatrix();

  const holeCrossMesh = new THREE.Mesh(holeCrossGeo);
  holeCrossMesh.rotation.x = Math.PI / 2;
  holeCrossMesh.position.set(0, (fullCrossLength + 20) / 2, 0);
  holeCrossMesh.updateMatrix();

  try {
    let csgBody = CSG.fromMesh(mainBodyMesh).union(CSG.fromMesh(crossBodyMesh));
    let csgHoles = CSG.fromMesh(holeMainMesh).union(
      CSG.fromMesh(holeCrossMesh),
    );
    let csgResult = csgBody.subtract(csgHoles);

    const finalBodyMesh = CSG.toMesh(csgResult, new THREE.Matrix4());
    finalBodyMesh.material = fittingMat;
    finalBodyMesh.name = "크로스 본체 (완벽 관통)";
    finalBodyMesh.castShadow = true;
    finalBodyMesh.receiveShadow = true;
    crossGroup.add(finalBodyMesh);
  } catch (error) {
    console.error("CSG 연산 중 오류 발생:", error);
  }

  // 2. 보강 테두리(Collar)
  const collarMainFront = new THREE.Mesh(mainCollarGeo, fittingMat);
  collarMainFront.name = "크로스 메인 전면 테두리";
  collarMainFront.position.set(0, 0, mainArmLength);
  crossGroup.add(collarMainFront);

  const collarMainBack = new THREE.Mesh(mainCollarGeo, fittingMat);
  collarMainBack.name = "크로스 메인 후면 테두리";
  collarMainBack.position.set(0, 0, -mainArmLength - collarLength);
  crossGroup.add(collarMainBack);

  const collarCrossTop = new THREE.Mesh(crossCollarGeo, fittingMat);
  collarCrossTop.name = "크로스 분기 상단 테두리";
  collarCrossTop.rotation.x = -Math.PI / 2;
  collarCrossTop.position.set(0, crossArmLength, 0);
  crossGroup.add(collarCrossTop);

  const collarCrossBottom = new THREE.Mesh(crossCollarGeo, fittingMat);
  collarCrossBottom.name = "크로스 분기 하단 테두리";
  collarCrossBottom.rotation.x = -Math.PI / 2;
  collarCrossBottom.position.set(0, -crossArmLength - collarLength, 0);
  crossGroup.add(collarCrossBottom);

  // 3. 스냅 서피스
  const snapSurfaceGeoMain = new THREE.CircleGeometry(outerRadiusMain, 32);
  const snapSurfaceGeoCross = new THREE.CircleGeometry(outerRadiusCross, 32);

  const snapMainFront = new THREE.Mesh(snapSurfaceGeoMain, snapMat);
  snapMainFront.name = "스냅 서피스 (메인 전면)";
  snapMainFront.position.set(0, 0, mainArmLength + collarLength + 0.5);
  crossGroup.add(snapMainFront);

  const snapMainBack = new THREE.Mesh(snapSurfaceGeoMain, snapMat);
  snapMainBack.name = "스냅 서피스 (메인 후면)";
  snapMainBack.rotation.y = Math.PI;
  snapMainBack.position.set(0, 0, -mainArmLength - collarLength - 0.5);
  crossGroup.add(snapMainBack);

  const snapCrossTop = new THREE.Mesh(snapSurfaceGeoCross, snapMat);
  snapCrossTop.name = "스냅 서피스 (분기 상단)";
  snapCrossTop.rotation.x = -Math.PI / 2;
  snapCrossTop.position.set(0, crossArmLength + collarLength + 0.5, 0);
  crossGroup.add(snapCrossTop);

  const snapCrossBottom = new THREE.Mesh(snapSurfaceGeoCross, snapMat);
  snapCrossBottom.name = "스냅 서피스 (분기 하단)";
  snapCrossBottom.rotation.x = Math.PI / 2;
  snapCrossBottom.position.set(0, -crossArmLength - collarLength - 0.5, 0);
  crossGroup.add(snapCrossBottom);

  // 전체 그룹 X축 90도 회전 및 바닥 그리드(Y=0) 레벨 높이 맞춤
  crossGroup.rotation.x = Math.PI / 2;
  crossGroup.position.y = mainLength / 2;

  return crossGroup;
}

export default function CrossViewer({
  partId,
  orientation = "horizontal",
  onPartClick,
  spec,
}: CrossViewerProps) {
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

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const crossGroup = buildCrossGroup(spec, orientation, partId);
    scene.add(crossGroup);

    // 카메라 위치 및 컨트롤 목표점을 올라간 모델 중심으로 설정
    const centerY = crossGroup.position.y;
    camera.position.set(400, 250, 400);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, centerY, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(300, 500, 300);
    scene.add(dirLight);

    // 그리드를 바닥 레벨(Y=0)에 배치
    const gridHelper = new THREE.GridHelper(600, 30, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(crossGroup.children, true);

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
