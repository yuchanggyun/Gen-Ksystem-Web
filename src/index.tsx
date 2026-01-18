import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import { cors } from 'hono/cors';
import api from './routes/api';

const app = new Hono();

// Enable CORS for API routes
app.use('/api/*', cors());

// Mount API routes
app.route('/api', api);

// Serve static files
app.use('/static/*', serveStatic({ root: './' }));

// Main page
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>생산관리 시스템</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; overflow: hidden; background: #f5f7fa; }
        
        /* Layout */
        .app-container { display: flex; height: 100vh; background: #f5f7fa; }
        .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        
        /* Header */
        .header {
            background: #3d4f5c;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header h1 {
            color: white;
            font-size: 16px;
            font-weight: 500;
        }
        .header-stats {
            display: flex;
            gap: 15px;
            align-items: center;
        }
        .stat-badge {
            background: rgba(255,255,255,0.15);
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .stat-badge i { font-size: 10px; }
        .stat-value { font-weight: 600; color: #4fc3f7; }
        
        /* Filter Section */
        .filter-section {
            background: white;
            padding: 12px 20px;
            border-bottom: 1px solid #e0e0e0;
            flex-shrink: 0;
        }
        .filter-row {
            display: flex;
            gap: 15px;
            align-items: center;
            margin-bottom: 10px;
        }
        .filter-row:last-child { margin-bottom: 0; }
        .filter-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .filter-item label {
            font-size: 12px;
            font-weight: 600;
            color: #546e7a;
            white-space: nowrap;
        }
        
        /* Grid Container - 4개 그리드 레이아웃 */
        .grid-container {
            flex: 1;
            display: grid;
            grid-template-columns: 200px 1fr 1fr 280px;
            grid-template-rows: 1fr 1fr;
            gap: 8px;
            padding: 8px;
            overflow: hidden;
            background: #f5f7fa;
        }
        
        /* Grid 1: 작업구역 (좌측 전체) */
        .grid-work-area {
            grid-column: 1;
            grid-row: 1 / 3;
        }
        
        /* Grid 2: 생산계획+공정흐름 통합 (중앙 좌측 전체) */
        .grid-production-plan {
            grid-column: 2;
            grid-row: 1 / 3;
        }
        
        /* Grid 3: 공정작업 (중앙 우측 전체) */
        .grid-process-work {
            grid-column: 3;
            grid-row: 1 / 3;
        }
        
        /* Grid 4: 작업자 선택 (우측 상단) */
        .grid-worker {
            grid-column: 4;
            grid-row: 1;
        }
        
        /* Grid 5: 작업진행정보 (우측 하단) */
        .grid-work-progress {
            grid-column: 4;
            grid-row: 2;
        }
        
        /* Grid Box Styling */
        .grid-box {
            background: white;
            border: 1px solid #e0e6ed;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .grid-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 14px;
            font-weight: 600;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
            border-bottom: 2px solid rgba(0,0,0,0.1);
        }
        .grid-header i { font-size: 14px; opacity: 0.9; }
        
        /* 그리드별 헤더 색상 */
        .grid-work-area .grid-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .grid-production-plan .grid-header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        .grid-process-work .grid-header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        .grid-worker .grid-header {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
        .grid-work-progress .grid-header {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }
        .grid-body {
            flex: 1;
            overflow: auto;
        }
        
        /* Table */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }
        th {
            background: #f8f9fa;
            color: #546e7a;
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e0e6ed;
            position: sticky;
            top: 0;
            z-index: 5;
            font-size: 11px;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #f0f0f0;
            color: #37474f;
        }
        tr:hover { background: #f8fafb; }
        tr.selected { background: #e3f2fd; border-left: 3px solid #2196f3; }
        tr.status-running { background: #e8f5e9; }
        tr.status-waiting { background: #fff8e1; }
        tr.status-error { background: #ffebee; }
        tr.status-completed { background: #e3f2fd; }
        tr.clickable { cursor: pointer; transition: all 0.2s; }
        
        /* Buttons */
        .btn-group {
            background: white;
            padding: 12px 20px;
            border-top: 1px solid #e0e6ed;
            display: flex;
            gap: 8px;
            flex-shrink: 0;
            box-shadow: 0 -2px 4px rgba(0,0,0,0.05);
        }
        .btn {
            padding: 10px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            box-shadow: none;
        }
        .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4); }
        .btn-success { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; }
        .btn-success:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(67, 233, 123, 0.4); }
        .btn-danger { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; }
        .btn-danger:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(250, 112, 154, 0.4); }
        .btn-warning { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
        .btn-warning:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(240, 147, 251, 0.4); }
        
        /* Form Elements */
        select, input[type="text"], input[type="date"] {
            padding: 6px 12px;
            border: 1px solid #d0d7de;
            border-radius: 6px;
            font-size: 12px;
            background: white;
            transition: all 0.2s;
        }
        select:focus, input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        select { min-width: 120px; }
        input[type="date"] { width: 130px; }
        
        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 30px 20px;
            color: #90a4ae;
            font-size: 12px;
        }
        
        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
        }
        .status-badge.running { background: #c8e6c9; color: #2e7d32; }
        .status-badge.waiting { background: #fff9c4; color: #f57f17; }
        .status-badge.completed { background: #bbdefb; color: #1565c0; }
        .status-badge.error { background: #ffcdd2; color: #c62828; }
    </style>
</head>
<body>
    <div class="app-container">
        <!-- Main Content -->
        <div class="main-content">
            <!-- Header -->
            <div class="header">
                <h1>
                    <i class="fas fa-industry"></i>
                    CP 조회 화면
                </h1>
                <div class="header-stats">
                    <div class="stat-badge">
                        <i class="fas fa-leaf"></i>
                        환경 관리 <span class="stat-value">0</span>
                    </div>
                    <div class="stat-badge">
                        <i class="fas fa-chart-line"></i>
                        가동률 <span class="stat-value">0.0%</span>
                    </div>
                    <div class="stat-badge">
                        <i class="fas fa-check-circle"></i>
                        확인건 <span class="stat-value">0</span>
                    </div>
                    <div style="color: white; font-size: 12px;">
                        <i class="far fa-clock"></i>
                        <span id="current-time"></span>
                    </div>
                </div>
            </div>
            
            <!-- Filter Section -->
            <div class="filter-section">
                <div class="filter-row">
                    <button class="btn btn-primary" onclick="loadAllWorkAreas()">
                        <i class="fas fa-search"></i> 전체작업구역 조회
                    </button>
                    
                    <div class="filter-item">
                        <label>생산사업장:</label>
                        <select id="plantSelect">
                            <option value="">선택</option>
                        </select>
                    </div>
                    
                    <div class="filter-item">
                        <label>기종:</label>
                        <select id="modelSelect">
                            <option value="">선택</option>
                        </select>
                    </div>
                    
                    <div class="filter-item">
                        <label>워크센터:</label>
                        <select id="workCenterSelect">
                            <option value="">선택</option>
                        </select>
                    </div>
                </div>
                
                <div class="filter-row">
                    <div class="filter-item">
                        <label>공정:</label>
                        <select id="processSelect">
                            <option value="">선택</option>
                        </select>
                    </div>
                    
                    <div class="filter-item">
                        <label>생산계획시작일:</label>
                        <input type="date" id="startDate">
                        <span>~</span>
                        <input type="date" id="endDate">
                    </div>
                </div>
            </div>
            
            <!-- Grid Container (4개 그리드) -->
            <div class="grid-container">
                <!-- Grid 1: 작업구역 -->
                <div class="grid-box grid-work-area">
                    <div class="grid-header">
                        <i class="fas fa-map-marker-alt"></i> 작업구역
                    </div>
                    <div class="grid-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>구역코드</th>
                                    <th>구역명</th>
                                </tr>
                            </thead>
                            <tbody id="workAreaTable">
                                <tr>
                                    <td colspan="2" class="empty-state">
                                        <i class="fas fa-info-circle"></i><br>
                                        전체작업구역 조회를 클릭하세요
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Grid 2: 생산계획 + 공정흐름 통합 -->
                <div class="grid-box grid-production-plan">
                    <div class="grid-header">
                        <i class="fas fa-calendar-alt"></i> 생산계획 / 공정흐름
                    </div>
                    <div class="grid-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>기종</th>
                                    <th>호기</th>
                                    <th>계획일</th>
                                    <th>수량</th>
                                    <th>공정진행</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody id="productionPlanTable">
                                <tr>
                                    <td colspan="6" class="empty-state">
                                        작업구역을 선택하세요
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Grid 3: 공정작업 -->
                <div class="grid-box grid-process-work">
                    <div class="grid-header">
                        <i class="fas fa-tasks"></i> 공정작업
                    </div>
                    <div class="grid-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>공정코드</th>
                                    <th>공정명</th>
                                    <th>작업순서</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody id="processWorkTable">
                                <tr>
                                    <td colspan="4" class="empty-state">
                                        생산계획을 선택하세요
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Grid 4: 작업자 선택 -->
                <div class="grid-box grid-worker">
                    <div class="grid-header">
                        <i class="fas fa-user-hard-hat"></i> 작업자
                    </div>
                    <div class="grid-body">
                        <table>
                            <thead>
                                <tr>
                                    <th width="40">선택</th>
                                    <th>사번</th>
                                    <th>이름</th>
                                </tr>
                            </thead>
                            <tbody id="workerTable">
                                <tr>
                                    <td colspan="3" class="empty-state">
                                        작업자 목록
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Grid 5: 작업진행정보 -->
                <div class="grid-box grid-work-progress">
                    <div class="grid-header">
                        <i class="fas fa-chart-line"></i> 작업진행정보
                    </div>
                    <div class="grid-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>작업ID</th>
                                    <th>공정명</th>
                                    <th>작업자</th>
                                    <th>시작시간</th>
                                    <th>경과시간</th>
                                    <th>진행수량</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody id="workProgressTable">
                                <tr>
                                    <td colspan="7" class="empty-state">
                                        공정작업을 선택하세요
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Button Group -->
            <div class="btn-group">
                <button class="btn btn-success" id="btnStart" onclick="handleStart()" disabled>
                    <i class="fas fa-play"></i> 시작
                </button>
                <button class="btn btn-danger" id="btnEnd" onclick="handleEnd()" disabled>
                    <i class="fas fa-stop"></i> 종료
                </button>
                <button class="btn btn-warning" id="btnResolve" onclick="handleResolve()" disabled>
                    <i class="fas fa-wrench"></i> 공정이상해제
                </button>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/app.js"></script>
</body>
</html>
  `);
});

export default app;
