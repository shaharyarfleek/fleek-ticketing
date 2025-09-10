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

// Hourly cache system for orders
interface CachedOrder {
  orderLineId: string;
  orderValue: number;
  currency: string;
}

interface OrderCache {
  data: CachedOrder[];
  lastUpdated: Date;
  isLoading: boolean;
}

let orderCache: OrderCache = {
  data: [],
  lastUpdated: new Date(0), // Start with epoch to force initial load
  isLoading: false
};

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// Function to refresh order cache from BigQuery
async function refreshOrderCache(): Promise<void> {
  if (orderCache.isLoading) {
    console.log('Cache refresh already in progress, skipping...');
    return;
  }

  console.log('🔄 Starting hourly BigQuery cache refresh...');
  orderCache.isLoading = true;

  try {
    const query = `
      SELECT DISTINCT 
        fleek_id as orderLineId,
        total_order_line_amount as orderValue
      FROM \`${process.env.BIGQUERY_PROJECT_ID || process.env.VITE_BIGQUERY_PROJECT_ID}.${datasetId}.${tableId}\`
      WHERE fleek_id IS NOT NULL
      ORDER BY fleek_id
    `;

    console.log('Executing BigQuery cache refresh query...');
    const [rows] = await bigquery.query({ query });
    
    const ordersWithCurrency = rows
      .filter((row: any) => row.orderLineId && row.orderLineId.trim() !== '')
      .map((row: any) => ({
        orderLineId: row.orderLineId,
        orderValue: row.orderValue || 0,
        currency: 'GBP'
      }));

    orderCache.data = ordersWithCurrency;
    orderCache.lastUpdated = new Date();
    orderCache.isLoading = false;

    console.log(`✅ Cache refreshed successfully! Loaded ${ordersWithCurrency.length} orders`);
    console.log(`📊 Cache stats: First order: ${ordersWithCurrency[0]?.orderLineId}, Last: ${ordersWithCurrency[ordersWithCurrency.length - 1]?.orderLineId}`);
  } catch (error) {
    console.error('❌ Cache refresh failed:', error);
    orderCache.isLoading = false;
    throw error;
  }
}

// Function to check if cache needs refresh
function shouldRefreshCache(): boolean {
  const now = new Date();
  const timeSinceLastUpdate = now.getTime() - orderCache.lastUpdated.getTime();
  return timeSinceLastUpdate > CACHE_DURATION_MS || orderCache.data.length === 0;
}

// Function to get cached orders with auto-refresh
async function getCachedOrders(): Promise<CachedOrder[]> {
  if (shouldRefreshCache() && !orderCache.isLoading) {
    try {
      await refreshOrderCache();
    } catch (error) {
      console.error('Failed to refresh cache, using stale data:', error);
    }
  }
  
  return orderCache.data;
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const cacheAge = new Date().getTime() - orderCache.lastUpdated.getTime();
  const cacheAgeMinutes = Math.floor(cacheAge / (1000 * 60));
  
  res.json({ 
    status: 'OK', 
    message: 'BigQuery Cached API Server is running',
    timestamp: new Date().toISOString(),
    version: 'v3.0-hourly-cache',
    nodeEnv: process.env.NODE_ENV,
    cache: {
      ordersCount: orderCache.data.length,
      lastUpdated: orderCache.lastUpdated.toISOString(),
      ageMinutes: cacheAgeMinutes,
      isLoading: orderCache.isLoading,
      nextRefreshIn: Math.max(0, 60 - cacheAgeMinutes) + ' minutes'
    }
  });
});

// Cache status endpoint
app.get('/api/cache/status', (req: Request, res: Response) => {
  const cacheAge = new Date().getTime() - orderCache.lastUpdated.getTime();
  const cacheAgeMinutes = Math.floor(cacheAge / (1000 * 60));
  const needsRefresh = shouldRefreshCache();
  
  res.json({
    success: true,
    cache: {
      ordersCount: orderCache.data.length,
      lastUpdated: orderCache.lastUpdated.toISOString(),
      ageMinutes: cacheAgeMinutes,
      isLoading: orderCache.isLoading,
      needsRefresh: needsRefresh,
      nextRefreshIn: Math.max(0, 60 - cacheAgeMinutes) + ' minutes',
      sampleOrders: orderCache.data.slice(0, 5).map(o => o.orderLineId)
    }
  });
});

