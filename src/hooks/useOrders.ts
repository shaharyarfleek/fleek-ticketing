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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      console.error('Error fetching orders from BigQuery:', err);
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