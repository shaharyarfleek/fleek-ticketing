import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { BigQuery } from '@google-cloud/bigquery';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize BigQuery
const bigquery = new BigQuery({
  projectId: process.env.BIGQUERY_PROJECT_ID || process.env.VITE_BIGQUERY_PROJECT_ID,
  credentials: process.env.BIGQUERY_CREDENTIALS ? 
    JSON.parse(process.env.BIGQUERY_CREDENTIALS) : 
    process.env.VITE_BIGQUERY_CREDENTIALS ? 
      JSON.parse(process.env.VITE_BIGQUERY_CREDENTIALS) : undefined,
  keyFilename: process.env.BIGQUERY_KEY_PATH || process.env.VITE_BIGQUERY_KEY_PATH
});

const datasetId = process.env.BIGQUERY_DATASET_ID || process.env.VITE_BIGQUERY_DATASET_ID || 'fleek_raw';
const tableId = process.env.BIGQUERY_TABLE_ID || process.env.VITE_BIGQUERY_TABLE_ID || 'order_line_status_details';

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'BigQuery API Server is running',
    timestamp: new Date().toISOString(),
    version: 'unlimited-orders-v2.0-deployed',
    nodeEnv: process.env.NODE_ENV,
    deploymentTime: new Date().toISOString()
  });
});

// Debug endpoint to check BigQuery configuration
app.get('/debug', (req: Request, res: Response) => {
  try {
    res.json({
      status: 'Debug Info',
      config: {
        projectId: process.env.BIGQUERY_PROJECT_ID || process.env.VITE_BIGQUERY_PROJECT_ID || 'NOT SET',
        datasetId: datasetId,
        tableId: tableId,
        hasCredentials: !!(process.env.BIGQUERY_CREDENTIALS || process.env.VITE_BIGQUERY_CREDENTIALS),
        credentialsLength: (process.env.BIGQUERY_CREDENTIALS || process.env.VITE_BIGQUERY_CREDENTIALS)?.length || 0,
        keyFilename: process.env.BIGQUERY_KEY_PATH || process.env.VITE_BIGQUERY_KEY_PATH || 'NOT SET'
      },
      allEnvVars: {
        BIGQUERY_PROJECT_ID: !!process.env.BIGQUERY_PROJECT_ID,
        VITE_BIGQUERY_PROJECT_ID: !!process.env.VITE_BIGQUERY_PROJECT_ID,
        BIGQUERY_CREDENTIALS: !!process.env.BIGQUERY_CREDENTIALS,
        VITE_BIGQUERY_CREDENTIALS: !!process.env.VITE_BIGQUERY_CREDENTIALS,
        BIGQUERY_DATASET_ID: !!process.env.BIGQUERY_DATASET_ID,
        VITE_BIGQUERY_DATASET_ID: !!process.env.VITE_BIGQUERY_DATASET_ID,
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        projectId: process.env.BIGQUERY_PROJECT_ID || process.env.VITE_BIGQUERY_PROJECT_ID || 'NOT SET',
        hasCredentials: !!(process.env.BIGQUERY_CREDENTIALS || process.env.VITE_BIGQUERY_CREDENTIALS)
      }
    });
  }
});

// Test endpoint to show current query
app.get('/api/query-test', (req: Request, res: Response) => {
  const query = `
    SELECT DISTINCT 
      fleek_id as orderLineId,
      total_order_line_amount as orderValue
    FROM \`${process.env.BIGQUERY_PROJECT_ID || process.env.VITE_BIGQUERY_PROJECT_ID}.${datasetId}.${tableId}\`
    WHERE fleek_id IS NOT NULL
    ORDER BY fleek_id
  `;
  
  res.json({
    currentQuery: query,
    hasLimit: query.includes('LIMIT'),
    projectId: process.env.BIGQUERY_PROJECT_ID || process.env.VITE_BIGQUERY_PROJECT_ID,
    timestamp: new Date().toISOString()
  });
});

