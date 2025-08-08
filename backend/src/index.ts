import express from 'express';
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
  projectId: process.env.VITE_BIGQUERY_PROJECT_ID,
  credentials: process.env.VITE_BIGQUERY_CREDENTIALS ? 
    JSON.parse(process.env.VITE_BIGQUERY_CREDENTIALS) : undefined,
  keyFilename: process.env.VITE_BIGQUERY_KEY_PATH
});

const datasetId = process.env.VITE_BIGQUERY_DATASET_ID || 'fleek_raw';
const tableId = process.env.VITE_BIGQUERY_TABLE_ID || 'order_line_status_details';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'BigQuery API Server is running' });
});

// Get all order line IDs
app.get('/api/orders', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT 
        fleek_id as orderLineId,
        total_order_line_amount as orderValue
      FROM \`${process.env.VITE_BIGQUERY_PROJECT_ID}.${datasetId}.${tableId}\`
      LIMIT 1000
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
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get specific order details
app.get('/api/orders/:orderLineId', async (req, res) => {
  try {
    const { orderLineId } = req.params;
    
    const query = `
      SELECT 
        fleek_id as orderLineId,
        total_order_line_amount as orderValue
      FROM \`${process.env.VITE_BIGQUERY_PROJECT_ID}.${datasetId}.${tableId}\`
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
  console.log(`BigQuery API Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Orders endpoint: http://localhost:${PORT}/api/orders`);
});