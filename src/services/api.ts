const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fleek-ticketing.onrender.com';
const DISABLE_BACKEND_API = import.meta.env.VITE_DISABLE_BACKEND_API === 'true';

// Mock orders for fallback when API is not available
const MOCK_ORDERS: Order[] = [
  { orderLineId: 'ORD-001', orderValue: 99.99, currency: 'GBP' },
  { orderLineId: 'ORD-002', orderValue: 149.50, currency: 'USD' },
  { orderLineId: 'ORD-003', orderValue: 75.00, currency: 'EUR' },
  { orderLineId: 'FL-12345', orderValue: 299.99, currency: 'GBP' },
  { orderLineId: 'FL-67890', orderValue: 189.00, currency: 'USD' },
  { orderLineId: 'FLEEK-001', orderValue: 45.99, currency: 'GBP' },
  { orderLineId: 'FLEEK-002', orderValue: 125.50, currency: 'EUR' },
];

export interface Order {
  orderLineId: string;
  orderValue: number;
  currency: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
  message?: string;
  suggestions?: string[];
  searchStats?: {
    exactMatches: number;
    prefixMatches: number;
    containsMatches: number;
    fuzzyMatches: number;
  };
  cacheInfo?: {
    totalOrders: number;
    lastUpdated: string;
    source: string;
    searchTimeMs?: number;
  };
}

class ApiService {
  private getMockSearchResults(searchQuery: string, limit: number) {
    // Filter mock orders based on search query
    const filteredOrders = MOCK_ORDERS.filter(order => 
      order.orderLineId.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, limit);
    
    const suggestions = MOCK_ORDERS
      .map(order => order.orderLineId)
      .filter(id => id.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
    
    return {
      orders: filteredOrders,
      suggestions,
      searchStats: {
        exactMatches: filteredOrders.length,
        prefixMatches: 0,
        containsMatches: filteredOrders.length,
        fuzzyMatches: 0
      },
      cacheInfo: {
        totalOrders: MOCK_ORDERS.length,
        lastUpdated: new Date().toISOString(),
        source: 'mock-data',
        searchTimeMs: 5
      }
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out - please check your internet connection or try again later');
        }
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to server - please check if the backend is running');
        }
      }
      
      throw error;
    }
  }

  async getOrders(): Promise<Order[]> {
    // Deprecated: This loads all orders and can crash the UI
    // Use searchOrders instead for better performance
    console.warn('getOrders() is deprecated. Use searchOrders() for better performance.');
    return [];
  }

  async searchOrders(searchQuery: string, limit: number = 50): Promise<{
    orders: Order[];
    suggestions: string[];
    searchStats?: any;
    cacheInfo?: any;
  }> {
    // If backend API is disabled, use mock data directly
    if (DISABLE_BACKEND_API) {
      console.log('🔄 Backend API disabled, using mock data for search:', searchQuery);
      return this.getMockSearchResults(searchQuery, limit);
    }

    try {
      console.log(`🚀 Fast cached search for: "${searchQuery}"`);
      
      const response = await this.request<ApiResponse<Order[]>>(`/api/search/orders?q=${encodeURIComponent(searchQuery)}&limit=${limit}`);
      
      if (response.success && response.data) {
        console.log(`✅ Found ${response.data.length} results from cached data`);
        console.log(`📊 Cache info: ${response.cacheInfo?.totalOrders} total orders, updated ${response.cacheInfo?.lastUpdated}`);
        
        return {
          orders: response.data,
          suggestions: response.suggestions || [],
          searchStats: response.searchStats,
          cacheInfo: response.cacheInfo
        };
      } else {
        throw new Error(response.error || response.message || 'Failed to search orders');
      }
    } catch (error) {
      console.error('Error searching cached orders from API:', error);
      console.log('🔄 Falling back to mock data...');
      return this.getMockSearchResults(searchQuery, limit);
    }
  }

  async getOrder(orderLineId: string): Promise<Order> {
    // If backend API is disabled, use mock data
    if (DISABLE_BACKEND_API) {
      const mockOrder = MOCK_ORDERS.find(order => order.orderLineId === orderLineId);
      if (mockOrder) {
        return mockOrder;
      } else {
        throw new Error('Order not found in mock data');
      }
    }

    try {
      const response = await this.request<ApiResponse<Order>>(`/api/orders/${orderLineId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch order');
      }
    } catch (error) {
      console.error(`Error fetching order ${orderLineId}:`, error);
      // Fallback to mock data
      const mockOrder = MOCK_ORDERS.find(order => order.orderLineId === orderLineId);
      if (mockOrder) {
        console.log('📦 Using mock order data for:', orderLineId);
        return mockOrder;
      }
      throw error;
    }
  }

  async checkHealth(): Promise<{ status: string; message: string }> {
    try {
      return await this.request<{ status: string; message: string }>('/health');
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  async checkDebug(): Promise<any> {
    try {
      return await this.request<any>('/debug');
    } catch (error) {
      console.error('Debug check failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();