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
        body { font-family: 'Malgun Gothic', sans-serif; }
        
        /* Layout */
        .app-container { display: flex; height: 100vh; }
        .sidebar { width: 250px; background: #2c3e50; color: white; overflow-y: auto; }
        .main-content { flex: 1; display: flex; flex-direction: column; }
        .right-panel { width: 300px; background: #ecf0f1; border-left: 2px solid #bdc3c7; overflow-y: auto; }
        
        /* Sidebar Navigation */
        .nav-item {
            padding: 12px 20px;
            cursor: pointer;
            border-left: 3px solid transparent;
            transition: all 0.2s;
        }
        .nav-item:hover { background: #34495e; border-left-color: #3498db; }
        .nav-item.active { background: #34495e; border-left-color: #3498db; }
        .nav-item i { margin-right: 8px; }
        
        /* Header */
        .header {
            background: white;
            padding: 15px 20px;
            border-bottom: 2px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        /* Filter Section */
        .filter-section {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        /* Table */
        .table-container {
            flex: 1;
            overflow: auto;
            padding: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th {
            background: #3498db;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #e0e0e0;
        }
        tr:hover { background: #f8f9fa; }
        tr.status-normal { background: #e8f4fd; }
        tr.status-warning { background: #fff3cd; }
        tr.status-error { background: #f8d7da; }
        
        /* Buttons */
        .btn-group {
            background: white;
            padding: 15px 20px;
            border-top: 2px solid #e0e0e0;
            display: flex;
            gap: 10px;
        }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
        }
        .btn-primary { background: #3498db; color: white; }
        .btn-primary:hover { background: #2980b9; }
        .btn-success { background: #2ecc71; color: white; }
        .btn-success:hover { background: #27ae60; }
        .btn-danger { background: #e74c3c; color: white; }
        .btn-danger:hover { background: #c0392b; }
        .btn-warning { background: #f39c12; color: white; }
        .btn-warning:hover { background: #e67e22; }
        
        /* Right Panel */
        .panel-section {
            padding: 15px;
            margin: 10px;
            background: white;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .panel-title {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 2px solid #3498db;
        }
        .status-item {
            padding: 8px;
            margin: 5px 0;
            background: #f8f9fa;
            border-left: 3px solid #3498db;
            border-radius: 2px;
        }
        .status-item.exception { border-left-color: #e74c3c; }
        
        /* Loading */
        .loading {
            text-align: center;
            padding: 20px;
            color: #7f8c8d;
        }
        
        /* Select */
        select, input {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="app-container">
        <!-- Left Sidebar -->
        <div class="sidebar">
            <div style="padding: 20px; background: #1a252f; font-size: 18px; font-weight: 600;">
                <i class="fas fa-industry"></i> 생산관리
            </div>
            <div id="nav-menu"></div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <!-- Header -->
            <div class="header">
                <h1 style="font-size: 20px; color: #2c3e50;">
                    <i class="fas fa-clipboard-list"></i>
                    CP_DP 트라이얼파일조리
                </h1>
                <div style="color: #7f8c8d;">
                    <i class="far fa-clock"></i>
                    <span id="current-time"></span>
                </div>
            </div>
            
            <!-- Filter Section -->
            <div class="filter-section">
                <div style="display: flex; gap: 15px; align-items: center;">
                    <label>작업장:</label>
                    <select id="workCenterSelect" style="width: 200px;">
                        <option value="">전체</option>
                    </select>
                    
                    <label>필터:</label>
                    <select id="filterSelect" style="width: 150px;">
                        <option value="ALL">전체</option>
                        <option value="NORMAL">정상</option>
                        <option value="WARNING">경고</option>
                        <option value="ERROR">오류</option>
                    </select>
                    
                    <button class="btn btn-primary" onclick="loadData()">
                        <i class="fas fa-sync-alt"></i> 조회
                    </button>
                </div>
            </div>
            
            <!-- Table -->
            <div class="table-container">
                <table id="dataTable">
                    <thead>
                        <tr>
                            <th width="40"><input type="checkbox" id="checkAll"></th>
                            <th width="60">No</th>
                            <th>모델명</th>
                            <th>공정코드</th>
                            <th>단위</th>
                            <th>수량</th>
                            <th>상태</th>
                            <th>작업장</th>
                            <th>시작시간</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                        <tr>
                            <td colspan="9" class="loading">
                                <i class="fas fa-spinner fa-spin"></i> 데이터를 불러오는 중...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Button Group -->
            <div class="btn-group">
                <button class="btn btn-success" onclick="handleAction('start')">
                    <i class="fas fa-play"></i> 시작
                </button>
                <button class="btn btn-danger" onclick="handleAction('stop')">
                    <i class="fas fa-stop"></i> 종료
                </button>
                <button class="btn btn-warning" onclick="handleAction('resolve')">
                    <i class="fas fa-wrench"></i> 공정이상해제
                </button>
                <button class="btn btn-primary" onclick="handleAction('material')">
                    <i class="fas fa-boxes"></i> 원재료확인
                </button>
            </div>
        </div>
        
        <!-- Right Panel -->
        <div class="right-panel">
            <div class="panel-section">
                <div class="panel-title">
                    <i class="fas fa-check-circle"></i> 벤치확인
                </div>
                <div id="benchStatus">
                    <div class="loading">데이터 없음</div>
                </div>
            </div>
            
            <div class="panel-section">
                <div class="panel-title">
                    <i class="fas fa-exclamation-triangle"></i> 예외확인
                </div>
                <div id="exceptionStatus">
                    <div class="loading">데이터 없음</div>
                </div>
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
