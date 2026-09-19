import { useEffect, useRef } from "react";
import * as THREE from "three";

interface FireSimViewerProps {
  selectedModelPath: string;
  selectedPartId?: string; // 선택된 부품 ID
  onSelectEquipment: () => void;
}

export default function FireSimViewer({
  selectedPartId,
  onSelectEquipment,
}: FireSimViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(
      50,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000,
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // 재질 정의
    const pumpBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      metalness: 0.5,
      roughness: 0.3,
    });
    const motorMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.4,
      roughness: 0.4,
    });
    const basePlateMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
    });
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0xc5221f,
      metalness: 0.5,
      roughness: 0.3,
    });
    const valveMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.2,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.8,
      roughness: 0.2,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
    });

    const systemGroup = new THREE.Group();

    // 그룹별 파츠 정의 (선택에 따라 켜고 끄기 위함)
    const pumpGroup = new THREE.Group();
    const flowMeterGroup = new THREE.Group();
    const reliefGroup = new THREE.Group();
    const checkValveGroup = new THREE.Group();
    const pressureGaugeGroup = new THREE.Group();

    // 1. 주펌프 (Pump) 세트
    const basePlate = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.2, 2),
      basePlateMat,
    );
    basePlate.position.set(0, -2.1, 0);
    pumpGroup.add(basePlate);

    const pumpCasing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 0.8, 32),
      pumpBodyMat,
    );
    pumpCasing.rotation.z = Math.PI / 2;
    pumpCasing.position.set(-1.2, -1.6, 0);
    pumpGroup.add(pumpCasing);

    const motorBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.0, 1.0),
      motorMat,
    );
    motorBody.position.set(0.2, -1.6, 0);
    pumpGroup.add(motorBody);

    const coupling = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.4, 16),
      brassMat,
    );
    coupling.rotation.z = Math.PI / 2;
    coupling.position.set(-0.5, -1.6, 0);
    pumpGroup.add(coupling);

    // 2. 유량계 (Flow Meter) 세트
    const flowBranch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 2.5, 32),
      pipeMat,
    );
    flowBranch.rotation.z = Math.PI / 2;
    flowBranch.position.set(1.0, 1.1, 0);
    flowMeterGroup.add(flowBranch);

    const flowMeterGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 1.0, 32),
      glassMat,
    );
    flowMeterGlass.rotation.z = Math.PI / 2;
    flowMeterGlass.position.set(1.4, 1.1, 0);
    flowMeterGroup.add(flowMeterGlass);

    // 3. 릴리프 밸브 (Relief Valve) 세트
    const reliefBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.6, 16),
      brassMat,
    );
    reliefBody.position.set(-0.3, 1.5, 0);
    reliefGroup.add(reliefBody);
    const reliefCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.2, 16),
      pipeMat,
    );
    reliefCap.position.set(-0.3, 1.85, 0);
    reliefGroup.add(reliefCap);

    // 4. 체크 밸브 (Check Valve) 세트 (배관 중간에 위치한 밸브 형상)
    const checkValveBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.7, 0.7),
      valveMat,
    );
    checkValveBody.position.set(-1.2, 0.4, 0);
    checkValveGroup.add(checkValveBody);
    const checkValveCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16),
      pipeMat,
    );
    checkValveCap.position.set(-1.2, 0.8, 0);
    checkValveGroup.add(checkValveCap);

    // 5. 압력계 (Pressure Gauge) 세트
    const gaugeBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.1, 32),
      brassMat,
    );
    gaugeBody.rotation.x = Math.PI / 2;
    gaugeBody.position.set(-0.8, 1.1, 0.3);
    pressureGaugeGroup.add(gaugeBody);
    const gaugeFace = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.05, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    gaugeFace.rotation.x = Math.PI / 2;
    gaugeFace.position.set(-0.8, 1.1, 0.36);
    pressureGaugeGroup.add(gaugeFace);

    // 전체 시스템에 그룹 추가
    systemGroup.add(pumpGroup);
    systemGroup.add(flowMeterGroup);
    systemGroup.add(reliefGroup);
    systemGroup.add(checkValveGroup);
    systemGroup.add(pressureGaugeGroup);
    scene.add(systemGroup);

    // 선택된 부품에 따라 가시성 및 카메라 포커스 조절
    if (selectedPartId) {
      pumpGroup.visible = selectedPartId === "pump";
      flowMeterGroup.visible = selectedPartId === "flow-meter";
      reliefGroup.visible = selectedPartId === "relief-valve";
      checkValveGroup.visible = selectedPartId === "check-valve";
      pressureGaugeGroup.visible = selectedPartId === "pressure-gauge";

      // 부품별 맞춤 카메라 위치 및 줌 조정
      if (selectedPartId === "pump") {
        camera.position.set(0, -1, 6);
      } else if (selectedPartId === "flow-meter") {
        camera.position.set(1.2, 1.1, 4);
      } else if (selectedPartId === "relief-valve") {
        camera.position.set(-0.3, 1.6, 3);
      } else if (selectedPartId === "check-valve") {
        camera.position.set(-1.2, 0.4, 3);
      } else if (selectedPartId === "pressure-gauge") {
        camera.position.set(-0.8, 1.1, 2.5);
      } else {
        camera.position.set(0, 1, 9);
      }
    } else {
      camera.position.set(0, 1, 9);
    }

    // 마우스 클릭 인터랙션
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(systemGroup.children, true);

      if (intersects.length > 0) {
        onSelectEquipment();
      }
    };

    currentMount.addEventListener("click", handleCanvasClick);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(currentMount);

    return () => {
      resizeObserver.disconnect();
      currentMount.removeEventListener("click", handleCanvasClick);
      cancelAnimationFrame(animationFrameId);

      // 💡 WebGL 렌더러 리소스 명시적 해제 추가
      renderer.dispose();
      renderer.forceContextLoss(); // WebGL 컨텍스트 강제 소멸

      // 3. 캔버스 DOM 요소 완전 제거
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }

      if (currentMount) {
        currentMount.innerHTML = "";
      }
    };
  }, [selectedPartId, onSelectEquipment]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        cursor: "pointer",
      }}
    /> 
  );
}
