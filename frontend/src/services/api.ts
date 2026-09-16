const API_BASE_URL = "http://localhost:5007/api"; // 백엔드 API 기본 주소

// 백엔드 DB 구조와 일치하는 검사 결과 데이터 타입(TypeScript 인터페이스) 정의
export interface InspectionResult {
  resultId?: number;
  userId: number;
  equipmentTypeId: number;
  score: number;
  isPassed: boolean;
  completionTimeSeconds?: number;
  detailsJson?: string;
  createdAt?: string;
}

/**
 * 1. 전체 검사 결과 목록 조회 (GET)
 * 백엔드의 api/InspectionResults 주소로 요청을 보내 저장된 목록을 가져옵니다.
 */
export async function getInspectionResults(): Promise<InspectionResult[]> {
  const response = await fetch(`${API_BASE_URL}/InspectionResults`);
  if (!response.ok) {
    throw new Error("검사 결과를 불러오는데 실패했습니다.");
  }
  return response.json();
}

/**
 * 2. 새로운 검사 결과 저장 (POST)
 * 사용자가 입력한 점검 결과 데이터를 백엔드로 보내 DB에 저장합니다.
 */
export async function createInspectionResult(
  result: InspectionResult,
): Promise<InspectionResult> {
  const response = await fetch(`${API_BASE_URL}/InspectionResults`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  });
  if (!response.ok) {
    throw new Error("검사 결과 저장에 실패했습니다.");
  }
  return response.json();
}
