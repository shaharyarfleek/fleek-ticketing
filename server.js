const express = require('express');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins (you can restrict this in production)
app.use(cors());
app.use(express.json());

// Handle BigQuery authentication for Render deployment
let bigqueryConfig = {
  projectId: process.env.BIGQUERY_PROJECT_ID || 'dogwood-baton-345622'
};

console.log('🔧 Environment Variables Debug:', {
  BIGQUERY_PROJECT_ID: process.env.BIGQUERY_PROJECT_ID,
  BIGQUERY_DATASET_ID: process.env.BIGQUERY_DATASET_ID,
  BIGQUERY_TABLE_ID: process.env.BIGQUERY_TABLE_ID,
  GOOGLE_APPLICATION_CREDENTIALS_JSON: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
  BIGQUERY_CREDENTIALS: !!process.env.BIGQUERY_CREDENTIALS,
  GOOGLE_APPLICATION_CREDENTIALS: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectIdFromConfig: bigqueryConfig.projectId
});

// Force correct project ID for fleek
if (!process.env.BIGQUERY_PROJECT_ID) {
  bigqueryConfig.projectId = 'dogwood-baton-345622';
  console.log('🔧 Forcing project ID to dogwood-baton-345622 since env var not set');
}

// If running on Render with credentials in env variable
const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.BIGQUERY_CREDENTIALS;
if (credentialsJson) {
  try {
    const credentialsPath = path.join(__dirname, 'temp-credentials.json');
    fs.writeFileSync(credentialsPath, credentialsJson);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    console.log('✅ Created temporary credentials file from environment variable');
  } catch (error) {
    console.error('❌ Failed to create credentials file:', error);
  }
} else if (process.env.BIGQUERY_KEY_FILE) {
  bigqueryConfig.keyFilename = process.env.BIGQUERY_KEY_FILE;
}

// Initialize BigQuery client
const bigquery = new BigQuery(bigqueryConfig);

// Cache for orders data
let ordersCache = [];
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Load orders from BigQuery
async function loadOrdersFromBigQuery() {
  try {
    console.log('📊 Loading orders from BigQuery...');
    
    // First, let's get the table schema to understand available columns
    const tableName = `${bigqueryConfig.projectId}.${process.env.BIGQUERY_DATASET_ID || 'fleek_raw'}.${process.env.BIGQUERY_TABLE_ID || 'order_line_status_details'}`;
    
    console.log('🔍 Checking table schema for:', tableName);
    
    // Simple query to get first few rows and understand the structure
    const exploreQuery = `
      SELECT *
      FROM \`${tableName}\`
      WHERE order_line_id IS NOT NULL
      LIMIT 5
    `;
    
    const [exploreRows] = await bigquery.query({ query: exploreQuery });
    
    if (exploreRows.length > 0) {
      console.log('📋 Available columns:', Object.keys(exploreRows[0]));
      console.log('📄 Sample row:', exploreRows[0]);
    }
    
    // Build query using the correct column name: orderValue (not order_value)
    const query = `
      SELECT DISTINCT 
        order_line_id as orderLineId,
        CAST(COALESCE(orderValue, 0) as FLOAT64) as orderValue,
        COALESCE(currency, 'GBP') as currency
      FROM \`${tableName}\`
      WHERE order_line_id IS NOT NULL
      LIMIT 10000
    `;
    
    console.log('🔧 Generated query:', query);

    const [rows] = await bigquery.query({ query });
    
    ordersCache = rows;
    cacheTimestamp = new Date();
    
    console.log(`✅ Loaded ${ordersCache.length} orders from BigQuery`);
    return ordersCache;
  } catch (error) {
    console.error('❌ Error loading orders from BigQuery:', error);
    throw error;
  }
}

// Initialize cache on startup
loadOrdersFromBigQuery().catch(error => {
  console.error('❌ Failed to load initial data from BigQuery:', error);
  console.log('⚠️ Server will continue running but order search will not work until BigQuery is configured');
});

// Refresh cache periodically
setInterval(() => {
  if (ordersCache.length > 0) { // Only refresh if we have initial data
    loadOrdersFromBigQuery().catch(console.error);
  }
}, CACHE_DURATION);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'BigQuery API is running',
    cacheInfo: {
      totalOrders: ordersCache.length,
      lastUpdated: cacheTimestamp,
      source: 'bigquery'
    }
  });
});

// Test endpoint (no BigQuery required)
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    version: '2.5',
    timestamp: new Date().toISOString(),
    env: {
      hasProjectId: !!process.env.BIGQUERY_PROJECT_ID,
      hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || !!process.env.BIGQUERY_CREDENTIALS || !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: bigqueryConfig.projectId,
      credentialsSource: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ? 'GOOGLE_APPLICATION_CREDENTIALS_JSON' : 
                         process.env.BIGQUERY_CREDENTIALS ? 'BIGQUERY_CREDENTIALS' : 
                         process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'GOOGLE_APPLICATION_CREDENTIALS' : 'none'
    }
  });
});

