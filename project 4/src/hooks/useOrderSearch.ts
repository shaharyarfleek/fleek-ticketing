import { useState, useCallback } from 'react';
import { apiService, Order } from '../services/api';

// Debounce hook for search optimization
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new timer
      const newTimer = setTimeout(() => {
        callback(...args);
      }, delay);

      setDebounceTimer(newTimer);
    },
    [callback, delay, debounceTimer]
  ) as T;

  return debouncedCallback;
}

interface UseOrderSearchState {
  orders: Order[];
  suggestions: string[];
  loading: boolean;
  error: string | null;
  searchStats?: any;
  cacheInfo?: any;
  searchOrders: (query: string) => void; // Now synchronous for immediate call
  searchOrdersImmediate: (query: string) => Promise<void>; // For immediate search (suggestions)
  clearSearch: () => void;
  isTyping: boolean; // Indicates user is actively typing
}

export const useOrderSearch = (): UseOrderSearchState => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchStats, setSearchStats] = useState<any>(null);
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Actual search function
  const performSearch = async (searchQuery: string) => {
    console.log(`🔍 Performing search for: "${searchQuery}"`);
    
    if (!searchQuery || searchQuery.trim().length === 0) {
      setOrders([]);
      setSuggestions([]);
      setError(null);
      setSearchStats(null);
      setIsTyping(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsTyping(false);
      
      const result = await apiService.searchOrders(searchQuery, 50);
      
      setOrders(result.orders);
      setSuggestions(result.suggestions);
      setSearchStats(result.searchStats);
      setCacheInfo(result.cacheInfo);
      
      console.log(`✅ Search completed: ${result.orders.length} results`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search orders';
      setError(errorMessage);
      console.error('Error searching orders:', err);
      setOrders([]);
      setSuggestions([]);
      setSearchStats(null);
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search (waits 300ms after user stops typing)
  const debouncedSearch = useDebounce(performSearch, 300);

  // Immediate search function for manual triggers (like clicking suggestions)
  const searchOrdersImmediate = async (searchQuery: string) => {
    await performSearch(searchQuery);
  };

  // Main search function called on every keystroke
  const searchOrders = (searchQuery: string) => {
    console.log(`⌨️ User typing: "${searchQuery}"`);
    
    // Indicate user is typing
    setIsTyping(true);
    
    // Clear previous results immediately for empty query
    if (!searchQuery || searchQuery.trim().length === 0) {
      setOrders([]);
      setSuggestions([]);
      setError(null);
      setSearchStats(null);
      setIsTyping(false);
      return;
    }

    // For very short queries, don't search yet
    if (searchQuery.trim().length < 2) {
      setOrders([]);
      setSuggestions([]);
      return;
    }

    // Trigger debounced search
    debouncedSearch(searchQuery);
  };

  const clearSearch = () => {
    setOrders([]);
    setSuggestions([]);
    setError(null);
    setLoading(false);
    setSearchStats(null);
    setCacheInfo(null);
    setIsTyping(false);
  };

  return {
    orders,
    suggestions,
    loading,
    error,
    searchStats,
    cacheInfo,
    searchOrders,
    searchOrdersImmediate,
    clearSearch,
    isTyping,
  };
};