// Get count of orders
app.get('/api/orders/count', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT COUNT(DISTINCT fleek_id) as total_orders
      FROM \`${process.env.BIGQUERY_PROJECT_ID || process.env.VITE_BIGQUERY_PROJECT_ID}.${datasetId}.${tableId}\`
      WHERE fleek_id IS NOT NULL
    `;

    console.log('Executing count query:', query);
    const [rows] = await bigquery.query({ query });
    
    res.json({
      success: true,
      total_orders: rows[0]?.total_orders || 0
    });
  } catch (error) {
    console.error('Error fetching orders count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders count',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search orders by query
app.get('/api/orders/search', async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'Enter search query to find orders'
      });
    }

    const query = `
      SELECT DISTINCT 
        fleek_id as orderLineId,
        total_order_line_amount as orderValue
      FROM \`${process.env.BIGQUERY_PROJECT_ID || process.env.VITE_BIGQUERY_PROJECT_ID}.${datasetId}.${tableId}\`
      WHERE fleek_id IS NOT NULL 
        AND LOWER(fleek_id) LIKE LOWER(@searchQuery)
      ORDER BY fleek_id
      LIMIT @limit
    `;

    const options = {
      query,
      params: { 
        searchQuery: `%${searchQuery}%`,
        limit: limit 
      }
    };

    console.log('Executing search query:', query, 'with params:', options.params);
    const [rows] = await bigquery.query(options);
    
    const ordersWithCurrency = rows
      .filter((row: any) => row.orderLineId && row.orderLineId.trim() !== '')
      .map((row: any) => ({
        orderLineId: row.orderLineId,
        orderValue: row.orderValue || 0,
        currency: 'GBP'
      }));

    res.json({
      success: true,
      data: ordersWithCurrency,
      count: ordersWithCurrency.length,
      searchQuery: searchQuery,
      limit: limit
    });
  } catch (error) {
    console.error('Error searching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search orders',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all order line IDs (deprecated - use search instead)
app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT DISTINCT 
        fleek_id as orderLineId,
        total_order_line_amount as orderValue
      FROM \`${process.env.BIGQUERY_PROJECT_ID || process.env.VITE_BIGQUERY_PROJECT_ID}.${datasetId}.${tableId}\`
      WHERE fleek_id IS NOT NULL
      ORDER BY fleek_id
    `;

    console.log('Executing query:', query);
    const [rows] = await bigquery.query({ query });
    
    // Add default currency since it's not in the table and filter out null values
    const ordersWithCurrency = rows
      .filter((row: any) => row.orderLineId && row.orderLineId.trim() !== '')
      .map((row: any) => ({
        orderLineId: row.orderLineId,
        orderValue: row.orderValue || 0,
        currency: 'GBP'
      }));

    res.json({
      success: true,
      data: ordersWithCurrency,
      count: ordersWithCurrency.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: {
        projectId: process.env.BIGQUERY_PROJECT_ID || process.env.VITE_BIGQUERY_PROJECT_ID,
        datasetId: datasetId,
        tableId: tableId,
        hasCredentials: !!(process.env.BIGQUERY_CREDENTIALS || process.env.VITE_BIGQUERY_CREDENTIALS)
      }
    });
  }
});

// Get specific order details
app.get('/api/orders/:orderLineId', async (req: Request, res: Response) => {
  try {
    const { orderLineId } = req.params;
    
    const query = `
      SELECT 
        fleek_id as orderLineId,
        total_order_line_amount as orderValue
      FROM \`${process.env.BIGQUERY_PROJECT_ID || process.env.VITE_BIGQUERY_PROJECT_ID}.${datasetId}.${tableId}\`
      WHERE fleek_id = @orderLineId
      LIMIT 1
    `;

    const options = {
      query,
      params: { orderLineId }
    };

    const [rows] = await bigquery.query(options);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const order = {
      orderLineId: rows[0].orderLineId,
      orderValue: rows[0].orderValue,
      currency: 'GBP'
    };

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order details',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`BigQuery API Server v2.0 running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Orders endpoint: http://localhost:${PORT}/api/orders`);
  console.log(`Loading unlimited orders from BigQuery...`);
});