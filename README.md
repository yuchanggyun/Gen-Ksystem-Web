# 생산관리 시스템 (영림원 KSYSTEM 웹 전환 프로젝트)

## 프로젝트 개요
- **이름**: 생산관리 시스템 웹 애플리케이션
- **목표**: 영림원 KSYSTEM으로 개발된 기존 생산관리 시스템을 웹 기반으로 전환
- **주요 기능**:
  - 5개 그리드 기반 생산 관리 UI
  - 작업구역 → 생산계획 → 공정작업 → 작업자 → 진행정보 연동
  - 다중 조회조건 필터링 (생산사업장, 기종, 워크센터, 공정, 날짜)
  - 실시간 작업 상태 모니터링
  - 작업 시작/종료/이상해제 제어

## 현재 완료된 기능
✅ **프로젝트 초기 설정**
  - Hono + Cloudflare Pages 템플릿 기반 구조
  - TypeScript 개발 환경
  - PM2 기반 개발 서버 구성
  - Vite 5.x 빌드 시스템

✅ **상단 조회조건부**
  - 전체작업구역 조회 버튼
  - 생산사업장 선택 (필수)
  - 기종 선택 (선택)
  - 워크센터 선택 (선택)
  - 공정 선택 (선택)
  - 생산계획시작일 (From ~ To 날짜)

✅ **5개 그리드 레이아웃**
  1. **작업구역 그리드** (좌측)
     - 생산사업장별 작업구역 목록
     - 클릭 시 생산계획 로드
     
  2. **생산계획 그리드** (중앙 상단)
     - 기종, 호기, 계획일, 수량, 상태
     - 클릭 시 공정작업 및 공정흐름 로드
     
  3. **공정작업 그리드** (중앙 하단)
     - 공정코드, 공정명, 작업순서, 상태
     - 클릭 시 작업진행정보 로드
     
  4. **공정흐름 그리드** (우측 상단 좌측)
     - 순서, 공정명, 진행상태
     - 생산계획의 전체 공정 흐름 시각화
     
  5. **작업자 그리드** (우측 상단 우측)
     - 사번, 이름, 선택 체크박스
     - 작업 시작 시 작업자 배정
     
  6. **작업진행정보 그리드** (우측 하단)
     - 작업ID, 공정명, 작업자, 시작시간, 경과시간, 진행수량, 상태
     - 현재 진행중인 작업 실시간 모니터링

✅ **하단 버튼부**
  - **시작** 버튼: 공정작업 및 작업자 선택 시 활성화
  - **종료** 버튼: 공정작업 선택 시 활성화
  - **공정이상해제** 버튼: 공정작업 선택 시 활성화

✅ **API 엔드포인트 구조**
  - `/api/filter/plants` - 생산사업장 목록
  - `/api/filter/models` - 기종 목록
  - `/api/filter/workcenters` - 워크센터 목록
  - `/api/filter/processes` - 공정 목록
  - `/api/work-area/list` - 작업구역 목록
  - `/api/production-plan/list` - 생산계획 목록
  - `/api/process-work/list` - 공정작업 목록
  - `/api/process-flow/list` - 공정흐름 목록
  - `/api/worker/list` - 작업자 목록
  - `/api/work-progress/list` - 작업진행정보 목록
  - `/api/work/start` - 작업 시작
  - `/api/work/end` - 작업 종료
  - `/api/work/resolve` - 공정이상 해제

✅ **프론트엔드 기능**
  - 실시간 시계 표시
  - 그리드 간 연동 선택 (클릭 이벤트)
  - 상태별 색상 코딩 (진행중/대기/완료/오류)
  - 작업자 다중 선택
  - 조건부 버튼 활성화
  - Mock 데이터 폴백 (API 실패 시)

## URLs
- **개발 서버**: https://3000-ivpfllyhsmjg1zq5gw7qa-d0b9e1e2.sandbox.novita.ai
- **GitHub**: (설정 필요)