// Debug endpoint to check environment variables
app.get('/api/debug', (req, res) => {
  const envVars = {};
  
  // Only show BigQuery related env vars for security
  Object.keys(process.env).forEach(key => {
    if (key.includes('BIGQUERY') || key.includes('GOOGLE_APPLICATION')) {
      envVars[key] = key.includes('CREDENTIALS') ? '***SET***' : process.env[key];
    }
  });
  
  res.json({
    success: true,
    message: 'Debug info',
    version: '2.2',
    timestamp: new Date().toISOString(),
    environmentVariables: envVars,
    credentialsChecks: {
      GOOGLE_APPLICATION_CREDENTIALS_JSON: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      BIGQUERY_CREDENTIALS: !!process.env.BIGQUERY_CREDENTIALS,
      GOOGLE_APPLICATION_CREDENTIALS: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      combinedCheck: !!(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.BIGQUERY_CREDENTIALS)
    }
  });
});

// Debug BigQuery table structure
app.get('/api/debug-bigquery', async (req, res) => {
  try {
    const tableName = `${bigqueryConfig.projectId}.${process.env.BIGQUERY_DATASET_ID || 'fleek_raw'}.${process.env.BIGQUERY_TABLE_ID || 'order_line_status_details'}`;
    
    // Test 1: Get table schema
    const schemaQuery = `
      SELECT column_name, data_type
      FROM \`${bigqueryConfig.projectId}.fleek_raw.INFORMATION_SCHEMA.COLUMNS\`
      WHERE table_name = 'order_line_status_details'
      ORDER BY ordinal_position
    `;
    
    // Test 2: Get a few sample rows to see actual data
    const sampleQuery = `
      SELECT *
      FROM \`${tableName}\`
      LIMIT 5
    `;
    
    // Test 3: Count total rows
    const countQuery = `
      SELECT COUNT(*) as total_rows
      FROM \`${tableName}\`
    `;
    
    // Test 4: Count rows with order_line_id
    const countWithOrderIdQuery = `
      SELECT COUNT(*) as rows_with_order_id
      FROM \`${tableName}\`
      WHERE order_line_id IS NOT NULL
    `;
    
    const [schemaResults] = await bigquery.query({ query: schemaQuery });
    const [sampleResults] = await bigquery.query({ query: sampleQuery });
    const [countResults] = await bigquery.query({ query: countQuery });
    const [countWithOrderIdResults] = await bigquery.query({ query: countWithOrderIdQuery });
    
    res.json({
      success: true,
      tableName,
      schema: schemaResults,
      sampleData: sampleResults,
      totalRows: countResults[0]?.total_rows,
      rowsWithOrderId: countWithOrderIdResults[0]?.rows_with_order_id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to debug BigQuery table'
    });
  }
});

// Search orders endpoint
app.get('/api/search/orders', async (req, res) => {
  try {
    const { q = '', limit = 50 } = req.query;
    const searchQuery = q.toLowerCase();
    
    console.log(`🔍 Searching for: "${searchQuery}"`);
    
    // Check if we have any data
    if (ordersCache.length === 0) {
      console.log('⚠️ No orders in cache, attempting to load from BigQuery...');
      try {
        await loadOrdersFromBigQuery();
      } catch (error) {
        return res.status(503).json({
          success: false,
          error: 'BigQuery service unavailable',
          message: 'Unable to connect to BigQuery. Please check configuration.',
          details: error.message
        });
      }
    }
    
    // Check if cache needs refresh
    if (cacheTimestamp && Date.now() - cacheTimestamp > CACHE_DURATION) {
      loadOrdersFromBigQuery().catch(console.error); // Don't wait, use existing cache
    }
    
    // Search in cached data - handle different data types safely
    const filteredOrders = ordersCache.filter(order => {
      if (!order.orderLineId) return false;
      
      // Convert to string and handle different data types
      const orderIdStr = String(order.orderLineId).toLowerCase();
      return orderIdStr.includes(searchQuery);
    }).slice(0, parseInt(limit));
    
    // Generate suggestions - handle different data types safely
    const suggestions = [...new Set(
      ordersCache
        .filter(order => {
          if (!order.orderLineId) return false;
          const orderIdStr = String(order.orderLineId).toLowerCase();
          return orderIdStr.includes(searchQuery);
        })
        .map(order => String(order.orderLineId))
        .slice(0, 10)
    )];
    
    // Calculate search stats - handle different data types safely
    const searchStats = {
      exactMatches: filteredOrders.filter(o => String(o.orderLineId).toLowerCase() === searchQuery).length,
      prefixMatches: filteredOrders.filter(o => String(o.orderLineId).toLowerCase().startsWith(searchQuery)).length,
      containsMatches: filteredOrders.length,
      fuzzyMatches: 0
    };
    
    res.json({
      success: true,
      data: filteredOrders,
      count: filteredOrders.length,
      suggestions,
      searchStats,
      cacheInfo: {
        totalOrders: ordersCache.length,
        lastUpdated: cacheTimestamp,
        source: 'bigquery',
        searchTimeMs: Date.now() - new Date().getTime()
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to search orders'
    });
  }
});

// Get single order endpoint
app.get('/api/orders/:orderLineId', (req, res) => {
  try {
    const { orderLineId } = req.params;
    const order = ordersCache.find(o => String(o.orderLineId) === orderLineId);
    
    if (order) {
      res.json({
        success: true,
        data: order
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BigQuery API server running on port ${PORT} - v2.1`);
  console.log(`📊 Project: ${bigqueryConfig.projectId}`);
  console.log(`📊 Dataset: ${process.env.BIGQUERY_DATASET_ID || 'fleek_raw'}`);
  console.log(`📊 Table: ${process.env.BIGQUERY_TABLE_ID || 'order_line_status_details'}`);
  console.log(`🔑 Credentials available: ${!!credentialsJson}`);
});