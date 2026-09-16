-- 1. 사용자 테이블 (Users)
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(256) NOT NULL,
    Role NVARCHAR(20) DEFAULT 'Student',
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- 2. 소방 설비 종류 테이블 (EquipmentTypes)
CREATE TABLE EquipmentTypes (
    EquipmentTypeId INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX) NULL
);

-- 3. 검사 결과/이력 테이블 (InspectionResults)
CREATE TABLE InspectionResults (
    ResultId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    EquipmentTypeId INT NOT NULL,
    Score INT NOT NULL DEFAULT 0,
    IsPassed BIT NOT NULL DEFAULT 0,
    CompletionTimeSeconds INT NULL,
    DetailsJson NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_InspectionResults_Users FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT FK_InspectionResults_EquipmentTypes FOREIGN KEY (EquipmentTypeId) REFERENCES EquipmentTypes(EquipmentTypeId)
);

-- 기본 설비 데이터 (Seed Data)
INSERT INTO EquipmentTypes (Code, Name, Description) VALUES
('PUMP_PERF', N'펌프성능검사', N'주펌프 및 충압펌프의 체절운전, 정격운전, 과부하운전 성능 검사 모듈'),
('WATER_SYS', N'수계소화설비', N'옥내/옥외소화전 및 스프링클러 설비 작동 실습 모듈'),
('GAS_SYS', N'가스소화설비', N'이산화탄소/할론/할로겐화합물 소화설비 제어반 및 밸브 실습 모듈');
