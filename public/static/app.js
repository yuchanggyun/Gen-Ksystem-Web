// API Base URL
const API_BASE = '/api';

// Global state
let currentData = [];
let selectedItems = new Set();

/**
 * Initialize application
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Application initializing...');
    
    // Update clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Initialize navigation
    initNavigation();
    
    // Load initial data
    loadWorkCenters();
    loadData();
    loadBenchStatus();
    loadExceptionStatus();
    
    // Setup event listeners
    setupEventListeners();
    
    // Refresh data every 30 seconds
    setInterval(() => {
        loadData();
        loadBenchStatus();
        loadExceptionStatus();
    }, 30000);
});

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
 * Initialize navigation menu
 */
function initNavigation() {
    const navItems = [
        { icon: 'fas fa-clipboard-list', text: 'CP_DP 트라이얼파일조리', active: true },
        { icon: 'fas fa-cogs', text: 'CP_DP 10단계' },
        { icon: 'fas fa-tools', text: 'CP_DP 4 5 6차' },
        { icon: 'fas fa-wrench', text: 'CP_DP 사상화' },
        { icon: 'fas fa-box', text: 'CP_DP 메인조립' },
        { icon: 'fas fa-paint-brush', text: 'CP_DP 사상내열' },
        { icon: 'fas fa-flask', text: 'CP_DP 소결체' },
        { icon: 'fas fa-chart-line', text: 'CP_DP 시작' },
        { icon: 'fas fa-list', text: 'CP_DP 노점' },
        { icon: 'fas fa-check-square', text: 'CP_DP 재작업' },
        { icon: 'fas fa-file-alt', text: 'CP_DP 워가구' },
        { icon: 'fas fa-database', text: 'CP_DP 마무리가공' },
        { icon: 'fas fa-cube', text: 'CP_DP 포장 5 6차' }
    ];
    
    const navMenu = document.getElementById('nav-menu');
    navMenu.innerHTML = navItems.map(item => `
        <div class="nav-item ${item.active ? 'active' : ''}" onclick="switchMenu('${item.text}')">
            <i class="${item.icon}"></i> ${item.text}
        </div>
    `).join('');
}

/**
 * Switch menu
 */
function switchMenu(menuName) {
    console.log('Switching to menu:', menuName);
    // Remove active class from all items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    // Add active class to clicked item
    event.target.closest('.nav-item').classList.add('active');
    
    // Update header title
    document.querySelector('.header h1').innerHTML = `
        <i class="fas fa-clipboard-list"></i> ${menuName}
    `;
    
    // Reload data for new menu
    loadData();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Check all checkbox
    const checkAll = document.getElementById('checkAll');
    if (checkAll) {
        checkAll.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#tableBody input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
                const itemId = cb.dataset.id;
                if (e.target.checked) {
                    selectedItems.add(itemId);
                } else {
                    selectedItems.delete(itemId);
                }
            });
        });
    }
}

/**
 * Load work centers
 */
async function loadWorkCenters() {
    try {
        const response = await axios.get(`${API_BASE}/workcenter/list`);
        if (response.data.success) {
            const select = document.getElementById('workCenterSelect');
            const options = response.data.data.map(wc => 
                `<option value="${wc.code}">${wc.name}</option>`
            ).join('');
            select.innerHTML = '<option value="">전체</option>' + options;
        }
    } catch (error) {
        console.error('Error loading work centers:', error);
        // Use mock data if API fails
        console.log('Using mock work centers data');
    }
}

/**
 * Load production data
 */
