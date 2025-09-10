import { useState } from 'react';
import { apiService, Order } from '../services/api';

interface UseOrderSearchState {
  orders: Order[];
  suggestions: string[];
  loading: boolean;
  error: string | null;
  searchStats?: any;
  cacheInfo?: any;
  searchOrders: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useOrderSearch = (): UseOrderSearchState => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchStats, setSearchStats] = useState<any>(null);
  const [cacheInfo, setCacheInfo] = useState<any>(null);

  const searchOrders = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setOrders([]);
      setSuggestions([]);
      setError(null);
      setSearchStats(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.searchOrders(searchQuery, 50);
      
      setOrders(result.orders);
      setSuggestions(result.suggestions);
      setSearchStats(result.searchStats);
      setCacheInfo(result.cacheInfo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search orders';
      setError(errorMessage);
      console.error('Error searching orders:', err);
      setOrders([]);
      setSuggestions([]);
      setSearchStats(null);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setOrders([]);
    setSuggestions([]);
    setError(null);
    setLoading(false);
    setSearchStats(null);
    setCacheInfo(null);
  };

  return {
    orders,
    suggestions,
    loading,
    error,
    searchStats,
    cacheInfo,
    searchOrders,
    clearSearch,
  };
};