## 데이터 아키텍처
- **데이터 소스**: 외부 SQL Server 데이터베이스 (SP 기반)
- **연결 방식**: mssql 패키지를 통한 직접 연결
- **API 패턴**: Stored Procedure 호출 래퍼
- **데이터 흐름**:
  ```
  작업구역 선택
    ↓
  생산계획 로드 (기종/호기/수량)
    ↓
  공정작업 + 공정흐름 로드
    ↓
  공정작업 선택
    ↓
  작업진행정보 로드 (실시간 작업 현황)
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

### 필터 관련
- `sp_GetPlantList` - 생산사업장 목록
- `sp_GetModelList` - 기종 목록
- `sp_GetWorkCenterList` - 워크센터 목록
- `sp_GetProcessList` - 공정 목록

### 데이터 조회
- `sp_GetWorkAreaList` - 작업구역 목록 (@Plant)
- `sp_GetProductionPlanList` - 생산계획 목록 (@WorkArea, @Model, @StartDate, @EndDate)
- `sp_GetProcessWorkList` - 공정작업 목록 (@PlanId)
- `sp_GetProcessFlowList` - 공정흐름 목록 (@PlanId)
- `sp_GetWorkerList` - 작업자 목록
- `sp_GetWorkProgressList` - 작업진행정보 목록 (@WorkId)

### 작업 제어
- `sp_StartWork` - 작업 시작 (@ProcessWorkId, @Workers)
- `sp_EndWork` - 작업 종료 (@ProcessWorkId)
- `sp_ResolveWorkIssue` - 공정이상 해제 (@ProcessWorkId)

## 아직 구현되지 않은 기능
❌ **실제 데이터베이스 연결**
  - 현재 Mock 데이터 사용
  - SP 호출 구조는 준비되었으나 실제 DB 정보 필요

❌ **추가 공정 화면**
  - CP_DP 10단계
  - CP_DP 4 5 6차
  - CP_DP 사상화
  - 기타 네비게이션 메뉴 항목들

❌ **고급 기능**
  - 데이터 엑셀 내보내기
  - 작업 이력 조회
  - 사용자 권한 관리
  - 알림 시스템
  - 자동 새로고침

## 다음 단계 권장사항
1. **데이터베이스 연결 설정**
   - 실제 DB 접속 정보 `.dev.vars` 파일에 설정
   - SP 이름 및 파라미터 확인 후 API 코드 조정

2. **SP 매핑 작업**
   - 각 API 엔드포인트에 사용될 실제 SP 이름 매핑
   - SP 입/출력 파라미터 타입 정의
   - 반환값 컬럼명 확인 및 TypeScript 타입 조정

3. **UI 테스트 및 개선**
   - 실제 데이터로 그리드 연동 테스트
   - 상태 변화에 따른 UI 반응 확인
   - 에러 처리 강화

4. **추가 화면 구현**
   - 다른 공정 관리 화면 순차적 개발
   - 각 화면별 SP 연동

5. **성능 최적화**
   - API 응답 시간 측정
   - 필요 시 캐싱 전략 수립
   - 대용량 데이터 처리 최적화

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
│   ├── index.tsx          # 메인 애플리케이션 및 5-그리드 레이아웃
│   ├── routes/
│   │   └── api.ts         # API 라우트 (SP 호출 - 13개 엔드포인트)
│   ├── lib/
│   │   └── db.ts          # 데이터베이스 연결 유틸리티
│   └── types/
│       └── index.ts       # TypeScript 타입 정의
├── public/
│   └── static/
│       └── app.js         # 프론트엔드 JavaScript (그리드 연동 로직)
├── ecosystem.config.cjs   # PM2 설정
├── vite.config.ts        # Vite 5 설정
├── wrangler.jsonc        # Cloudflare 설정
├── .dev.vars             # 환경변수 (로컬)
└── package.json          # 의존성 및 스크립트
```

## UI 레이아웃 설명

```
┌──────────────────────────────────────────────────────────────┐
│ 헤더: CP_DP 트라이얼파일조리                    현재시간    │
├──────────────────────────────────────────────────────────────┤
│ 조회조건: [전체작업구역 조회] 생산사업장 기종 워크센터 공정│
│           생산계획시작일 (From ~ To)                         │
├────┬───────────────────────────┬──────────┬─────────────────┤
│    │ 생산계획 (기종/호기)      │ 공정흐름 │  작업자 선택    │
│작업│                            │          │                 │
│구역│                            │          │                 │
│    ├───────────────────────────┼──────────┴─────────────────┤
│    │ 공정작업 (하부공정)       │ 작업진행정보              │
│    │                            │ (현재 진행중인 작업)      │
└────┴───────────────────────────┴───────────────────────────┘
│ 버튼: [시작] [종료] [공정이상해제]                           │
└──────────────────────────────────────────────────────────────┘
```

## 배포 상태
- **플랫폼**: Cloudflare Pages (준비 완료)
- **상태**: ✅ 코드 완성, 빌드 성공
- **마지막 업데이트**: 2026-01-18

## 참고사항
- API 호출 실패 시 자동으로 Mock 데이터 사용
- 그리드 선택 시 관련 그리드 자동 업데이트
- 버튼은 선택 상태에 따라 자동 활성화/비활성화
- PM2로 백그라운드 프로세스 관리
- Git 버전 관리 활성화
- mssql 패키지는 external로 빌드 (Cloudflare Pages에서는 사용 불가)
