import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Ticket, User, Comment, Reply, Reminder, TicketStatus } from '../types';
import { supabaseService } from '../services/supabaseService';

interface DataContextType {
  // Ticket management
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => Promise<void>;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (ticketId: string) => Promise<void>;
  loadTicketComments: (ticketId: string) => Promise<void>;
  
  // Comment management
  addComment: (ticketId: string, comment: Comment) => Promise<void>;
  addReply: (ticketId: string, commentId: string, reply: Reply) => Promise<void>;
  
  // User management
  users: User[];
  addUser: (user: User) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  
  // Reminder management
  setReminder: (ticketId: string, reminder: Reminder) => Promise<void>;
  
  // Status changes
  changeTicketStatus: (ticketId: string, status: TicketStatus) => void;
  assignTicket: (ticketId: string, assignee: User | null) => void;
  
  // Data operations
  exportData: () => string;
  importData: (data: string) => Promise<boolean>;
  clearAllData: () => Promise<void>;
  
  // Statistics
  getStorageStats: () => { used: number; available: number; percentage: number };
  
  // Loading states
  isLoading: boolean;
  ticketsLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Start with false for immediate UI
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // Progressive data loading for better UX
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('🚀 Starting progressive data load...');
      
      try {
        // Load users first (usually smaller dataset and needed for UI)
        console.log('📥 Loading users...');
        const storedUsers = await supabaseService.loadUsers();
        setUsers(storedUsers);
        console.log('✅ Users loaded:', storedUsers.length);
        
        // Load tickets in background with pagination for better performance
        console.log('📥 Loading recent tickets (first 25)...');
        const storedTickets = await supabaseService.loadTickets(25, 0);
        
        // Process tickets without comments for performance
        const ticketsWithoutComments = storedTickets.map(ticket => ({
          ...ticket,
          comments: [] // Comments loaded on-demand
        }));
        
        setTickets(ticketsWithoutComments);
        setTicketsLoading(false);
        console.log('✅ Tickets loaded:', ticketsWithoutComments.length);
        
      } catch (error) {
        console.error('❌ Failed to load data:', error);
        // Still show UI with empty state
        setTickets([]);
        setUsers([]);
        setTicketsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Real-time subscriptions to Supabase changes  
  useEffect(() => {
    // Only setup subscriptions after initial data is loaded
    if (ticketsLoading) return;

    console.log('📡 Setting up real-time subscriptions...');
    
    let ticketUnsubscribe: (() => void) | null = null;
    let userUnsubscribe: (() => void) | null = null;

    try {
      // Subscribe to ticket changes
      ticketUnsubscribe = supabaseService.subscribeToTickets((updatedTickets) => {
        console.log('🔄 Tickets updated from real-time subscription:', updatedTickets.length);
        setTickets(updatedTickets);
      });

      // Subscribe to user changes  
      userUnsubscribe = supabaseService.subscribeToUsers((updatedUsers) => {
        console.log('🔄 Users updated from real-time subscription:', updatedUsers.length);
        setUsers(updatedUsers);
      });
    } catch (error) {
      console.error('❌ Failed to setup real-time subscriptions:', error);
    }

    return () => {
      console.log('📡 Cleaning up real-time subscriptions');
      try {
        if (ticketUnsubscribe) ticketUnsubscribe();
        if (userUnsubscribe) userUnsubscribe();
      } catch (error) {
        console.error('❌ Error cleaning up subscriptions:', error);
      }
    };
  }, [ticketsLoading]);

  // Ticket management functions
  const addTicket = useCallback(async (ticket: Ticket) => {
    try {
      await supabaseService.createTicket(ticket);
      setTickets(prev => {
        const newTickets = [ticket, ...prev];
        console.log('📝 New ticket added to cloud:', ticket.id);
        return newTickets;
      });
    } catch (error) {
      console.error('❌ Failed to create ticket:', error);
      throw error;
    }
  }, []);

  const updateTicket = useCallback(async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      await supabaseService.updateTicket(ticketId, updates);
      setTickets(prev => {
        const updated = prev.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, ...updates, updatedAt: new Date() }
            : ticket
        );
        console.log('✏️ Ticket updated in cloud:', ticketId);
        return updated;
      });
    } catch (error) {
      console.error('❌ Failed to update ticket:', error);
      throw error;
    }
  }, []);

  const deleteTicket = useCallback(async (ticketId: string) => {
    try {
      await supabaseService.deleteTicket(ticketId);
      setTickets(prev => {
        const filtered = prev.filter(ticket => ticket.id !== ticketId);
        console.log('🗑️ Ticket deleted from cloud:', ticketId);
        return filtered;
      });
    } catch (error) {
      console.error('❌ Failed to delete ticket:', error);
      throw error;
    }
  }, []);

  // Load comments for a specific ticket on-demand
  const loadTicketComments = useCallback(async (ticketId: string) => {
    try {
      const comments = await supabaseService.loadTicketComments(ticketId);
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, comments }
          : ticket
      ));
    } catch (error) {
      console.error('❌ Failed to load ticket comments:', error);
    }
  }, []);

  // Comment management functions
  const addComment = useCallback(async (ticketId: string, comment: Comment) => {
    try {
      await supabaseService.addComment(ticketId, comment);
      setTickets(prev => {
        const updated = prev.map(ticket =>
          ticket.id === ticketId
            ? {
                ...ticket,
                comments: [...ticket.comments, comment],
                updatedAt: new Date()
              }
            : ticket
        );
        console.log('💬 Comment added to cloud for ticket:', ticketId);
        return updated;
      });
    } catch (error) {
      console.error('❌ Failed to add comment:', error);
      throw error;
    }
  }, []);

  const addReply = useCallback(async (ticketId: string, commentId: string, reply: Reply) => {
    try {
      await supabaseService.addReply(ticketId, commentId, reply);
      setTickets(prev => {
        const updated = prev.map(ticket =>
          ticket.id === ticketId
            ? {
                ...ticket,
                comments: ticket.comments.map(comment =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        replies: [...(comment.replies || []), reply]
                      }
                    : comment
                ),
                updatedAt: new Date()
              }
            : ticket
        );
        console.log('↩️ Reply added to cloud for comment:', commentId);
        return updated;
      });
    } catch (error) {
      console.error('❌ Failed to add reply:', error);
      throw error;
    }
  }, []);

  // User management functions
  const addUser = useCallback(async (user: User) => {
    try {
      await supabaseService.createUser(user);
      setUsers(prev => {
        // Check if user already exists
        const exists = prev.some(u => u.id === user.id || u.email === user.email);
        if (exists) {
          console.warn('⚠️ User already exists:', user.email);
          return prev;
        }
        
        const newUsers = [...prev, user];
        console.log('👤 New user added to cloud:', user.email);
        return newUsers;
      });
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      await supabaseService.updateUser(userId, updates);
      setUsers(prev => {
        const updated = prev.map(user =>
          user.id === userId ? { ...user, ...updates } : user
        );
        console.log('✏️ User updated in cloud:', userId);
        return updated;
      });
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw error;
    }
  }, []);

  // Reminder management
  const setReminder = useCallback(async (ticketId: string, reminder: Reminder) => {
    try {
      await supabaseService.setReminder(ticketId, reminder);
      setTickets(prev => {
        const updated = prev.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, reminder, updatedAt: new Date() }
            : ticket
        );
        console.log('⏰ Reminder set in cloud for ticket:', ticketId);
        return updated;
      });
    } catch (error) {
      console.error('❌ Failed to set reminder:', error);
      throw error;
    }
  }, []);

  // Status management
  const changeTicketStatus = useCallback((ticketId: string, status: TicketStatus) => {
    updateTicket(ticketId, { status });
  }, [updateTicket]);

  const assignTicket = useCallback((ticketId: string, assignee: User | null) => {
    updateTicket(ticketId, { assignee });
  }, [updateTicket]);

  // Data operations
  const exportData = useCallback(() => {
    // Export current in-memory data as JSON
    const exportData = {
      tickets,
      users,
      exportedAt: new Date().toISOString(),
      version: '2.0.0-supabase'
    };
    return JSON.stringify(exportData, null, 2);
  }, [tickets, users]);

  const importData = useCallback(async (data: string) => {
    try {
      const importedData = JSON.parse(data);
      
      // Import users first
      if (importedData.users) {
        for (const user of importedData.users) {
          await supabaseService.createUser(user);
        }
      }
      
      // Then import tickets
      if (importedData.tickets) {
        for (const ticket of importedData.tickets) {
          await supabaseService.createTicket(ticket);
        }
      }
      
      // Reload data from cloud
      const [newTickets, newUsers] = await Promise.all([
        supabaseService.loadTickets(),
        supabaseService.loadUsers()
      ]);
      
      setTickets(newTickets);
      setUsers(newUsers);
      
      console.log('✅ Data imported to Supabase successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to import data to Supabase:', error);
      return false;
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      // Clear all tickets and users from Supabase
      // Note: This would require additional methods in supabaseService
      console.warn('⚠️ Clear all data not implemented for Supabase (safety measure)');
      console.log('🧹 Use Supabase dashboard to clear data if needed');
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
    }
  }, []);

  const getStorageStats = useCallback(() => {
    // Return basic stats about current data
    const currentData = JSON.stringify({ tickets, users });
    const used = new Blob([currentData]).size;
    return {
      used,
      available: Infinity, // Supabase has much higher limits
      percentage: 0,
      provider: 'Supabase Cloud'
    };
  }, [tickets, users]);

  const contextValue: DataContextType = {
    // Data
    tickets,
    users,
    isLoading,
    ticketsLoading,
    
    // Ticket operations
    addTicket,
    updateTicket,
    deleteTicket,
    loadTicketComments,
    
    // Comment operations
    addComment,
    addReply,
    
    // User operations
    addUser,
    updateUser,
    
    // Other operations
    setReminder,
    changeTicketStatus,
    assignTicket,
    
    // Data operations
    exportData,
    importData,
    clearAllData,
    getStorageStats
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};