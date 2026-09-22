# FireSim 프로젝트 폴더 및 파일 구조

> 📁 폴더 · 📄 파일  
> 각 항목의 오른쪽에 해당 폴더 또는 파일의 용도를 설명합니다.

```text
D:\work\FireSim — 📁 프로젝트 최상위 루트 디렉터리
│
├── 📁 .vscode — VS Code 에디터 전용 설정 폴더
│   ├── 📄 launch.json — C# .NET 백엔드 또는 프론트엔드 앱 실행/디버깅 설정 파일
│   └── 📄 settings.json — VS Code 에디터 개인화 설정 (화면 폴더 숨김, files.exclude 등)
│
├── 📁 backend — C# .NET 기반 백엔드 API 서비스 폴더
│   └── 📁 src — 백엔드 소스 코드 모음 폴더
│       └── 📁 FireSim.Api — ASP.NET Core Web API 메인 프로젝트
│           │
│           ├── 📁 Controllers — 프론트엔드의 요청으로 데이터베이스(DbContext)에서 읽어온 데이터를 조회·수정·저장·삭제한 뒤 화면에 전달하는 중간 다리 역할
│           │   │                 데이터가 없거나 요청이 잘못되었을 때 안내 메시지와 에러 코드 처리
│           │   ├── 📄 FlexibleJointController.cs — 플렉시블 조인트의 치수 정보를 DB에서 찾아 프론트엔드(화면)로 전달해 주는 백엔드 API 창구(Controller)
│           │   │
│           │   ├── 📄 PartMenuController.cs — DB에서 부품 데이터를 불러와 프론트엔드용 트리 메뉴 구조로 재구성하고,부품 크기순(수치) 정렬 및 불필요한 중복
│           │   │                              메뉴를 자동으로 정리하여 화면에 전달해 주는 역할(GET /api/parts/{id}) *20260921_사용되지 않는 파일
│           │   └── 📄 PartsController.cs — 물품목록관리 사이드바/메뉴판에 표시할 부품 카테고리 트리 구조 데이터를 DB에서 조회하여 가공·전달
│           │                                (GET /api/partmenu/categories)
│           │
│           ├── 📁 Data — 데이터 흐름 양방향: 프론트엔드 <> 모든 Controller.cs <> AppDbContext.cs <> DB
│           │   └── 📄 AppDbContext.cs — C# 백엔드 코드와 실제 데이터베이스(SQL DB)를 1:1로 연결하고 관리
│           │
│           └── 📁 Models — 데이터베이스 테이블 매핑(EF Core Entity) 및 DTO 모델 폴더
│               ├── 📄 Category.cs — DB [Categories] 테이블 엔티티 (부품 대분류)
│               ├── 📄 CategoryModel.cs — 카테고리 데이터 전달용 DTO 또는 화면용 모델
│               ├── 📄 FlexibleJointDetail.cs — DB [FlexibleJointDetails] 테이블 엔티티 (플렉시블 조인트 상세 스펙)
│               ├── 📄 Part.cs — DB [Parts] 테이블 엔티티 (부품 중분류)
│               └── 📄 PipeDetail.cs — DB [PipeDetails] 테이블 엔티티 (배관 상세 스펙)
│
├── 📁 database — 데이터베이스 관련 스크립트 보관 폴더
│   └── 📄 schema.sql — DB 테이블 생성(DDL) 및 초기 데이터 삽입(DML) SQL 스크립트
│
├── 📁 frontend — React/TypeScript 기반 프론트엔드 웹 앱 폴더
│   └── 📁 src — 프론트엔드 소스 코드 모음 폴더
│       │
│       ├── 📁 components — UI 재사용 가능 컴포넌트 폴더
│       │   ├── 📁 parts — 부품 시각화 및 관리 전용 컴포넌트 모음
│       │   │   ├── 📄 FlexibleJoint_40A.tsx — 사용 안되는 예전 파일
│       │   │   ├── 📄 FlexibleJointViewer.tsx — 백엔드 DB에서 전달받은 치수 스펙을 기반으로 3D 모델을 생성하고 화면에 보여주는 전용 3D 뷰어 컴포넌트
│       │   │   ├── 📄 Pump_SMT50_3.tsx — SMT50_3 펌프 치수 하드 코딩
│       │   │   └── 📄
│       │   │
│       │   ├── 📄 AssemblyViewer.tsx — 부품 조립 상태 시각화/조회 뷰어 컴포넌트
│       │   ├── 📄 CategoryPartList.tsx — 카테고리별 부품 목록 조회/선택 리스트 컴포넌트
│       │   ├── 📄 FireSimViewer.tsx — 소방 시뮬레이션 메인 3D/2D 뷰어 컴포넌트
│       │   └── 📄 InspectionPanel.tsx — 선택한 부품의 상세 규격 및 점검 정보 패널 컴포넌트
│       │
│       ├── 📁 context — React 전역 상태 관리 폴더
│       │   └── 📄 PartContext.tsx — 애플리케이션 전체에서 부품 선택/조회 상태를 공유하는 Context Provider
│       │
│       ├── 📁 pages
│       │   ├── 📄 AssemblyPracticePage.tsx — 수계 소화 설비 시공 실무 페이지
│       │   ├── 📄 PartManagementPage.tsx — 부품 목록 관리 페이지
│       │   └── 📄 PumpPerformancePage.tsx — 소방 펌프 성능 시험 페이지
│       │
│       └── 📄 App.tsx — 프론트엔드 최상위 메인 컴포넌트 (라우팅 및 전체 레이아웃 구성)
│
└── 📄 TREE.md — 프로젝트 폴더 및 파일 용도 설명
```
