const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fleek-ticketing.onrender.com';

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
    try {
      console.log(`🚀 Searching BigQuery orders for: "${searchQuery}"`);
      
      const response = await this.request<ApiResponse<Order[]>>(`/api/search/orders?q=${encodeURIComponent(searchQuery)}&limit=${limit}`);
      
      if (response.success && response.data) {
        console.log(`✅ Found ${response.data.length} results from BigQuery`);
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
      console.error('Error searching BigQuery orders:', error);
      throw error;
    }
  }

  async getOrder(orderLineId: string): Promise<Order> {
    try {
      const response = await this.request<ApiResponse<Order>>(`/api/orders/${orderLineId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch order');
      }
    } catch (error) {
      console.error(`Error fetching order ${orderLineId} from BigQuery:`, error);
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