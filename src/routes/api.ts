import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { executeSP } from '../lib/db';

const api = new Hono();

// Enable CORS for API routes
api.use('/*', cors());

// ==================== Initial Load API ====================

/**
 * GET /api/initial-load
 * Initial screen loading - returns both DataBlock1 and DataBlock2
 * 
 * DataBlock1: Work area + Production plan data
 * DataBlock2: Worker data (left/right split algorithm)
 * 
 * Based on SP logic:
 * 1. FactUnit 조회
 * 2. DataBlock1 생성 (조회범위, 필터조건, JOIN구조)
 * 3. DataBlock2 생성 (부서 작업자 → 좌우 분할)
 * 4. 결과 반환
 */
api.get('/initial-load', async (c) => {
  try {
    const { factUnit, deptSeq, plantCode } = c.req.query();
    
    // Execute main SP for initial load
    const result = await executeSP(
      'sp_POP_GetInitialData',
      {
        FactUnit: factUnit || '',
        DeptSeq: deptSeq || 0,
        PlantCode: plantCode || ''
      },
      c.env
    );
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    // SP returns multiple recordsets:
    // recordsets[0] = DataBlock1 (work areas + production plans)
    // recordsets[1] = DataBlock2 (workers with left/right split)
    const recordsets = result.recordsets || [];
    
    return c.json({
      success: true,
      data: {
        dataBlock1: recordsets[0] || [],  // Work area + Production plan
        dataBlock2: recordsets[1] || []   // Workers (left/right split)
      },
      message: '초기 데이터 로딩 완료'
    });
  } catch (error) {
    console.error('Error in /api/initial-load:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '초기 데이터 로딩 실패'
    }, 500);
  }
});

// ==================== Filter APIs ====================

/**
 * GET /api/filter/plants
 * Get plant list
 */
api.get('/filter/plants', async (c) => {
  try {
    const result = await executeSP('sp_GetPlantList', {}, c.env);
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({
      success: true,
      data: result.recordset || []
    });
  } catch (error) {
    console.error('Error in /api/filter/plants:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * GET /api/filter/models
 * Get model list
 */
api.get('/filter/models', async (c) => {
  try {
    const result = await executeSP('sp_GetModelList', {}, c.env);
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({
      success: true,
      data: result.recordset || []
    });
  } catch (error) {
    console.error('Error in /api/filter/models:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * GET /api/filter/workcenters
 * Get work center list
 */
api.get('/filter/workcenters', async (c) => {
  try {
    const result = await executeSP('sp_GetWorkCenterList', {}, c.env);
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({
      success: true,
      data: result.recordset || []
    });
  } catch (error) {
    console.error('Error in /api/filter/workcenters:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * GET /api/filter/processes
 * Get process list
 */
api.get('/filter/processes', async (c) => {
  try {
    const result = await executeSP('sp_GetProcessList', {}, c.env);
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({
      success: true,
      data: result.recordset || []
    });
  } catch (error) {
    console.error('Error in /api/filter/processes:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// ==================== Work Area APIs ====================

/**
 * GET /api/work-area/list
 * Get work area list
 */
api.get('/work-area/list', async (c) => {
  try {
    const { plant } = c.req.query();
    
    const result = await executeSP(
      'sp_GetWorkAreaList',
      { Plant: plant },
      c.env
    );
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({
      success: true,
      data: result.recordset || []
    });
  } catch (error) {
    console.error('Error in /api/work-area/list:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// ==================== Production Plan APIs ====================

/**
 * GET /api/production-plan/list
 * Get production plan list
 */
api.get('/production-plan/list', async (c) => {
  try {
    const { workArea, model, startDate, endDate } = c.req.query();
    
    const result = await executeSP(
      'sp_GetProductionPlanList',
      {
        WorkArea: workArea,
        Model: model || '',
        StartDate: startDate,
        EndDate: endDate
      },
      c.env
    );
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({
      success: true,
      data: result.recordset || []
    });
  } catch (error) {
    console.error('Error in /api/production-plan/list:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// ==================== Process Work APIs ====================

/**
 * GET /api/process-work/list
 * Get process work list for a production plan
 */
api.get('/process-work/list', async (c) => {
  try {
    const { planId } = c.req.query();
    
    const result = await executeSP(
      'sp_GetProcessWorkList',
      { PlanId: planId },
      c.env
    );
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({
      success: true,
      data: result.recordset || []
    });
  } catch (error) {
    console.error('Error in /api/process-work/list:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// ==================== Process Flow APIs ====================

/**
 * GET /api/process-flow/list
 * Get process flow for a production plan
 */
api.get('/process-flow/list', async (c) => {
  try {
    const { planId } = c.req.query();
    
    const result = await executeSP(
      'sp_GetProcessFlowList',
      { PlanId: planId },
      c.env
    );
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({
      success: true,
      data: result.recordset || []
    });
  } catch (error) {
    console.error('Error in /api/process-flow/list:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// ==================== Worker APIs ====================

/**
 * GET /api/worker/list
 * Get worker list
 */
api.get('/worker/list', async (c) => {
  try {
    const result = await executeSP('sp_GetWorkerList', {}, c.env);
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({
      success: true,
      data: result.recordset || []
    });
  } catch (error) {
    console.error('Error in /api/worker/list:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// ==================== Work Progress APIs ====================

/**
 * GET /api/work-progress/list
 * Get work progress for a process work
 */
api.get('/work-progress/list', async (c) => {
  try {
    const { workId } = c.req.query();
    
    const result = await executeSP(
      'sp_GetWorkProgressList',
      { WorkId: workId },
      c.env
    );
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({
      success: true,
      data: result.recordset || []
    });
  } catch (error) {
    console.error('Error in /api/work-progress/list:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// ==================== Work Action APIs ====================

/**
 * POST /api/work/start
 * Start work
 */
api.post('/work/start', async (c) => {
  try {
    const body = await c.req.json();
    const { processWorkId, workers } = body;
    
    const result = await executeSP(
      'sp_StartWork',
      {
        ProcessWorkId: processWorkId,
        Workers: JSON.stringify(workers)
      },
      c.env
    );
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({
      success: true,
      message: '작업이 시작되었습니다.',
      data: result.recordset
    });
  } catch (error) {
    console.error('Error in /api/work/start:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * POST /api/work/end
 * End work
 */
api.post('/work/end', async (c) => {
  try {
    const body = await c.req.json();
    const { processWorkId } = body;
    
    const result = await executeSP(
      'sp_EndWork',
      { ProcessWorkId: processWorkId },
      c.env
    );
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({
      success: true,
      message: '작업이 종료되었습니다.',
      data: result.recordset
    });
  } catch (error) {
    console.error('Error in /api/work/end:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * POST /api/work/resolve
 * Resolve work issue
 */
api.post('/work/resolve', async (c) => {
  try {
    const body = await c.req.json();
    const { processWorkId } = body;
    
    const result = await executeSP(
      'sp_ResolveWorkIssue',
      { ProcessWorkId: processWorkId },
      c.env
    );
    
    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }
    
    return c.json({
      success: true,
      message: '공정이상이 해제되었습니다.',
      data: result.recordset
    });
  } catch (error) {
    console.error('Error in /api/work/resolve:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

export default api;
