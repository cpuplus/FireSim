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

// 통계 데이터 타입 정의
export interface InspectionStats {
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  averageScore: number;
  passRate: number;
}

/**
 * 1. 전체 검사 결과 목록 조회 (GET)
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

/**
 * 3. 설비별/상태별 필터 조회 (GET)
 */
export async function getFilteredInspectionResults(
  equipmentTypeId?: number,
  isPassed?: boolean,
): Promise<InspectionResult[]> {
  const params = new URLSearchParams();
  if (equipmentTypeId !== undefined)
    params.append("equipmentTypeId", equipmentTypeId.toString());
  if (isPassed !== undefined) params.append("isPassed", isPassed.toString());

  const response = await fetch(
    `${API_BASE_URL}/InspectionResults/filter?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error("필터링된 검사 결과를 불러오는데 실패했습니다.");
  }
  return response.json();
}

/**
 * 4. 전체 통계 정보 조회 (GET)
 */
export async function getInspectionStats(): Promise<InspectionStats> {
  const response = await fetch(`${API_BASE_URL}/InspectionResults/stats`);
  if (!response.ok) {
    throw new Error("관제 통계 데이터를 불러오는데 실패했습니다.");
  }
  return response.json();
}
