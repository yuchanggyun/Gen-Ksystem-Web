import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { executeSP } from '../lib/db';

const api = new Hono();

// Enable CORS for API routes
api.use('/*', cors());

/**
 * GET /api/production/list
 * Get production data list
 */
api.get('/production/list', async (c) => {
  try {
    const { workCenter, filter } = c.req.query();
    
    // Call stored procedure
    // Example: EXEC sp_GetProductionList @WorkCenter='WC001', @Filter='ALL'
    const result = await executeSP(
      'sp_GetProductionList',
      {
        WorkCenter: workCenter || '',
        Filter: filter || 'ALL'
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
    console.error('Error in /api/production/list:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * POST /api/production/start
 * Start production process
 */
api.post('/production/start', async (c) => {
  try {
    const body = await c.req.json();
    const { itemId, workCenter } = body;

    // Call stored procedure
    // Example: EXEC sp_StartProduction @ItemId=123, @WorkCenter='WC001'
    const result = await executeSP(
      'sp_StartProduction',
      {
        ItemId: itemId,
        WorkCenter: workCenter
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
    console.error('Error in /api/production/start:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * POST /api/production/complete
 * Complete production process
 */
api.post('/production/complete', async (c) => {
  try {
    const body = await c.req.json();
    const { itemId, quantity } = body;

    // Call stored procedure
    const result = await executeSP(
      'sp_CompleteProduction',
      {
        ItemId: itemId,
        Quantity: quantity
      },
      c.env
    );

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({
      success: true,
      message: '작업이 완료되었습니다.',
      data: result.recordset
    });
  } catch (error) {
    console.error('Error in /api/production/complete:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * GET /api/workcenter/list
 * Get work center list
 */
api.get('/workcenter/list', async (c) => {
  try {
    const result = await executeSP(
      'sp_GetWorkCenterList',
      {},
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
    console.error('Error in /api/workcenter/list:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * GET /api/status/bench
 * Get bench status
 */
api.get('/status/bench', async (c) => {
  try {
    const result = await executeSP(
      'sp_GetBenchStatus',
      {},
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
    console.error('Error in /api/status/bench:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * GET /api/status/exception
 * Get exception status
 */
api.get('/status/exception', async (c) => {
  try {
    const result = await executeSP(
      'sp_GetExceptionStatus',
      {},
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
    console.error('Error in /api/status/exception:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

export default api;
