import { bigQueryService, OrderData } from './bigquery';

export class OrderApiService {
  private static cache: Map<string, { data: OrderData[], timestamp: number }> = new Map();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getOrderLineIds(): Promise<OrderData[]> {
    const cacheKey = 'orderLineIds';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const data = await bigQueryService.fetchOrderLineIds();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching order line IDs:', error);
      throw error;
    }
  }

  static async getOrderDetails(orderLineId: string): Promise<OrderData | null> {
    const cacheKey = `order_${orderLineId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.data.length > 0 && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data[0];
    }

    try {
      const data = await bigQueryService.fetchOrderDetails(orderLineId);
      if (data) {
        this.cache.set(cacheKey, { data: [data], timestamp: Date.now() });
      }
      return data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  static clearCache(): void {
    this.cache.clear();
  }
}