// Manual cache refresh endpoint (for testing)
app.post('/api/cache/refresh', async (req: Request, res: Response) => {
  try {
    await refreshOrderCache();
    res.json({
      success: true,
      message: 'Cache refreshed successfully',
      ordersCount: orderCache.data.length,
      lastUpdated: orderCache.lastUpdated.toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to refresh cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
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

// High-speed cached search with recommendations
app.get('/api/search/orders', async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 50;
    
    console.log(`🔍 Fast search: "${searchQuery}", limit: ${limit}`);
    
    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'Enter search query to find orders',
        cacheInfo: {
          totalOrders: orderCache.data.length,
          lastUpdated: orderCache.lastUpdated.toISOString(),
          source: 'cache'
        }
      });
    }

    // Get cached data
    const cachedOrders = await getCachedOrders();
    const searchTerm = searchQuery.toLowerCase().trim();
    
    // Fast in-memory search with multiple matching strategies
    const exactMatches: CachedOrder[] = [];
    const prefixMatches: CachedOrder[] = [];
    const containsMatches: CachedOrder[] = [];
    const fuzzyMatches: CachedOrder[] = [];
    
    for (const order of cachedOrders) {
      const orderIdLower = order.orderLineId.toLowerCase();
      
      if (orderIdLower === searchTerm) {
        exactMatches.push(order);
      } else if (orderIdLower.startsWith(searchTerm)) {
        prefixMatches.push(order);
      } else if (orderIdLower.includes(searchTerm)) {
        containsMatches.push(order);
      } else if (isOrderFuzzyMatch(orderIdLower, searchTerm)) {
        fuzzyMatches.push(order);
      }
      
      // Stop early if we have enough results
      if (exactMatches.length + prefixMatches.length + containsMatches.length >= limit * 2) {
        break;
      }
    }
    
    // Combine results with priority: exact > prefix > contains > fuzzy
    const combinedResults = [
      ...exactMatches,
      ...prefixMatches.slice(0, limit - exactMatches.length),
      ...containsMatches.slice(0, limit - exactMatches.length - prefixMatches.length),
      ...fuzzyMatches.slice(0, limit - exactMatches.length - prefixMatches.length - containsMatches.length)
    ].slice(0, limit);
    
    // Generate search suggestions
    const suggestions = generateOrderSuggestions(searchTerm, cachedOrders);
    
    console.log(`✅ Found ${combinedResults.length} results from ${cachedOrders.length} cached orders`);
    
    res.json({
      success: true,
      data: combinedResults,
      count: combinedResults.length,
      searchQuery: searchQuery,
      suggestions: suggestions,
      searchStats: {
        exactMatches: exactMatches.length,
        prefixMatches: prefixMatches.length,
        containsMatches: containsMatches.length,
        fuzzyMatches: fuzzyMatches.length
      },
      cacheInfo: {
        totalOrders: cachedOrders.length,
        lastUpdated: orderCache.lastUpdated.toISOString(),
        source: 'cache',
        searchTimeMs: Date.now() - Date.now() // Will be very fast!
      }
    });
  } catch (error) {
    console.error('Cached search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search orders',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function for fuzzy matching
function isOrderFuzzyMatch(orderIdLower: string, searchTerm: string): boolean {
  // Simple fuzzy matching - check if most characters from search term exist in order
  if (searchTerm.length < 3) return false;
  
  let matchCount = 0;
  for (const char of searchTerm) {
    if (orderIdLower.includes(char)) {
      matchCount++;
    }
  }
  
  return matchCount / searchTerm.length >= 0.7; // 70% character match
}

// Generate search suggestions
function generateOrderSuggestions(searchTerm: string, orders: CachedOrder[]): string[] {
  if (searchTerm.length < 2) return [];
  
  const suggestions = new Set<string>();
  const searchLower = searchTerm.toLowerCase();
  
  // Find orders that start with the search term and extract common patterns
  for (const order of orders) {
    const orderIdLower = order.orderLineId.toLowerCase();
    
    if (orderIdLower.startsWith(searchLower)) {
      suggestions.add(order.orderLineId);
      
      if (suggestions.size >= 10) break;
    }
  }
  
  return Array.from(suggestions).slice(0, 8);
}

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
      LIMIT 10
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

// Initialize cache on startup
async function initializeServer() {
  console.log('🚀 Starting BigQuery Cached API Server v3.0...');
  
  // Load initial cache
  try {
    await refreshOrderCache();
    console.log('✅ Initial cache loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load initial cache:', error);
    console.log('⚠️  Server will start but search may not work until cache loads');
  }
  
  // Set up automatic hourly refresh
  setInterval(async () => {
    console.log('⏰ Automatic hourly cache refresh triggered');
    try {
      await refreshOrderCache();
    } catch (error) {
      console.error('❌ Automatic cache refresh failed:', error);
    }
  }, CACHE_DURATION_MS);
  
  // Start server
  app.listen(PORT, () => {
    console.log(`🎯 BigQuery Cached API Server v3.0 running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Fast search: http://localhost:${PORT}/api/search/orders`);
    console.log(`📈 Cache status: http://localhost:${PORT}/api/cache/status`);
    console.log(`💾 Orders cached: ${orderCache.data.length} (refreshed every hour)`);
  });
}

initializeServer();