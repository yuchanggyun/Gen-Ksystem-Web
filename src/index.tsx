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
        body { font-family: 'Malgun Gothic', sans-serif; overflow: hidden; }
        
        /* Layout */
        .app-container { display: flex; height: 100vh; }
        .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        
        /* Header */
        .header {
            background: white;
            padding: 12px 20px;
            border-bottom: 2px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        
        /* Filter Section */
        .filter-section {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 2px solid #e0e0e0;
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
            font-size: 13px;
            font-weight: 600;
            color: #2c3e50;
            white-space: nowrap;
        }
        
        /* Grid Container - 4개 그리드 레이아웃 */
        .grid-container {
            flex: 1;
            display: grid;
            grid-template-columns: 200px 1fr 1fr 280px;
            grid-template-rows: 1fr 1fr;
            gap: 10px;
            padding: 10px;
            overflow: hidden;
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
            border: 1px solid #ddd;
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .grid-header {
            background: #3498db;
            color: white;
            padding: 8px 12px;
            font-weight: 600;
            font-size: 13px;
            border-bottom: 2px solid #2980b9;
            flex-shrink: 0;
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
            background: #ecf0f1;
            color: #2c3e50;
            padding: 8px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #bdc3c7;
            position: sticky;
            top: 0;
            z-index: 5;
        }
        td {
            padding: 6px 8px;
            border-bottom: 1px solid #e0e0e0;
        }
        tr:hover { background: #f8f9fa; }
        tr.selected { background: #d4e9ff; }
        tr.status-running { background: #d5f4e6; }
        tr.status-waiting { background: #fff3cd; }
        tr.status-error { background: #f8d7da; }
        tr.clickable { cursor: pointer; }
        
        /* Buttons */
        .btn-group {
            background: white;
            padding: 12px 20px;
            border-top: 2px solid #e0e0e0;
            display: flex;
            gap: 10px;
            flex-shrink: 0;
        }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .btn-primary { background: #3498db; color: white; }
        .btn-primary:hover:not(:disabled) { background: #2980b9; }
        .btn-success { background: #2ecc71; color: white; }
        .btn-success:hover:not(:disabled) { background: #27ae60; }
        .btn-danger { background: #e74c3c; color: white; }
        .btn-danger:hover:not(:disabled) { background: #c0392b; }
        .btn-warning { background: #f39c12; color: white; }
        .btn-warning:hover:not(:disabled) { background: #e67e22; }
        
        /* Form Elements */
        select, input[type="text"], input[type="date"] {
            padding: 6px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 13px;
            background: white;
        }
        select { min-width: 120px; }
        input[type="date"] { width: 130px; }
        
        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 30px 20px;
            color: #7f8c8d;
            font-size: 13px;
        }
        
        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: 600;
        }
        .status-badge.running { background: #d5f4e6; color: #27ae60; }
        .status-badge.waiting { background: #fff3cd; color: #f39c12; }
        .status-badge.completed { background: #d4e9ff; color: #3498db; }
        .status-badge.error { background: #f8d7da; color: #e74c3c; }
    </style>
</head>
<body>
    <div class="app-container">
        <!-- Main Content -->
        <div class="main-content">
            <!-- Header -->
            <div class="header">
                <h1 style="font-size: 18px; color: #2c3e50; font-weight: 600;">
                    <i class="fas fa-clipboard-list"></i>
                    CP_DP 트라이얼파일조리
                </h1>
                <div style="color: #7f8c8d; font-size: 13px;">
                    <i class="far fa-clock"></i>
                    <span id="current-time"></span>
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
