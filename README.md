# 생산관리 시스템 (영림원 KSYSTEM 웹 전환 프로젝트)

## 프로젝트 개요
- **이름**: 생산관리 시스템 웹 애플리케이션
- **목표**: 영림원 KSYSTEM으로 개발된 기존 생산관리 시스템을 웹 기반으로 전환
- **주요 기능**:
  - 생산 데이터 실시간 조회 및 관리
  - 공정별 작업 상태 모니터링
  - 벤치 및 예외 상황 추적
  - 작업 시작/종료/이상해제 제어
  - 다중 작업장 필터링

## 현재 완료된 기능
✅ **프로젝트 초기 설정**
  - Hono + Cloudflare Pages 템플릿 기반 구조
  - TypeScript 개발 환경
  - PM2 기반 개발 서버 구성

✅ **레이아웃 구현**
  - 3단 구조: 좌측 네비게이션 / 중앙 데이터 테이블 / 우측 상태 패널
  - 반응형 디자인 (TailwindCSS)
  - FontAwesome 아이콘 통합

✅ **API 엔드포인트 구조**
  - `/api/production/list` - 생산 데이터 목록 조회
  - `/api/production/start` - 작업 시작
  - `/api/production/complete` - 작업 완료
  - `/api/workcenter/list` - 작업장 목록
  - `/api/status/bench` - 벤치 상태
  - `/api/status/exception` - 예외 상태

✅ **프론트엔드 기능**
  - 실시간 시계 표시
  - 데이터 테이블 렌더링 (상태별 색상 코딩)
  - 작업장 및 필터 선택
  - 다중 선택 체크박스
  - 작업 제어 버튼 (시작/종료/이상해제/원재료확인)
  - 30초 자동 데이터 새로고침

## URLs
- **개발 서버**: https://3000-ivpfllyhsmjg1zq5gw7qa-d0b9e1e2.sandbox.novita.ai
- **GitHub**: (설정 필요)

## 데이터 아키텍처
- **데이터 소스**: 외부 SQL Server 데이터베이스 (SP 기반)
- **연결 방식**: mssql 패키지를 통한 직접 연결
- **API 패턴**: Stored Procedure 호출 래퍼
- **데이터 모델**:
  ```typescript
  interface ProductionItem {
    modelName: string;      // 모델명
    processCode: string;    // 공정코드
    unit: string;           // 단위
    quantity: number;       // 수량
    status: string;         // 상태 (normal/warning/error)
    workCenter: string;     // 작업장
    startTime: string;      // 시작시간
  }
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
```

## 사용 방법
### 개발 환경
```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 개발 서버 시작 (PM2)
pm2 start ecosystem.config.cjs

# 서버 확인
pm2 list
pm2 logs webapp --nostream

# 포트 정리
npm run clean-port

# 테스트
curl http://localhost:3000
```

### 프로덕션 배포
```bash
# Cloudflare Pages 배포
npm run deploy:prod
```

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
  - 상세 로그 조회
  - 사용자 권한 관리
  - 알림 시스템

## 다음 단계 권장사항
1. **데이터베이스 연결 설정**
   - 실제 DB 접속 정보 `.dev.vars` 파일에 설정
   - SP 이름 및 파라미터 확인 후 API 코드 조정

2. **SP 매핑 작업**
   - 각 API 엔드포인트에 사용될 실제 SP 이름 매핑
   - SP 입/출력 파라미터 타입 정의

3. **추가 화면 구현**
   - 다른 공정 관리 화면 순차적 개발
   - 각 화면별 SP 연동

4. **사용자 인증 추가**
   - 로그인 기능 구현
   - 권한별 메뉴 접근 제어

5. **프로덕션 배포 준비**
   - Cloudflare 환경변수 설정
   - 보안 검토 및 최적화

## 기술 스택
- **Backend**: Hono (Edge Framework)
- **Frontend**: Vanilla JavaScript + TailwindCSS
- **Database**: SQL Server (mssql 패키지)
- **Deployment**: Cloudflare Pages
- **Dev Tools**: PM2, Vite, TypeScript

## 프로젝트 구조
```
webapp/
├── src/
│   ├── index.tsx          # 메인 애플리케이션 및 레이아웃
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
├── wrangler.jsonc        # Cloudflare 설정
├── .dev.vars             # 환경변수 (로컬)
└── package.json          # 의존성 및 스크립트
```

## 배포 상태
- **플랫폼**: Cloudflare Pages (준비 완료)
- **상태**: ✅ 개발 서버 활성화
- **마지막 업데이트**: 2026-01-18

## 참고사항
- API 호출 실패 시 자동으로 Mock 데이터 사용
- 30초마다 자동 데이터 갱신
- PM2로 백그라운드 프로세스 관리
- Git 버전 관리 활성화
