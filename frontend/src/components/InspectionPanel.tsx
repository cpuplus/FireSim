import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { getInspectionResults, createInspectionResult } from "../services/api";
import type { InspectionResult } from "../services/api";

export interface InspectionPanelRef {
  refresh: () => void;
}

const InspectionPanel = forwardRef<InspectionPanelRef>((_, ref) => {
  const [results, setResults] = useState<InspectionResult[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await getInspectionResults();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchResults,
  }));

  useEffect(() => {
    fetchResults();
  }, []);

  const handleTestSave = async () => {
    try {
      const newResult: InspectionResult = {
        userId: 1,
        equipmentTypeId: 1,
        score: 95,
        isPassed: true,
        completionTimeSeconds: 45,
        detailsJson: JSON.stringify({ note: "수동 테스트 점검 완료" }),
      };
      await createInspectionResult(newResult);
      fetchResults();
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "transparent",
        padding: "20px",
        boxSizing: "border-box",
        color: "#f1f5f9",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: "flex",
        flexDirection: "column",
      }}>

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
        InspectionPanel.tsx
      </div>

      {/* 기존 컴포넌트 내부 콘텐츠들... */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 600,
            color: "#38bdf8",
          }}
        >
          🛡️ 실시간 소방 설비 점검 현황
        </h3>
        <span
          style={{
            fontSize: "12px",
            background: "#334155",
            padding: "2px 8px",
            borderRadius: "12px",
            color: "#94a3b8",
          }}
        >
          Live
        </span>
      </div>

      <button
        onClick={handleTestSave}
        style={{
          width: "100%",
          marginBottom: "14px",
          padding: "10px 14px",
          background: "linear-gradient(135deg, #0284c7, #0369a1)",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "13px",
          boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
          transition: "all 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
        onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
      >
        + 수동 테스트 결과 기록
      </button>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "4px",
          scrollbarWidth: "thin",
          scrollbarColor: "#475569 transparent",
        }}
      >
        {loading ? (
          <p
            style={{
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "13px",
              marginTop: "20px",
            }}
          >
            데이터 동기화 중...
          </p>
        ) : results.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "13px",
              marginTop: "20px",
            }}
          >
            기록된 점검 결과가 없습니다.
          </p>
        ) : (
          <ul
            style={{
              padding: 0,
              margin: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {results.map((r, index) => (
              <li
                key={r.resultId || index}
                style={{
                  background: "rgba(30, 41, 59, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, color: "#e2e8f0" }}>
                    설비 ID: {r.equipmentTypeId} | 점수:{" "}
                    <b style={{ color: "#38bdf8" }}>{r.score}점</b>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : "방금 전"}
                  </div>
                </div>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    background: r.isPassed
                      ? "rgba(16, 185, 129, 0.2)"
                      : "rgba(239, 68, 68, 0.2)",
                    color: r.isPassed ? "#34d399" : "#f87171",
                    border: `1px solid ${r.isPassed ? "rgba(52, 211, 153, 0.3)" : "rgba(248, 113, 113, 0.3)"}`,
                  }}
                >
                  {r.isPassed ? "정상" : "이상"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

export default InspectionPanel;
