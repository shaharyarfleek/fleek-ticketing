import { useState, useEffect } from 'react';
import { apiService, Order } from '../services/api';

interface UseOrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useOrders = (): UseOrdersState => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedOrders = await apiService.getOrders();
      setOrders(fetchedOrders);
      
      // Check if we're using fallback data
      if (fetchedOrders.length > 0 && fetchedOrders[0].orderLineId === 'FL-2024-8834') {
        console.log('Using sample orders (BigQuery connection may be unavailable)');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(`Unable to connect to BigQuery. ${errorMessage}`);
      console.error('Error fetching orders:', err);
      
      // Still set empty orders on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
};