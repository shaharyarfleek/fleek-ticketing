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
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const response = await this.request<ApiResponse<Order[]>>('/api/orders');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      // Fallback to sample orders if BigQuery fails
      console.warn('Using fallback sample orders due to API error');
      return [
        { orderLineId: 'FL-2024-8834', orderValue: 299.99, currency: 'GBP' },
        { orderLineId: 'FL-2024-7721', orderValue: 2450.00, currency: 'GBP' },
        { orderLineId: 'FL-2024-6543', orderValue: 1250.00, currency: 'GBP' },
        { orderLineId: 'FL-2024-5432', orderValue: 129.99, currency: 'GBP' },
        { orderLineId: 'FL-2024-3210', orderValue: 1250.00, currency: 'GBP' },
        { orderLineId: 'FL-2024-2109', orderValue: 159.99, currency: 'GBP' },
        { orderLineId: '62495', orderValue: 1250.00, currency: 'GBP' }
      ];
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
      console.error(`Error fetching order ${orderLineId}:`, error);
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
}

export const apiService = new ApiService();