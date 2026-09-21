// src/pages/PartManagementPage.tsx
import { useEffect, useState } from "react";
import CategoryPartList from "../components/CategoryPartList";
import FlexibleJointViewer from "../components/parts/FlexibleJointViewer";
//import PipeViewer from "../components/parts/PipeViewer";
//import TeeViewer from "../components/parts/TeeViewer";
//import CrossViewer from "../components/parts/CrossViewer";
import { usePartContext } from "../context/PartContext";

// 백엔드 PartsController.cs 응답 데이터 규격
interface PartDetailResponse {
  partId: string;
  partName: string;
  categoryId: string;
  groupName: string;
  description: string;
  detail?: any;
}

export default function PartManagementPage() {
  const { selectedPartIds, setSelectedPartIds } = usePartContext();

  // activePartId 추출 로직
  const rawActive = selectedPartIds[0];
  const activePartId =
    typeof rawActive === "string"
      ? rawActive
      : (rawActive as any)?.id || (rawActive as any)?.partId || "";

  const [partDetail, setPartDetail] = useState<PartDetailResponse | null>(null);
  const [loadingTitle, setLoadingTitle] = useState(false);

  // activePartId 변경 시 백엔드 단일 창구 API 호출 (/api/parts/{partId})
  useEffect(() => {
    if (!activePartId) {
      setPartDetail(null);
      return;
    }

    const controller = new AbortController();

    const fetchPartDetail = async () => {
      setLoadingTitle(true);

      try {
        const res = await fetch(`/api/parts/${activePartId}`, {
        //const res = await fetch(`http://localhost:5007/api/parts/${activePartId}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("부품 정보를 불러오지 못했습니다.");
        }

        const data: PartDetailResponse = await res.json();
        setPartDetail(data);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setPartDetail(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingTitle(false);
        }
      }
    };

    fetchPartDetail();

    return () => controller.abort();
  }, [activePartId]);

  const handleSelect = (partData: { partId: string }) => {
    setSelectedPartIds?.([partData.partId]);
  };

  // 백엔드 표준 속성에서 값 추출
  const descriptionText =
    partDetail?.description ||
    (activePartId ? "부품 상세 정보" : "부품 목록 관리 및 상세 뷰어");

  const groupName = partDetail?.groupName || "";
  const partName = partDetail?.partName || activePartId;

  // PartId 접두사에 따라 알맞은 3D 뷰어 컴포넌트를 반환하는 함수
  const renderViewer = () => {
    if (!activePartId) {
      return (
        <div style={{ color: "#64748b", fontSize: "15px", textAlign: "center" }}>
          좌측 메뉴에서 조회할 부품을 선택해주세요.
        </div>
      );
    }

    // 1. 플렉시블 조인트 (fj-)
    if (activePartId.startsWith("fj")) {
      return (
      <FlexibleJointViewer 
        partId={activePartId} 
        orientation="horizontal" 
        spec={partDetail?.detail} // 💡 백엔드에서 이미 가져온 detail 치수 객체를 넘겨줌
    />
      );
    }

    // 2. 강관 및 CPVC 배관 (spp-, cpvc-)
    //if (activePartId.startsWith("spp") || activePartId.startsWith("cpvc")) {
    //  return <PipeViewer partId={activePartId} />;
    //}

    // 3. 티 (tee-, tee)
    //if (activePartId.startsWith("tee")) {
    // return <TeeViewer partId={activePartId} />;
    //}

    // 4. 크로스 (cross-, cross)
    //if (activePartId.startsWith("cross")) {
    //  return <CrossViewer partId={activePartId} />;
    //}

    // 5. 기타 준비 중인 3D 모델
    return (
      <div style={{ color: "#38bdf8", fontSize: "15px", textAlign: "center" }}>
        선택한 부품 ID: {activePartId}
        <br />
        <span style={{ fontSize: "13px", color: "#94a3b8" }}>
          (3D 모델 준비 중)
        </span>
      </div>
    );
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        width: "100%",
        height: "100vh",
        background: "#0f172a",
      }}
    >
      {/* 좌측 단일 선택 사이드바 */}
      <CategoryPartList activePartId={activePartId} onSelectPart={handleSelect} />

      {/* 우측 메인 뷰어 영역 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          overflow: "hidden",
        }}
      >
        {/* 상단 안내 타이틀 */}
        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "16px 20px",
            borderRadius: "8px",
            marginBottom: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "4px",
            }}
          >
            {activePartId ? (
              loadingTitle ? (
                <span>부품 정보를 불러오는 중입니다...</span>
              ) : (
                <span>
                  {descriptionText}{" "}
                  {groupName || partName ? `(${groupName} ${partName})` : ""}
                </span>
              )
            ) : (
              <span>부품 목록 관리 및 상세 뷰어</span>
            )}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "13px" }}>
            좌측 메뉴에서 부품을 선택하면 실시간 3D 모델을 확인하실 수 있습니다.
          </div>
        </div>

        {/* 3D 뷰어 영역 */}
        <div
          style={{
            flex: 1,
            position: "relative",
            background: "#111827",
            borderRadius: "12px",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {renderViewer()}
        </div>
      </div>
    </div>
  );
}