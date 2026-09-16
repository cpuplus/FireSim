import React, { useState, useEffect } from "react";
import { getInspectionResults, createInspectionResult } from "../services/api";
import type { InspectionResult } from "../services/api";

export default function InspectionPanel() {
  const [results, setResults] = useState<InspectionResult[]>([]);
  const [loading, setLoading] = useState(false);

  // 데이터 불러오기
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

  useEffect(() => {
    fetchResults();
  }, []);

  // 테스트 점검 결과 저장 핸들러
  const handleTestSave = async () => {
    try {
      const newResult: InspectionResult = {
        userId: 1,
        equipmentTypeId: 1,
        score: 95,
        isPassed: true,
        completionTimeSeconds: 45,
        detailsJson: JSON.stringify({ note: "정상 작동 확인 완료" }),
      };
      await createInspectionResult(newResult);
      alert("검사 결과가 성공적으로 저장되었습니다!");
      fetchResults(); // 목록 새로고침
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        width: 350,
        background: "rgba(255,255,255,0.9)",
        padding: 15,
        borderRadius: 8,
        zIndex: 1000,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0" }}>🔥 소방 설비 점검 결과</h3>
      <button
        onClick={handleTestSave}
        style={{
          width: "100%",
          marginBottom: 10,
          padding: "8px 12px",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        테스트 결과 저장하기 (POST)
      </button>
      <div style={{ maxHeight: 200, overflowY: "auto", marginTop: 10 }}>
        {loading ? (
          <p>불러오는 중...</p>
        ) : (
          <ul style={{ paddingLeft: 15, margin: 0, fontSize: 13 }}>
            {results.map((r, index) => (
              <li key={r.resultId || index} style={{ marginBottom: 6 }}>
                ID: {r.userId} | 점수: <b>{r.score}점</b> (
                {r.isPassed ? "합격" : "불합격"}) <br />
                <small style={{ color: "#666" }}>
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
