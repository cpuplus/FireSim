// src/pages/AssemblyPracticePage.tsx
import React, { useState } from "react";
import AssemblyViewer from "../components/AssemblyViewer";
import { usePartContext } from "../context/PartContext";

interface AddedPart {
  id: string;
  name: string;
  instanceId: string; // 동일 부품 여러 개 구분을 위한 고유 ID
}

export default function AssemblyPracticePage() {
  const { selectedPartIds } = usePartContext();
  
  // 사용자가 추가한 부품 목록 (기본 펌프 외에 동적으로 추가/삭제)
  const [addedParts, setAddedParts] = useState<AddedPart[]>([
    { id: "flexible-joint-40a", name: "40A 플렉시블 조인트", instanceId: "joint-1" }
  ]);

  const [resetKey, setResetKey] = useState(0);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  // 부품 추가하기 (예: 플렉시블 조인트 추가)
  const handleAddFlexibleJoint = () => {
    const newInstanceId = `joint-${Date.now()}`;
    setAddedParts((prev) => [
      ...prev,
      { id: "flexible-joint-40a", name: "40A 플렉시블 조인트", instanceId: newInstanceId },
    ]);
  };

  // 부품 삭제하기
  const handleDeletePart = (instanceId: string) => {
    setAddedParts((prev) => prev.filter((p) => p.instanceId !== instanceId));
  };

  // 위치 초기화
  const handleReset = () => {
    setResetKey((prev) => prev + 1);
    setSubmittedScore(null);
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "calc(100vh - 50px)", // 상단 네비게이션 제외 높이
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        overflow: "hidden",
      }}
    >
      {/* 좌측: 실습 가이드 및 부품 제어 패널 */}
      <aside
        style={{
          width: "340px",
          backgroundColor: "#1e293b",
          borderRight: "1px solid rgba(56, 189, 248, 0.2)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 10,
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "12px",
              color: "#38bdf8",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Step 02. 시공 및 조립 실습
          </span>
          <h2 style={{ fontSize: "18px", margin: "6px 0 16px 0" }}>
            수계소화설비 조립 및 오차 검사
          </h2>

          {/* 작업 목표 안내 */}
          <div
            style={{
              backgroundColor: "#0f172a",
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid #334155",
              fontSize: "13px",
              lineHeight: "1.5",
              marginBottom: "16px",
            }}
          >
            <p style={{ margin: "0 0 6px 0", fontWeight: "bold", color: "#38bdf8" }}>
              🎯 실습 가이드
            </p>
            1. 펌프는 바닥에 고정되어 있습니다.<br/>
            2. 부품을 추가하여 마우스 기즈모로 위치를 맞추세요.<br/>
            3. 불필요한 부품은 삭제할 수 있습니다.<br/>
            4. [최종 제출 및 점수 확인]을 누르세요.
          </div>

          {/* 부품 추가 버튼 */}
          <button
            onClick={handleAddFlexibleJoint}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#0284c7",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "13px",
              cursor: "pointer",
              marginBottom: "16px",
            }}
          >
            ➕ 플렉시블 조인트 추가하기
          </button>

          {/* 현재 구성된 부품 목록 */}
          <div>
            <h4 style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>
              설치된 부품 목록 ({addedParts.length + 1}개)
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {/* 고정 펌프 */}
              <li
                style={{
                  padding: "10px 12px",
                  backgroundColor: "#334155",
                  borderRadius: "6px",
                  marginBottom: "6px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>⚙️ 024-45 입형 펌프</span>
                <span style={{ color: "#4ade80", fontSize: "11px", fontWeight: "bold" }}>고정됨</span>
              </li>

              {/* 동적 추가된 부품들 */}
              {addedParts.map((part) => (
                <li
                  key={part.instanceId}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "6px",
                    marginBottom: "6px",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>🔧 {part.name}</span>
                  <button
                    onClick={() => handleDeletePart(part.instanceId)}
                    style={{
                      background: "transparent",
                      color: "#ef4444",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    삭제 ❌
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 하단 제어 버튼 및 점수 결과 */}
        <div style={{ marginTop: "20px" }}>
          {submittedScore !== null && (
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: submittedScore >= 80 ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                border: submittedScore >= 80 ? "1px solid #22c55e" : "1px solid #ef4444",
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: "bold", color: submittedScore >= 80 ? "#4ade80" : "#f87171" }}>
                {submittedScore >= 80 ? "🎉 최종 합격!" : "⚠️ 불합격 (위치 오차 발생)"}
              </div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", marginTop: "4px" }}>
                획득 점수: {submittedScore}점 / 100점
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleReset}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "transparent",
                color: "#94a3b8",
                border: "1px solid #475569",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              🔄 초기화
            </button>
          </div>
        </div>
      </aside>

      {/* 우측: 3D 조립 뷰어 영역 (addedParts 상태 전달) */}
      <main style={{ flex: 1, position: "relative" }}>
        <AssemblyViewer key={resetKey} addedParts={addedParts} onScoreCalculated={(score) => setSubmittedScore(score)} />
      </main>
    </div>
  );
}