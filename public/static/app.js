// API Base URL
const API_BASE = '/api';

// Global state
let selectedWorkArea = null;
let selectedProductionPlan = null;
let selectedProcessWork = null;
let selectedWorkers = [];

/**
 * Initialize application
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Application initializing...');
    
    // Update clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Initialize filters
    initFilters();
    
    // Call initial load API (replaces separate loadWorkers)
    loadInitialData();
    
    // Set default dates
    setDefaultDates();
});

/**
 * Initial data load - calls SP that returns DataBlock1 and DataBlock2
 * Based on POP 화면 초기 로딩 메소드
 */
async function loadInitialData() {
    try {
        console.log('Loading initial data from SP...');
        
        // Get current filter values
        const factUnit = document.getElementById('plantSelect')?.value || '';
        const deptSeq = 0;  // Default dept
        const plantCode = factUnit;
        
        const response = await axios.get(`${API_BASE}/initial-load`, {
            params: { factUnit, deptSeq, plantCode }
        });
        
        if (response.data.success) {
            const { dataBlock1, dataBlock2 } = response.data.data;
            
            // DataBlock1: Work areas and production plans
            if (dataBlock1 && dataBlock1.length > 0) {
                console.log('DataBlock1 loaded:', dataBlock1.length, 'rows');
                // TODO: Process DataBlock1 - work areas and production plans
            }
            
            // DataBlock2: Workers (left/right split)
            if (dataBlock2 && dataBlock2.length > 0) {
                console.log('DataBlock2 loaded:', dataBlock2.length, 'workers');
                renderWorkers(dataBlock2);
            } else {
                // Fallback to separate API if SP not available
                loadWorkers();
            }
            
            console.log('Initial data loaded successfully');
        } else {
            console.error('Initial load failed:', response.data.error);
            // Fallback to separate API calls
            loadWorkers();
        }
    } catch (error) {
        console.error('Error in initial load:', error);
        // Fallback to separate API calls
        loadWorkers();
    }
}

/**
 * Update clock display
 */
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const clockEl = document.getElementById('current-time');
    if (clockEl) {
        clockEl.textContent = timeString;
    }
}

/**
 * Initialize filter dropdowns
 */
async function initFilters() {
    try {
        // Load plants
        const plantResponse = await axios.get(`${API_BASE}/filter/plants`);
        if (plantResponse.data.success) {
            populateSelect('plantSelect', plantResponse.data.data, 'code', 'name');
        }
        
        // Load models
        const modelResponse = await axios.get(`${API_BASE}/filter/models`);
        if (modelResponse.data.success) {
            populateSelect('modelSelect', modelResponse.data.data, 'code', 'name');
        }
        
        // Load work centers
        const wcResponse = await axios.get(`${API_BASE}/filter/workcenters`);
        if (wcResponse.data.success) {
            populateSelect('workCenterSelect', wcResponse.data.data, 'code', 'name');
        }
        
        // Load processes
        const processResponse = await axios.get(`${API_BASE}/filter/processes`);
        if (processResponse.data.success) {
            populateSelect('processSelect', processResponse.data.data, 'code', 'name');
        }
    } catch (error) {
        console.error('Error loading filters:', error);
        // Use mock data
        populateSelect('plantSelect', [
            { code: 'P001', name: '1공장' },
            { code: 'P002', name: '2공장' }
        ], 'code', 'name');
        
        populateSelect('modelSelect', [
            { code: 'CP619', name: 'CP619Z1' },
            { code: 'CP865', name: 'CP865921' }
        ], 'code', 'name');
        
        populateSelect('workCenterSelect', [
            { code: 'WC001', name: '작업센터1' },
            { code: 'WC002', name: '작업센터2' }
        ], 'code', 'name');
        
        populateSelect('processSelect', [
            { code: 'PR001', name: '공정1' },
            { code: 'PR002', name: '공정2' }
        ], 'code', 'name');
    }
}

/**
 * Populate select element
 */
function populateSelect(elementId, data, valueField, textField) {
    const select = document.getElementById(elementId);
    if (!select) return;
    
    const currentValue = select.value;
    const options = data.map(item => 
        `<option value="${item[valueField]}">${item[textField]}</option>`
    ).join('');
    
    select.innerHTML = '<option value="">선택</option>' + options;
    select.value = currentValue;
}

