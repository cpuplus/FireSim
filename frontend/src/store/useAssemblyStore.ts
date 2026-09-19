// src/store/useAssemblyStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PartTransform {
  position: [number, number, number];
  rotation: [number, number, number];
}

interface AddedPart {
  id: string;          // 부품 종류 (예: 'joint-1')
  instanceId: string;  // 고유 인스턴스 ID
}

interface AssemblyState {
  addedParts: AddedPart[];
  partsState: Record<string, PartTransform>;
  
  // 부품 추가 액션
  addPart: (part: AddedPart, initialTransform: PartTransform) => void;
  
  // 위치/회전 업데이트 (조립 완료 시)
  updatePartTransform: (instanceId: string, position: [number, number, number], rotation: [number, number, number]) => void;
  
  // 전체 초기화
  resetStore: () => void;
}

export const useAssemblyStore = create<AssemblyState>()(
  persist(
    (set) => ({
      addedParts: [],
      partsState: {},

      addPart: (part, initialTransform) => set((state) => {
        // 이미 존재하는 부품이면 추가하지 않음
        if (state.addedParts.some((p) => p.instanceId === part.instanceId)) {
          return state;
        }
        return {
          addedParts: [...state.addedParts, part],
          partsState: {
            ...state.partsState,
            [part.instanceId]: initialTransform,
          },
        };
      }),

      updatePartTransform: (instanceId, position, rotation) => set((state) => ({
        partsState: {
          ...state.partsState,
          [instanceId]: { position, rotation },
        },
      })),

      resetStore: () => set({ addedParts: [], partsState: {} }),
    }),
    {
      name: 'assembly-storage', // LocalStorage에 저장될 키
    }
  )
);