// Backend API URL - adjust if your backend runs on a different port
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface OrderData {
  orderLineId: string;
  orderValue: number;
  currency?: string;
  orderDate?: Date;
  customerName?: string;
}

class BigQueryService {
  async fetchOrderLineIds(): Promise<OrderData[]> {
    try {
      const response = await fetch(`${API_URL}/api/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const result = await response.json();
      // Filter out any orders with null/empty orderLineId
      const validOrders = result.data.filter((order: OrderData) => 
        order.orderLineId && order.orderLineId.trim() !== ''
      );
      return validOrders;
    } catch (error) {
      console.error('Error fetching orders from API:', error);
      console.info('Falling back to mock data');
      return this.getMockOrderData();
    }
  }

  async fetchOrderDetails(orderLineId: string): Promise<OrderData | null> {
    try {
      const response = await fetch(`${API_URL}/api/orders/${encodeURIComponent(orderLineId)}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch order details');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching order details from API:', error);
      return this.getMockOrderDetails(orderLineId);
    }
  }

  private getMockOrderData(): OrderData[] {
    return [
      { orderLineId: 'FL-2024-8834', orderValue: 299.99, currency: 'GBP' },
      { orderLineId: 'FL-2024-7721', orderValue: 2450.00, currency: 'GBP' },
      { orderLineId: 'FL-2024-6543', orderValue: 1250.00, currency: 'GBP' },
      { orderLineId: 'FL-2024-5432', orderValue: 129.99, currency: 'GBP' },
      { orderLineId: 'FL-2024-3210', orderValue: 1250.00, currency: 'GBP' },
      { orderLineId: 'FL-2024-2109', orderValue: 159.99, currency: 'GBP' },
      { orderLineId: 'FL-2024-1001', orderValue: 89.99, currency: 'USD' },
      { orderLineId: 'FL-2024-1002', orderValue: 450.00, currency: 'EUR' },
      { orderLineId: 'FL-2024-1003', orderValue: 799.99, currency: 'GBP' },
      { orderLineId: 'FL-2024-1004', orderValue: 199.99, currency: 'GBP' },
      { orderLineId: '62495', orderValue: 1250.00, currency: 'GBP' }
    ];
  }

  private getMockOrderDetails(orderLineId: string): OrderData | null {
    const orders = this.getMockOrderData();
    return orders.find(order => order.orderLineId === orderLineId) || null;
  }
}

export const bigQueryService = new BigQueryService();