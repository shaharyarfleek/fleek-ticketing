import { useState, useCallback, useTransition, useRef } from 'react';
import { apiService, Order } from '../services/api';

// Note: Debouncing is now handled in the component via useEffect

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
  
  // Use React 18's startTransition for non-blocking updates
  const [isPending, startTransition] = useTransition();
  
  // Keep track of the latest search query to prevent race conditions
  const latestSearchRef = useRef<string>('');
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  // Truly non-blocking search function
  const performSearch = useCallback(async (searchQuery: string) => {
    console.log(`🔍 Starting non-blocking search for: "${searchQuery}"`);
    
    // Store the latest search query
    latestSearchRef.current = searchQuery;
    
    // Cancel any previous search
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }
    
    if (!searchQuery || searchQuery.trim().length === 0) {
      // Use startTransition for non-blocking updates
      startTransition(() => {
        setOrders([]);
        setSuggestions([]);
        setError(null);
        setSearchStats(null);
        setIsTyping(false);
      });
      return;
    }

    // Create new AbortController for this search
    const abortController = new AbortController();
    searchAbortControllerRef.current = abortController;

    try {
      // Use startTransition to make loading state update non-blocking
      startTransition(() => {
        setLoading(true);
        setError(null);
        setIsTyping(false);
      });
      
      // Perform the actual search (this is the potentially slow part)
      const result = await apiService.searchOrders(searchQuery, 50);
      
      // Check if this search is still relevant (not cancelled by newer search)
      if (abortController.signal.aborted || latestSearchRef.current !== searchQuery) {
        console.log(`🚫 Search cancelled or superseded for: "${searchQuery}"`);
        return;
      }
      
      // Use startTransition to make result updates non-blocking
      startTransition(() => {
        setOrders(result.orders);
        setSuggestions(result.suggestions);
        setSearchStats(result.searchStats);
        setCacheInfo(result.cacheInfo);
        setLoading(false);
      });
      
      console.log(`✅ Non-blocking search completed: ${result.orders.length} results`);
      
    } catch (err) {
      // Check if error is due to cancellation
      if (abortController.signal.aborted) {
        console.log(`🚫 Search aborted for: "${searchQuery}"`);
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to search orders';
      
      // Use startTransition for error state updates
      startTransition(() => {
        setError(errorMessage);
        setOrders([]);
        setSuggestions([]);
        setSearchStats(null);
        setLoading(false);
        setIsTyping(false);
      });
      
      console.error('Non-blocking search error:', err);
    }
  }, [startTransition]);

  // Immediate search function for manual triggers (like clicking suggestions)
  const searchOrdersImmediate = async (searchQuery: string) => {
    await performSearch(searchQuery);
  };

  // Simplified search function - only called from useEffect
  const searchOrders = useCallback((searchQuery: string) => {
    console.log(`🔍 Searching: "${searchQuery}"`);
    
    // Just trigger the search directly - no complex logic
    performSearch(searchQuery);
  }, [performSearch]);

  const clearSearch = useCallback(() => {
    // Cancel any ongoing searches
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }
    
    // Clear search tracking
    latestSearchRef.current = '';
    
    // Use startTransition for non-blocking cleanup
    startTransition(() => {
      setOrders([]);
      setSuggestions([]);
      setError(null);
      setLoading(false);
      setSearchStats(null);
      setCacheInfo(null);
      setIsTyping(false);
    });
  }, [startTransition]);

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