/**
 * Set default dates (today)
 */
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    document.getElementById('endDate').value = today;
}

/**
 * Load all work areas
 */
async function loadAllWorkAreas() {
    const plant = document.getElementById('plantSelect').value;
    
    if (!plant) {
        alert('생산사업장을 선택해주세요.');
        return;
    }
    
    try {
        const response = await axios.get(`${API_BASE}/work-area/list`, {
            params: { plant }
        });
        
        if (response.data.success) {
            renderWorkAreas(response.data.data);
        }
    } catch (error) {
        console.error('Error loading work areas:', error);
        // Use mock data
        renderWorkAreas([
            { code: 'WA001', name: '작업구역1' },
            { code: 'WA002', name: '작업구역2' },
            { code: 'WA003', name: '작업구역3' },
            { code: 'WA004', name: '작업구역4' }
        ]);
    }
}

/**
 * Render work areas
 */
function renderWorkAreas(data) {
    const tbody = document.getElementById('workAreaTable');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="empty-state">데이터가 없습니다</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => `
        <tr class="clickable" onclick="selectWorkArea('${item.code}')">
            <td>${item.code}</td>
            <td>${item.name}</td>
        </tr>
    `).join('');
}

/**
 * Select work area
 */
async function selectWorkArea(code) {
    selectedWorkArea = code;
    
    // Highlight selected row
    document.querySelectorAll('#workAreaTable tr').forEach(tr => tr.classList.remove('selected'));
    event.target.closest('tr').classList.add('selected');
    
    // Load production plans for selected work area
    await loadProductionPlans(code);
    
    // Clear other grids
    clearGrid('processWorkTable', 4, '생산계획을 선택하세요');
    clearGrid('workProgressTable', 7, '공정작업을 선택하세요');
    
    updateButtonStates();
}

/**
 * Load production plans
 */
async function loadProductionPlans(workAreaCode) {
    try {
        const response = await axios.get(`${API_BASE}/production-plan/list`, {
            params: {
                workArea: workAreaCode,
                model: document.getElementById('modelSelect').value,
                startDate: document.getElementById('startDate').value,
                endDate: document.getElementById('endDate').value
            }
        });
        
        if (response.data.success) {
            renderProductionPlans(response.data.data);
        }
    } catch (error) {
        console.error('Error loading production plans:', error);
        // Use mock data
        renderProductionPlans([
            { id: 1, model: 'CP619Z1', machine: '001', planDate: '2026-01-18', quantity: 100, processProgress: '3/5', status: 'running' },
            { id: 2, model: 'CP865921', machine: '002', planDate: '2026-01-18', quantity: 150, processProgress: '1/5', status: 'waiting' },
            { id: 3, model: 'CP823921', machine: '003', planDate: '2026-01-18', quantity: 120, processProgress: '5/5', status: 'completed' }
        ]);
    }
}

/**
 * Render production plans
 */
function renderProductionPlans(data) {
    const tbody = document.getElementById('productionPlanTable');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">데이터가 없습니다</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => {
        // 공정진행 정보 생성 (예: 3/5 완료)
        const processProgress = item.processProgress || '0/0';
        
        return `
        <tr class="clickable status-${item.status}" onclick="selectProductionPlan(${item.id})">
            <td>${item.model}</td>
            <td>${item.machine}</td>
            <td>${item.planDate}</td>
            <td>${item.quantity}</td>
            <td style="font-weight: 600; color: #3498db;">${processProgress}</td>
            <td><span class="status-badge ${item.status}">${getStatusText(item.status)}</span></td>
        </tr>
        `;
    }).join('');
}

/**
 * Select production plan
 */
async function selectProductionPlan(planId) {
    selectedProductionPlan = planId;
    
    // Highlight selected row
    document.querySelectorAll('#productionPlanTable tr').forEach(tr => tr.classList.remove('selected'));
    event.target.closest('tr').classList.add('selected');
    
    // Load process works
    await loadProcessWorks(planId);
    
    // Clear work progress
    clearGrid('workProgressTable', 7, '공정작업을 선택하세요');
    
    updateButtonStates();
}

