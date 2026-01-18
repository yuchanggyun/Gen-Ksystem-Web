# 생산관리 시스템 (영림원 KSYSTEM 웹 전환 프로젝트)

## 프로젝트 개요
- **이름**: 생산관리 시스템 웹 애플리케이션
- **목표**: 영림원 KSYSTEM으로 개발된 기존 생산관리 시스템을 웹 기반으로 전환
- **주요 기능**:
  - 4개 그리드 기반 생산 관리 UI
  - 작업구역 → 생산계획/공정흐름 → 공정작업 → 작업자/진행정보 연동
  - 다중 조회조건 필터링 (생산사업장, 기종, 워크센터, 공정, 날짜)
  - 실시간 작업 상태 모니터링
  - 그라데이션 기반 모던 UI 디자인

## 🎨 UI 디자인
- **다크 블루 헤더** (#3d4f5c) + 통계 배지
- **그리드별 그라데이션 헤더**:
  - 작업구역: 보라-파랑 그라데이션
  - 생산계획: 핑크-레드 그라데이션
  - 공정작업: 하늘-청록 그라데이션
  - 작업자: 초록-민트 그라데이션
  - 작업진행정보: 핑크-노랑 그라데이션
- **그라데이션 버튼** + 호버 애니메이션
- **부드러운 색상 전환** 및 그림자 효과

## 현재 완료된 기능
✅ **프로젝트 초기 설정**
  - Hono + Cloudflare Pages 템플릿 기반 구조
  - TypeScript 개발 환경
  - PM2 기반 개발 서버 구성
  - Vite 5.x 빌드 시스템

✅ **초기 로딩 메소드 (NEW!)**
  - **API**: `/api/initial-load`
  - **SP 기반**: `sp_POP_GetInitialData`
  - **반환 데이터**:
    - **DataBlock1**: 작업구역 + 생산계획 데이터 (조회범위, 필터조건, JOIN구조)
    - **DataBlock2**: 작업자 데이터 (좌우 분할 알고리즘)
  - **실행 흐름**:
    1. FactUnit 조회
    2. DataBlock1 생성 (5개 항목)
    3. DataBlock2 생성 (7단계 분할)
    4. 결과 반환
  - **프론트엔드 통합**: `loadInitialData()` 함수로 초기화

✅ **상단 조회조건부**
  - 전체작업구역 조회 버튼
  - 생산사업장 선택 (필수)
  - 기종 선택 (선택)
  - 워크센터 선택 (선택)
  - 공정 선택 (선택)
  - 생산계획시작일 (From ~ To 날짜)

✅ **4개 그리드 레이아웃**
  1. **작업구역 그리드** (좌측 전체)
     - 생산사업장별 작업구역 목록
     - 클릭 시 생산계획 로드
     
  2. **생산계획/공정흐름 통합 그리드** (중앙 좌측 전체)
     - 기종, 호기, 계획일, 수량, 공정진행(3/5), 상태
     - 공정흐름 정보 통합 표시
     - 클릭 시 공정작업 로드
     
  3. **공정작업 그리드** (중앙 우측 전체)
     - 공정코드, 공정명, 작업순서, 상태
     - 클릭 시 작업진행정보 로드
     
  4. **작업자 그리드** (우측 상단)
     - 사번, 이름, 선택 체크박스
     - 작업 시작 시 작업자 배정
     
  5. **작업진행정보 그리드** (우측 하단)
     - 작업ID, 공정명, 작업자, 시간, 수량, 상태
     - 현재 진행중인 작업 실시간 모니터링

✅ **하단 버튼부**
  - **시작** 버튼: 공정작업 및 작업자 선택 시 활성화
  - **종료** 버튼: 공정작업 선택 시 활성화
  - **공정이상해제** 버튼: 공정작업 선택 시 활성화

✅ **API 엔드포인트 구조**
  - **초기 로딩**: `/api/initial-load` (NEW! - SP 기반 초기 데이터)
  - **필터**: `/api/filter/{plants|models|workcenters|processes}`
  - **데이터**: `/api/{work-area|production-plan|process-work|worker|work-progress}/list`
  - **작업 제어**: `/api/work/{start|end|resolve}`

✅ **프론트엔드 기능**
  - 실시간 시계 표시
  - 그리드 간 연동 선택
  - 상태별 색상 코딩
  - 작업자 다중 선택
  - 조건부 버튼 활성화
  - Mock 데이터 폴백

## URLs
- **개발 서버**: https://3000-ivpfllyhsmjg1zq5gw7qa-d0b9e1e2.sandbox.novita.ai
- **GitHub**: https://github.com/yuchanggyun/Gen-Ksystem-Web

## 데이터 아키텍처
- **데이터 소스**: 외부 SQL Server 데이터베이스 (SP 기반)
- **연결 방식**: mssql 패키지를 통한 직접 연결
- **API 패턴**: Stored Procedure 호출 래퍼
- **데이터 흐름**:
  ```
  작업구역 선택
    ↓
  생산계획 로드 (공정진행 정보 포함)
    ↓
  공정작업 로드
    ↓
  공정작업 선택
    ↓
  작업진행정보 로드
  ```

## 환경 설정
### 데이터베이스 연결 (.dev.vars)
```env
DB_SERVER=your-db-server.com
DB_PORT=1433
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
DB_ENCRYPT=true
DB_TRUST_CERT=false
API_TIMEOUT=30000
```

## 사용 방법
### 개발 환경
```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 개발 서버 시작 (PM2)
fuser -k 3000/tcp 2>/dev/null || true  # 포트 정리
pm2 delete all 2>/dev/null || true     # PM2 정리
pm2 start ecosystem.config.cjs          # 서버 시작

# 서버 확인
pm2 list
pm2 logs webapp --nostream

# 테스트
curl http://localhost:3000
```

### 프로덕션 배포
```bash
# Cloudflare Pages 배포
npm run deploy:prod
```

## SP 매핑 목록 (실제 SP 이름으로 변경 필요)

### 초기 로딩 (NEW!)
- `sp_POP_GetInitialData` - 화면 초기 로딩 메소드
  - **파라미터**: @FactUnit, @DeptSeq, @PlantCode
  - **반환**: 
    - **Recordset 1 (DataBlock1)**: 작업구역 + 생산계획 데이터
    - **Recordset 2 (DataBlock2)**: 작업자 데이터 (좌우 분할)
  - **로직**:
    - FactUnit 자동 설정
    - 조회범위, 필터조건, JOIN구조 처리
    - 좌우 분할 알고리즘 적용
  - **비즈니스 규칙**: BR-01 ~ BR-07
  - **참조 테이블**: 10개 (명세 문서 참조)

### 필터 관련
- `sp_GetPlantList` - 생산사업장 목록
- `sp_GetModelList` - 기종 목록
- `sp_GetWorkCenterList` - 워크센터 목록
- `sp_GetProcessList` - 공정 목록

### 데이터 조회
- `sp_GetWorkAreaList` - 작업구역 목록 (@Plant)
- `sp_GetProductionPlanList` - 생산계획 목록 (@WorkArea, @Model, @StartDate, @EndDate)
- `sp_GetProcessWorkList` - 공정작업 목록 (@PlanId)
- `sp_GetWorkerList` - 작업자 목록
- `sp_GetWorkProgressList` - 작업진행정보 목록 (@WorkId)

### 작업 제어
- `sp_StartWork` - 작업 시작 (@ProcessWorkId, @Workers)
- `sp_EndWork` - 작업 종료 (@ProcessWorkId)
- `sp_ResolveWorkIssue` - 공정이상 해제 (@ProcessWorkId)

## 기술 스택
- **Backend**: Hono (Edge Framework)
- **Frontend**: Vanilla JavaScript + TailwindCSS
- **Database**: SQL Server (mssql 패키지)
- **Deployment**: Cloudflare Pages
- **Dev Tools**: PM2, Vite 5.x, TypeScript

## 프로젝트 구조
```
webapp/
├── src/
│   ├── index.tsx          # 메인 애플리케이션 및 4-그리드 레이아웃
│   ├── routes/
│   │   └── api.ts         # API 라우트 (SP 호출)
│   ├── lib/
│   │   └── db.ts          # 데이터베이스 연결 유틸리티
│   └── types/
│       └── index.ts       # TypeScript 타입 정의
├── public/
│   └── static/
│       └── app.js         # 프론트엔드 JavaScript
├── ecosystem.config.cjs   # PM2 설정
├── vite.config.ts        # Vite 5 설정
├── wrangler.jsonc        # Cloudflare 설정
├── .dev.vars             # 환경변수 (로컬)
└── package.json          # 의존성 및 스크립트
```

## UI 레이아웃

```
┌──────────────────────────────────────────────────────────────────┐
│ 헤더: CP 조회 화면 | 환경관리 가동률 확인건           현재시간  │
├──────────────────────────────────────────────────────────────────┤
│ 조회조건: [전체작업구역 조회] 생산사업장 기종 워크센터 공정     │
│           생산계획시작일 (From ~ To)                              │
├────┬──────────────────────┬──────────────────┬──────────────────┤
│    │ 생산계획/공정흐름     │  공정작업         │  작업자          │
│작업│  기종/호기/수량       │  공정코드/공정명  │  사번/이름       │
│구역│  공정진행 (3/5)       │  작업순서/상태    ├──────────────────┤
│    │  상태                │                  │  작업진행정보     │
│    │                      │                  │  작업ID/작업자    │
└────┴──────────────────────┴──────────────────┴──────────────────┘
│ 버튼: [시작] [종료] [공정이상해제]                                │
└──────────────────────────────────────────────────────────────────┘
```

## 다음 단계
1. **실제 DB 연결**: `.dev.vars` 설정 후 SP 이름 매핑
2. **SP 테스트**: 각 API 엔드포인트별 SP 호출 검증
3. **데이터 검증**: 실제 데이터로 UI 동작 확인
4. **추가 화면 구현**: 다른 공정 관리 화면
5. **프로덕션 배포**: Cloudflare Pages 배포

## 배포 상태
- **플랫폼**: Cloudflare Pages (준비 완료)
- **상태**: ✅ 코드 완성, 빌드 성공
- **GitHub**: ✅ 업로드 완료
- **마지막 업데이트**: 2026-01-18

## 라이선스
MIT

## 작성자
yuchanggyun
