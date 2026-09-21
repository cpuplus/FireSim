// src/components/AssemblyViewer.tsx
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { buildPumpGroup } from "./parts/Pump_SMT40_2";
import { buildFlexibleJointGroup } from "./parts/FlexibleJoint_40A";
import FlexibleJointViewer from "../components/parts/FlexibleJointViewer";
import { useAssemblyStore } from "../store/useAssemblyStore";

interface AddedPart {
  id: string;
  name: string;
  instanceId: string;
}

interface AssemblyViewerProps {
  addedParts: AddedPart[];
  onScoreCalculated: (score: number) => void;
}

export default function AssemblyViewer({ addedParts, onScoreCalculated }: AssemblyViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Three.js 핵심 인스턴스들을 Ref로 관리하여 재생성 방지
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const outlinePassRef = useRef<OutlinePass | null>(null);
  
  const jointGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const pumpRef = useRef<THREE.Group | null>(null);

  const { partsState, updatePartTransform } = useAssemblyStore();
  const [connectionStatus, setConnectionStatus] = useState<string>("1단계: 조립할 [조인트의 접합면(스냅 서피스)]을 클릭하세요.");
  
  const selectedSourceRef = useRef<{ 
    instanceId: string; 
    group: THREE.Group; 
    snapMesh: THREE.Mesh 
  } | null>(null);

  // 💡 클로저 문제 해결을 위한 최신 props/state 저장용 Ref
  const addedPartsRef = useRef(addedParts);
  useEffect(() => {
    addedPartsRef.current = addedParts;
  }, [addedParts]);

  const partsStateRef = useRef(partsState);
  useEffect(() => {
    partsStateRef.current = partsState;
  }, [partsState]);

  // ==========================================
  // 1. 3D 씬 초기화 (마운트 시 단 1회 실행)
  // ==========================================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.innerHTML = "";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 1, 5000);
    camera.position.set(300, 350, 550);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const outlinePass = new OutlinePass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      scene,
      camera
    );
    outlinePass.visibleEdgeColor = new THREE.Color("#38bdf8"); 
    outlinePass.hiddenEdgeColor = new THREE.Color("#1e293b");
    outlinePass.edgeStrength = 5.0; 
    outlinePass.edgeGlow = 2.0;    
    composer.addPass(outlinePass);
    composer.addPass(new OutputPass());
    outlinePassRef.current = outlinePass;

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.target.set(100, 150, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(300, 600, 400);
    scene.add(dirLight);

    scene.add(new THREE.GridHelper(1000, 20, 0x38bdf8, 0x334155));

    // 기본 펌프 생성
    const pumpGroup = buildPumpGroup();
    pumpGroup.position.set(0, 0, 0);
    pumpGroup.rotation.y = -Math.PI / 2;
    scene.add(pumpGroup);
    pumpRef.current = pumpGroup;

    // Raycaster 및 이벤트 핸들러
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      if (!rendererRef.current || !outlinePassRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const hitObject = intersects[0].object as THREE.Mesh;
        if (hitObject.name.toLowerCase().includes("snap_surface")) {
          rendererRef.current.domElement.style.cursor = "pointer";
          outlinePassRef.current.selectedObjects = [hitObject]; 
          return;
        }
      }

      if (selectedSourceRef.current) {
        outlinePassRef.current.selectedObjects = [selectedSourceRef.current.snapMesh];
      } else {
        outlinePassRef.current.selectedObjects = []; 
      }
      rendererRef.current.domElement.style.cursor = "default";
    };

    const onClick = (event: MouseEvent) => {
      if (!rendererRef.current || !outlinePassRef.current || !sceneRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

      if (intersects.length > 0) {
        const hitObject = intersects[0].object as THREE.Mesh;
        if (!hitObject.name.toLowerCase().includes("snap_surface")) return;

        let clickedPart: AddedPart | null = null;
        let clickedGroup: THREE.Group | null = null;

        addedPartsRef.current.forEach((part) => {
          const group = jointGroupsRef.current.get(part.instanceId);
          if (group) {
            let curr: THREE.Object3D | null = hitObject;
            while (curr) {
              if (curr === group) {
                clickedPart = part;
                clickedGroup = group;
                break;
              }
              curr = curr.parent;
            }
          }
        });

        // 조인트 선택
        if (clickedPart && clickedGroup) {
          const partData = clickedPart as AddedPart;
          selectedSourceRef.current = { 
            instanceId: partData.instanceId, 
            group: clickedGroup, 
            snapMesh: hitObject 
          };
          outlinePassRef.current.selectedObjects = [hitObject];
          setConnectionStatus(`✔ [${partData.name}] 접합면 선택됨! 펌프의 연결면을 클릭하세요.`);
          return;
        }

        // 펌프 타겟 선택
        let isTargetClicked = false;
        if (pumpRef.current) {
          let curr: THREE.Object3D | null = hitObject;
          while (curr) {
            if (curr === pumpRef.current) {
              isTargetClicked = true;
              break;
            }
            curr = curr.parent;
          }
        }

        if (isTargetClicked) {
          if (selectedSourceRef.current) {
            const { instanceId: sourceId, group: sourceGroup, snapMesh: sourceSnap } = selectedSourceRef.current;

            sceneRef.current.updateMatrixWorld(true);
            pumpRef.current?.updateMatrixWorld(true);
            sourceGroup.updateMatrixWorld(true);
            hitObject.updateMatrixWorld(true);

            const targetMatrix = hitObject.matrixWorld.clone();
            const mWorldToGroup = sourceGroup.matrixWorld.clone().invert();
            const snapLocalMatrix = sourceSnap.matrixWorld.clone().premultiply(mWorldToGroup);

            const invSnapLocal = snapLocalMatrix.clone().invert();
            const newGroupMatrix = targetMatrix.clone().multiply(invSnapLocal);

            if (sourceGroup.parent) {
              const parentInv = sourceGroup.parent.matrixWorld.clone().invert();
              sourceGroup.matrix.copy(parentInv.multiply(newGroupMatrix));
            } else {
              sourceGroup.matrix.copy(newGroupMatrix);
            }
            sourceGroup.matrix.decompose(sourceGroup.position, sourceGroup.quaternion, sourceGroup.scale);

            updatePartTransform(
              sourceId, 
              [sourceGroup.position.x, sourceGroup.position.y, sourceGroup.position.z],
              [sourceGroup.rotation.x, sourceGroup.rotation.y, sourceGroup.rotation.z]
            );

            setConnectionStatus(`🎉 찰칵! 부품이 정확히 조립되었습니다.`);
            selectedSourceRef.current = null;
            outlinePassRef.current.selectedObjects = [];
          } else {
            setConnectionStatus(`⚠️ 경고: 먼저 [조인트의 접합면]을 클릭해 주세요.`);
          }
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousemove", onMouseMove);
    domElement.addEventListener("click", onClick);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      orbitControls.update();
      composer.render();
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      composer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      domElement.removeEventListener("mousemove", onMouseMove);
      domElement.removeEventListener("click", onClick);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      orbitControls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      container.innerHTML = "";
    };
  }, []); // 👈 빈 배열: 씬 생성은 딱 한 번만 수행

  // ==========================================
  // 2. 부품 목록/상태 변경 시 씬 동기화 (최적화 포인트)
  // ==========================================
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentMap = jointGroupsRef.current;
    const activeInstanceIds = new Set(addedParts.map((p) => p.instanceId));

    // 1) 삭제된 부품은 씬에서 제거
    currentMap.forEach((group, instanceId) => {
      if (!activeInstanceIds.has(instanceId)) {
        scene.remove(group);
        currentMap.delete(instanceId);
      }
    });

    // 2) 신규 부품 추가 또는 기존 부품 상태(위치/회전) 업데이트
    addedParts.forEach((part, index) => {
      let group = currentMap.get(part.instanceId);

      if (!group) {
        // 새로 추가된 부품인 경우 3D 객체 생성
        group = buildFlexibleJointGroup(230);
        scene.add(group);
        currentMap.set(part.instanceId, group);
      }

      // 위치 및 회전 적용 (스토어 저장값 또는 기본값)
      const savedState = partsState ? partsState[part.instanceId] : undefined;
      if (savedState) {
        group.position.set(savedState.position[0], savedState.position[1], savedState.position[2]);
        group.rotation.set(savedState.rotation[0], savedState.rotation[1], savedState.rotation[2]);
      } else {
        const defaultPos: [number, number, number] = [250 + (index * 100), 150, 120 + ((index % 2) * 60)];
        const defaultRot: [number, number, number] = [0, 0, Math.PI / 2];
        
        group.position.set(defaultPos[0], defaultPos[1], defaultPos[2]);
        group.rotation.set(defaultRot[0], defaultRot[1], defaultRot[2]);
      }
    });
  }, [addedParts, partsState]);

  const handleSubmitInspection = () => {
    if (jointGroupsRef.current.size === 0) {
      alert("조립할 부품이 없습니다.");
      return;
    }
    onScoreCalculated(100);
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      
      {/* 💡 파일명 표기 뱃지 */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          left: "8px",
          background: "rgba(15, 23, 42, 0.85)",
          color: "#38bdf8",
          padding: "3px 8px",
          borderRadius: "4px",
          fontSize: "11px",
          fontWeight: 600,
          zIndex: 30,
          border: "1px solid rgba(56, 189, 248, 0.3)",
          pointerEvents: "none", // 마우스 클릭이 뒤쪽 캔버스나 버튼으로 통과되도록 설정
        }}
      >
        AssemblyViewer.tsx
      </div>

      {/* 기존 컴포넌트 내부 콘텐츠들... */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          border: "1px solid #38bdf8",
          padding: "10px 18px",
          borderRadius: "8px",
          color: "#38bdf8",
          fontWeight: "bold",
          fontSize: "14px",
          zIndex: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        {connectionStatus}
      </div>

      <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 20 }}>
        <button
          onClick={handleSubmitInspection}
          style={{
            padding: "12px 24px",
            backgroundColor: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          🏆 최종 제출 및 점수 확인
        </button>
      </div>
    </div>
  );
}