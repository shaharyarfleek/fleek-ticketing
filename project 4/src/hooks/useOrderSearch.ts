import { useState } from 'react';
import { apiService, Order } from '../services/api';

interface UseOrderSearchState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  searchOrders: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useOrderSearch = (): UseOrderSearchState => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchOrders = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setOrders([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const searchResults = await apiService.searchOrders(searchQuery, 50);
      setOrders(searchResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search orders';
      setError(errorMessage);
      console.error('Error searching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setOrders([]);
    setError(null);
    setLoading(false);
  };

  return {
    orders,
    loading,
    error,
    searchOrders,
    clearSearch,
  };
};