/**
 * Load process works
 */
async function loadProcessWorks(planId) {
    try {
        const response = await axios.get(`${API_BASE}/process-work/list`, {
            params: { planId }
        });
        
        if (response.data.success) {
            renderProcessWorks(response.data.data);
        }
    } catch (error) {
        console.error('Error loading process works:', error);
        // Use mock data
        renderProcessWorks([
            { id: 1, code: 'PR001', name: '전처리', sequence: 1, status: 'completed' },
            { id: 2, code: 'PR002', name: '가공', sequence: 2, status: 'running' },
            { id: 3, code: 'PR003', name: '조립', sequence: 3, status: 'waiting' },
            { id: 4, code: 'PR004', name: '검사', sequence: 4, status: 'waiting' }
        ]);
    }
}

/**
 * Render process works
 */
function renderProcessWorks(data) {
    const tbody = document.getElementById('processWorkTable');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">데이터가 없습니다</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => `
        <tr class="clickable status-${item.status}" onclick="selectProcessWork(${item.id})">
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.sequence}</td>
            <td><span class="status-badge ${item.status}">${getStatusText(item.status)}</span></td>
        </tr>
    `).join('');
}

/**
 * Select process work
 */
async function selectProcessWork(workId) {
    selectedProcessWork = workId;
    
    // Highlight selected row
    document.querySelectorAll('#processWorkTable tr').forEach(tr => tr.classList.remove('selected'));
    event.target.closest('tr').classList.add('selected');
    
    // Load work progress
    await loadWorkProgress(workId);
    
    updateButtonStates();
}

/**
 * Load work progress
 */
async function loadWorkProgress(workId) {
    try {
        const response = await axios.get(`${API_BASE}/work-progress/list`, {
            params: { workId }
        });
        
        if (response.data.success) {
            renderWorkProgress(response.data.data);
        }
    } catch (error) {
        console.error('Error loading work progress:', error);
        // Use mock data
        renderWorkProgress([
            { id: 1, workId: 'W001', processName: '가공', worker: '홍길동', startTime: '2026-01-18 09:00:00', elapsed: '02:35:00', quantity: 45, status: 'running' },
            { id: 2, workId: 'W002', processName: '가공', worker: '김철수', startTime: '2026-01-18 09:30:00', elapsed: '02:05:00', quantity: 38, status: 'running' }
        ]);
    }
}

/**
 * Render work progress
 */
function renderWorkProgress(data) {
    const tbody = document.getElementById('workProgressTable');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">진행중인 작업이 없습니다</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => `
        <tr class="status-${item.status}">
            <td>${item.workId}</td>
            <td>${item.processName}</td>
            <td>${item.worker}</td>
            <td>${item.startTime}</td>
            <td>${item.elapsed}</td>
            <td>${item.quantity}</td>
            <td><span class="status-badge ${item.status}">${getStatusText(item.status)}</span></td>
        </tr>
    `).join('');
}

/**
 * Load workers
 */
async function loadWorkers() {
    try {
        const response = await axios.get(`${API_BASE}/worker/list`);
        
        if (response.data.success) {
            renderWorkers(response.data.data);
        }
    } catch (error) {
        console.error('Error loading workers:', error);
        // Use mock data
        renderWorkers([
            { id: 1, empNo: 'E001', name: '홍길동' },
            { id: 2, empNo: 'E002', name: '김철수' },
            { id: 3, empNo: 'E003', name: '이영희' },
            { id: 4, empNo: 'E004', name: '박민수' }
        ]);
    }
}

/**
 * Render workers
 */
function renderWorkers(data) {
    const tbody = document.getElementById('workerTable');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">작업자가 없습니다</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(item => `
        <tr>
            <td><input type="checkbox" onchange="toggleWorker(${item.id})"></td>
            <td>${item.empNo}</td>
            <td>${item.name}</td>
        </tr>
    `).join('');
}

/**
 * Toggle worker selection
 */
function toggleWorker(workerId) {
    if (selectedWorkers.includes(workerId)) {
        selectedWorkers = selectedWorkers.filter(id => id !== workerId);
    } else {
        selectedWorkers.push(workerId);
    }
    updateButtonStates();
}

/**
 * Get status text
 */
function getStatusText(status) {
    const statusMap = {
        'running': '진행중',
        'waiting': '대기',
        'completed': '완료',
        'error': '오류'
    };
    return statusMap[status] || status;
}

/**
 * Update button states
 */
function updateButtonStates() {
    const btnStart = document.getElementById('btnStart');
    const btnEnd = document.getElementById('btnEnd');
    const btnResolve = document.getElementById('btnResolve');
    
    // Start button: enabled when process work is selected and workers are selected
    btnStart.disabled = !(selectedProcessWork && selectedWorkers.length > 0);
    
    // End button: enabled when process work is selected
    btnEnd.disabled = !selectedProcessWork;
    
    // Resolve button: enabled when process work is selected
    btnResolve.disabled = !selectedProcessWork;
}

/**
 * Handle start action
 */
async function handleStart() {
    if (!selectedProcessWork || selectedWorkers.length === 0) {
        alert('공정작업과 작업자를 선택해주세요.');
        return;
    }
    
    const confirmed = confirm(`선택한 작업을 시작하시겠습니까?\n작업자: ${selectedWorkers.length}명`);
    if (!confirmed) return;
    
    try {
        const response = await axios.post(`${API_BASE}/work/start`, {
            processWorkId: selectedProcessWork,
            workers: selectedWorkers
        });
        
        if (response.data.success) {
            alert('작업이 시작되었습니다.');
            // Reload work progress
            await loadWorkProgress(selectedProcessWork);
        }
    } catch (error) {
        console.error('Error starting work:', error);
        alert('작업 시작 중 오류가 발생했습니다.');
    }
}

/**
 * Handle end action
 */
async function handleEnd() {
    if (!selectedProcessWork) {
        alert('공정작업을 선택해주세요.');
        return;
    }
    
    const confirmed = confirm('선택한 작업을 종료하시겠습니까?');
    if (!confirmed) return;
    
    try {
        const response = await axios.post(`${API_BASE}/work/end`, {
            processWorkId: selectedProcessWork
        });
        
        if (response.data.success) {
            alert('작업이 종료되었습니다.');
            // Reload data
            await loadWorkProgress(selectedProcessWork);
            if (selectedProductionPlan) {
                await loadProcessWorks(selectedProductionPlan);
            }
        }
    } catch (error) {
        console.error('Error ending work:', error);
        alert('작업 종료 중 오류가 발생했습니다.');
    }
}

/**
 * Handle resolve action
 */
async function handleResolve() {
    if (!selectedProcessWork) {
        alert('공정작업을 선택해주세요.');
        return;
    }
    
    const confirmed = confirm('공정이상을 해제하시겠습니까?');
    if (!confirmed) return;
    
    try {
        const response = await axios.post(`${API_BASE}/work/resolve`, {
            processWorkId: selectedProcessWork
        });
        
        if (response.data.success) {
            alert('공정이상이 해제되었습니다.');
            // Reload data
            if (selectedProductionPlan) {
                await loadProcessWorks(selectedProductionPlan);
            }
        }
    } catch (error) {
        console.error('Error resolving issue:', error);
        alert('공정이상 해제 중 오류가 발생했습니다.');
    }
}

/**
 * Clear grid
 */
function clearGrid(tableId, colspan, message) {
    const tbody = document.getElementById(tableId);
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">${message}</td></tr>`;
}

/**
 * Reset all grids
 */
function resetAllGrids() {
    selectedWorkArea = null;
    selectedProductionPlan = null;
    selectedProcessWork = null;
    selectedWorkers = [];
    
    clearGrid('workAreaTable', 2, '전체작업구역 조회를 클릭하세요');
    clearGrid('productionPlanTable', 6, '작업구역을 선택하세요');
    clearGrid('processWorkTable', 4, '생산계획을 선택하세요');
    clearGrid('workProgressTable', 7, '공정작업을 선택하세요');
    
    updateButtonStates();
}

console.log('app.js loaded successfully');