async function loadData() {
    const workCenter = document.getElementById('workCenterSelect')?.value || '';
    const filter = document.getElementById('filterSelect')?.value || 'ALL';
    
    try {
        const response = await axios.get(`${API_BASE}/production/list`, {
            params: { workCenter, filter }
        });
        
        if (response.data.success) {
            currentData = response.data.data;
            renderTable(currentData);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // Use mock data if API fails
        useMockData();
    }
}

/**
 * Use mock data for development
 */
function useMockData() {
    console.log('Using mock data');
    currentData = [
        { id: 1, modelName: 'CP619Z1', processCode: 'CPBP90066', unit: 'EA', quantity: 1340, status: 'normal', workCenter: 'WC001', startTime: '2026-01-18 09:00' },
        { id: 2, modelName: 'CP865921M8AB', processCode: 'CP865921', unit: 'EA', quantity: 1393, status: 'normal', workCenter: 'WC001', startTime: '2026-01-18 09:15' },
        { id: 3, modelName: 'CP823921M6AB', processCode: 'CP823921', unit: 'EA', quantity: 1244, status: 'warning', workCenter: 'WC002', startTime: '2026-01-18 09:30' },
        { id: 4, modelName: 'CP996921M6AB', processCode: 'CP965A27', unit: 'EA', quantity: 1680, status: 'normal', workCenter: 'WC001', startTime: '2026-01-18 10:00' },
        { id: 5, modelName: 'CP962921M6AB', processCode: 'CP662CN', unit: 'EA', quantity: 923, status: 'normal', workCenter: 'WC003', startTime: '2026-01-18 10:15' },
        { id: 6, modelName: 'CP963921QABGN', processCode: 'CP962CN', unit: 'EA', quantity: 1320, status: 'error', workCenter: 'WC002', startTime: '2026-01-18 10:30' }
    ];
    renderTable(currentData);
}

/**
 * Render data table
 */
function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">데이터가 없습니다.</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map((item, index) => `
        <tr class="status-${item.status || 'normal'}">
            <td><input type="checkbox" data-id="${item.id}" onchange="toggleSelect('${item.id}')"></td>
            <td>${index + 1}</td>
            <td>${item.modelName || '-'}</td>
            <td>${item.processCode || '-'}</td>
            <td>${item.unit || '-'}</td>
            <td>${item.quantity || 0}</td>
            <td>
                ${item.status === 'normal' ? '<span style="color: #2ecc71;">●</span> 정상' : ''}
                ${item.status === 'warning' ? '<span style="color: #f39c12;">●</span> 경고' : ''}
                ${item.status === 'error' ? '<span style="color: #e74c3c;">●</span> 오류' : ''}
            </td>
            <td>${item.workCenter || '-'}</td>
            <td>${item.startTime || '-'}</td>
        </tr>
    `).join('');
}

/**
 * Toggle item selection
 */
function toggleSelect(itemId) {
    if (selectedItems.has(itemId)) {
        selectedItems.delete(itemId);
    } else {
        selectedItems.add(itemId);
    }
    console.log('Selected items:', Array.from(selectedItems));
}

/**
 * Load bench status
 */
async function loadBenchStatus() {
    try {
        const response = await axios.get(`${API_BASE}/status/bench`);
        if (response.data.success) {
            renderBenchStatus(response.data.data);
        }
    } catch (error) {
        console.error('Error loading bench status:', error);
        // Use mock data
        renderBenchStatus([
            { name: 'CP_DP 메인조립', count: 5 },
            { name: 'CP_DP 사상화', count: 3 }
        ]);
    }
}

/**
 * Render bench status
 */
function renderBenchStatus(data) {
    const container = document.getElementById('benchStatus');
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="loading">데이터 없음</div>';
        return;
    }
    
    container.innerHTML = data.map(item => `
        <div class="status-item">
            <i class="fas fa-check-circle" style="color: #2ecc71;"></i>
            ${item.name || item.text} ${item.count ? `(${item.count})` : ''}
        </div>
    `).join('');
}

/**
 * Load exception status
 */
async function loadExceptionStatus() {
    try {
        const response = await axios.get(`${API_BASE}/status/exception`);
        if (response.data.success) {
            renderExceptionStatus(response.data.data);
        }
    } catch (error) {
        console.error('Error loading exception status:', error);
        // Use mock data
        renderExceptionStatus([
            { name: 'CP_DP 4 5 6차', count: 2 },
            { name: 'CP_DP 사상내열', count: 1 }
        ]);
    }
}

/**
 * Render exception status
 */
function renderExceptionStatus(data) {
    const container = document.getElementById('exceptionStatus');
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="loading">데이터 없음</div>';
        return;
    }
    
    container.innerHTML = data.map(item => `
        <div class="status-item exception">
            <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
            ${item.name || item.text} ${item.count ? `(${item.count})` : ''}
        </div>
    `).join('');
}

/**
 * Handle action buttons
 */
async function handleAction(action) {
    if (selectedItems.size === 0) {
        alert('항목을 선택해주세요.');
        return;
    }
    
    const actionNames = {
        start: '시작',
        stop: '종료',
        resolve: '공정이상해제',
        material: '원재료확인'
    };
    
    const confirmed = confirm(`선택한 ${selectedItems.size}개 항목을 ${actionNames[action]}하시겠습니까?`);
    if (!confirmed) return;
    
    try {
        let endpoint = '';
        switch (action) {
            case 'start':
                endpoint = '/production/start';
                break;
            case 'stop':
                endpoint = '/production/complete';
                break;
            case 'resolve':
                endpoint = '/production/resolve';
                break;
            case 'material':
                endpoint = '/production/material-check';
                break;
        }
        
        // Send request for each selected item
        const promises = Array.from(selectedItems).map(itemId => {
            const item = currentData.find(d => d.id == itemId);
            return axios.post(`${API_BASE}${endpoint}`, {
                itemId: itemId,
                workCenter: item?.workCenter,
                quantity: item?.quantity
            });
        });
        
        await Promise.all(promises);
        
        alert(`${actionNames[action]} 작업이 완료되었습니다.`);
        
        // Clear selection and reload data
        selectedItems.clear();
        document.getElementById('checkAll').checked = false;
        loadData();
        
    } catch (error) {
        console.error(`Error in ${action} action:`, error);
        alert(`작업 중 오류가 발생했습니다: ${error.message}`);
    }
}

console.log('app.js loaded successfully');
