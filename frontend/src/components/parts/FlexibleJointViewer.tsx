// src/components/parts/FlexibleJointViewer.tsx
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// DB에서 받아오는 규격 스펙 인터페이스
export interface FlexibleJointSpec {
  piperDiameter: number;         
  outerDiameter: number;         
  flangeThickness: number;     
  pitchCircleDiameter: number; 
  boltHoleSpec: string;        
}

// 뷰어가 부모로부터 받을 Props (partId만 받음)
export interface FlexibleJointViewerProps {
  partId: string;                                     
  orientation?: "horizontal" | "vertical";    
  onPartClick?: (partName: string) => void;   
}

/**
 * 실제 DB/API로부터 partId에 해당하는 스펙과 치수를 비동기로 가져오는 함수
 */
async function fetchPartSpecFromDB(partId: string) {
  try {
    // 실제 구축되어 있는 백엔드 API로 요청
    const response = await fetch(`/api/parts/${partId}`);
    
    if (!response.ok) {
      throw new Error(`부품 스펙을 불러오는데 실패했습니다. (상태 코드: ${response.status})`);
    }
    
    const data = await response.json();
    return data; // 서버에서 { spec: {...}, dimensions: {...} } 형태로 반환된다고 가정
  } catch (error) {
    console.error("DB 연동 오류:", error);
    return null;
  }
}

/**
 * 전달받은 스펙과 치수를 바탕으로 플렉시블 조인트 3D 모델을 생성하는 함수
 */
export function buildFlexibleJointGroup(
  dbSpec: FlexibleJointSpec,
  dimensions: { width: number; height: number; depth: number },
  orientation: "horizontal" | "vertical" = "horizontal"
): THREE.Group {
  const jointGroup = new THREE.Group();
  jointGroup.name = "flexible-joint-dynamic";

  const maxDimension = Math.max(dimensions.width, dimensions.height, dimensions.depth);
  // 💡 변수명을 length로 변경
  const length = maxDimension;

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

  const pipeRadius = dbSpec.piperDiameter / 2;
  const flangeOuterRadius = dbSpec.outerDiameter / 2;
  const flangeThickness = dbSpec.flangeThickness;
  const boltCircleRadius = dbSpec.pitchCircleDiameter / 2;

  const parseBoltSpec = (spec: string) => {
    const parts = spec.split("-");
    const count = parseInt(parts[0]) || 4;
    const holeMatch = parts[1] ? parts[1].replace(/[^0-9.]/g, "") : "8";
    const holeRadius = parseFloat(holeMatch) / 2 || 4;
    return { count, holeRadius };
  };

  const { count: boltCount, holeRadius: boltHoleRadius } = parseBoltSpec(dbSpec.boltHoleSpec);

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
    snapMat
  );
  firstSnapSurface.name = isVertical ? "스냅 서피스 (하단)" : "스냅 서피스 (좌측)";
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
      new THREE.CylinderGeometry(boltHoleRadius - 0.5, boltHoleRadius - 0.5, flangeThickness + 8, 16),
      boltMat
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
    snapMat
  );
  secondSnapSurface.name = isVertical ? "스냅 서피스 (상단)" : "스냅 서피스 (우측)";
  if (isVertical) {
    secondSnapSurface.rotation.x = Math.PI / 2;
    secondSnapSurface.position.set(0, length / 2 + 1.1, 0);
  } else {
    secondSnapSurface.rotation.y = Math.PI / 2;
    secondSnapSurface.position.set(length / 2 + 1.1, 0, 0);
  }
  jointGroup.add(secondSnapSurface);

  for (let i = 0; i < boltCount; i++) {
    const angle = (i / boltCount) * Math.PI * 2 + Math.PI / 4;
    const p1 = Math.cos(angle) * boltCircleRadius;
    const p2 = Math.sin(angle) * boltCircleRadius;
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(boltHoleRadius - 0.5, boltHoleRadius - 0.5, flangeThickness + 8, 16),
      boltMat
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

  ([-bellowsLength / 2 - 5, bellowsLength / 2 + 5] as number[]).forEach((pos, idx) => {
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(pipeRadius + 2, bellowsRadius + 2, 12, 32),
      rubberCollarMat
    );
    collar.name = `실링 칼라 (${idx + 1})`;
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
 * 뷰어 메인 컴포넌트
 */
export default function FlexibleJointViewer({
  partId,
  orientation = "horizontal",
  onPartClick,
}: FlexibleJointViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [partData, setPartData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPartSpecFromDB(partId).then((data) => {
      if (isMounted) {
        setPartData(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [partId]);

  useEffect(() => {
    if (loading || !partData || !containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f19);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    camera.position.set(600, 360, 600);

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

    const gridHelper = new THREE.GridHelper(800, 30, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -90;
    scene.add(gridHelper);

    // partData 내부의 spec과 dimensions를 가져와서 3D 모델 생성
    const jointGroup = buildFlexibleJointGroup(partData.spec, partData.dimensions, orientation);
    scene.add(jointGroup);

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
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [loading, partData, orientation, onPartClick]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {loading ? (
        <div style={{ color: "#38bdf8", display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          DB에서 부품 스펙을 불러오는 중...
        </div>
      ) : !partData ? (
        <div style={{ color: "#ef4444", display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          해당 부품의 규격 정보를 찾을 수 없습니다. ({partId})
        </div>
      ) : (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      )}
    </div>
  );
}