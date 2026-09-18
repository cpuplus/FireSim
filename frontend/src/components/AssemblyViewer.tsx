// src/components/AssemblyViewer.tsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { buildPumpGroup } from "./parts/Pump_024_45";
import { buildFlexibleJointGroup } from "./parts/FlexibleJoint_40A";

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
  const jointRefs = useRef<Map<string, THREE.Group>>(new Map());
  const pumpRef = useRef<THREE.Group | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<string>("1단계: 조립할 [플렉시블 조인트 플랜지]를 마우스로 클릭하세요.");
  
  const selectedSourceRef = useRef<{ 
    instanceId: string; 
    group: THREE.Group; 
    flangeMesh: THREE.Mesh 
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 1, 5000);
    camera.position.set(300, 350, 550);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

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

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.target.set(100, 150, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(300, 600, 400);
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(1000, 20, 0x38bdf8, 0x334155);
    scene.add(gridHelper);

    // 1. 펌프 생성
    const pumpGroup = buildPumpGroup();
    pumpGroup.position.set(0, 35, 0);
    pumpGroup.rotation.y = -Math.PI / 2;
    scene.add(pumpGroup);
    pumpRef.current = pumpGroup;

    jointRefs.current.clear();

    // 2. 동적 부품 생성 (TransformControls 제거됨)
    addedParts.forEach((part, index) => {
      const jointGroup = buildFlexibleJointGroup(230);
      jointGroup.position.set(250 + index * 80, 150, 120);
      jointGroup.rotation.set(0, 0, Math.PI / 2);

      scene.add(jointGroup);
      jointRefs.current.set(part.instanceId, jointGroup);
    });

    // 🖱️ 마우스 호버 이벤트
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const hitObject = intersects[0].object as THREE.Mesh;
        const name = hitObject.name.toLowerCase();

        const isConnectable = name.includes("flange") || name.includes("screw") || name.includes("thread");

        if (isConnectable) {
          renderer.domElement.style.cursor = "pointer";
          outlinePass.selectedObjects = [hitObject]; 
          return;
        }
      }

      // 선택된 소스가 있으면 소스 플랜지는 계속 아웃라인 유지
      if (selectedSourceRef.current) {
        outlinePass.selectedObjects = [selectedSourceRef.current.flangeMesh];
      } else {
        outlinePass.selectedObjects = []; 
      }
      renderer.domElement.style.cursor = "default";
    };

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const hitObject = intersects[0].object as THREE.Mesh;
        const name = hitObject.name.toLowerCase();

        const isConnectable = name.includes("flange") || name.includes("screw") || name.includes("thread");
        if (!isConnectable) return;

        // 1. 조인트 플랜지 클릭 체크
        let clickedJointPart: AddedPart | null = null;
        let clickedJointGroup: THREE.Group | null = null;

        addedParts.forEach((part) => {
          const group = jointRefs.current.get(part.instanceId);
          if (group) {
            let curr: THREE.Object3D | null = hitObject;
            while (curr) {
              if (curr === group) {
                clickedJointPart = part;
                clickedJointGroup = group;
                break;
              }
              curr = curr.parent;
            }
          }
        });

        if (clickedJointPart && clickedJointGroup) {
          selectedSourceRef.current = { 
            instanceId: (clickedJointPart as AddedPart).instanceId, 
            group: clickedJointGroup, 
            flangeMesh: hitObject 
          };
          outlinePass.selectedObjects = [hitObject];
          setConnectionStatus(`✔ 조인트 플랜지 선택됨! 연결할 [펌프 플랜지]를 클릭하세요.`);
          return;
        }

        // 2. 펌프 플랜지 클릭 체크
        let isPumpClicked = false;
        if (pumpRef.current) {
          let curr: THREE.Object3D | null = hitObject;
          while (curr) {
            if (curr === pumpRef.current) {
              isPumpClicked = true;
              break;
            }
            curr = curr.parent;
          }
        }

        if (isPumpClicked) {
          if (selectedSourceRef.current) {
            const { group: sourceGroup, flangeMesh: sourceFlange } = selectedSourceRef.current;

            scene.updateMatrixWorld(true);
            pumpRef.current?.updateMatrixWorld(true);
            sourceGroup.updateMatrixWorld(true);
            hitObject.updateMatrixWorld(true);

            // 펌프 플랜지의 타겟 월드 매트릭스
            const targetMatrix = hitObject.matrixWorld.clone();

            // 💡 플랜지 겹침 방지: 조인트 플랜지가 펌프 플랜지 표면에 정확히 맞닿도록 Z축 방향 오프셋 적용
            // 방향이 안쪽으로 파고든다면 부호(-)를 조정하거나 값을 변경하세요.
            const thicknessOffset = 5; // 필요시 수치 조절
            const offsetMatrix = new THREE.Matrix4().makeTranslation(0, 0, thicknessOffset);
            const adjustedTargetMatrix = targetMatrix.clone().multiply(offsetMatrix);

            // 조인트 그룹 기준 소스 플랜지의 로컬 매트릭스 계산
            const mWorldToGroup = sourceGroup.matrixWorld.clone().invert();
            const flangeLocalMatrix = sourceFlange.matrixWorld.clone().premultiply(mWorldToGroup);

            // 조인트 그룹의 새로운 월드 매트릭스 산출
            const invFlangeLocal = flangeLocalMatrix.clone().invert();
            const newGroupMatrix = adjustedTargetMatrix.clone().multiply(invFlangeLocal);

            // 부모 좌표계(Scene) 반영하여 조인트 그룹 위치/회전 적용
            if (sourceGroup.parent) {
              const parentInv = sourceGroup.parent.matrixWorld.clone().invert();
              sourceGroup.matrix.copy(parentInv.multiply(newGroupMatrix));
            } else {
              sourceGroup.matrix.copy(newGroupMatrix);
            }
            sourceGroup.matrix.decompose(sourceGroup.position, sourceGroup.quaternion, sourceGroup.scale);

            setConnectionStatus(`🎉 찰칵! 회전과 간격이 맞춰져 완벽하게 조립되었습니다.`);
            selectedSourceRef.current = null;
            outlinePass.selectedObjects = [];
          } else {
            setConnectionStatus(`⚠️ 경고: 먼저 [플렉시블 조인트 플랜지]를 클릭하여 선택해주세요.`);
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
  }, [addedParts]);

  const handleSubmitInspection = () => {
    if (jointRefs.current.size === 0) {
      alert("조립할 부품이 없습니다. 부품을 추가해주세요.");
      return;
    }
    onScoreCalculated(100);
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
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

      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 20,
        }}
      >
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