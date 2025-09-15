import React from 'react';
import { Ticket, User, Comment, Reply, Reminder } from '../types';

interface AppData {
  tickets: Ticket[];
  users: User[];
  comments: { [ticketId: string]: Comment[] };
  lastUpdated: string;
  version: string;
}

class StorageService {
  private readonly STORAGE_KEY = 'fleek-ticketing-data';
  private readonly VERSION = '1.0.0';

  // Save all app data to localStorage
  saveAppData(data: Partial<AppData>): void {
    try {
      const currentData = this.loadAppData();
      const updatedData: AppData = {
        ...currentData,
        ...data,
        lastUpdated: new Date().toISOString(),
        version: this.VERSION
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
      console.log('✅ App data saved to localStorage:', {
        tickets: updatedData.tickets?.length || 0,
        users: updatedData.users?.length || 0,
        lastUpdated: updatedData.lastUpdated
      });
    } catch (error) {
      console.error('❌ Failed to save app data:', error);
    }
  }

  // Load all app data from localStorage
  loadAppData(): AppData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.getDefaultAppData();
      }

      const data: AppData = JSON.parse(stored);
      
      // Version migration if needed
      if (data.version !== this.VERSION) {
        console.log('🔄 Migrating data from version', data.version, 'to', this.VERSION);
        return this.migrateData(data);
      }

      console.log('✅ App data loaded from localStorage:', {
        tickets: data.tickets?.length || 0,
        users: data.users?.length || 0,
        lastUpdated: data.lastUpdated
      });

      return data;
    } catch (error) {
      console.error('❌ Failed to load app data, using defaults:', error);
      return this.getDefaultAppData();
    }
  }

  // Save tickets specifically
  saveTickets(tickets: Ticket[]): void {
    this.saveAppData({ tickets });
  }

  // Load tickets specifically
  loadTickets(): Ticket[] {
    return this.loadAppData().tickets || [];
  }

  // Save users specifically
  saveUsers(users: User[]): void {
    this.saveAppData({ users });
  }

  // Load users specifically
  loadUsers(): User[] {
    return this.loadAppData().users || [];
  }

  // Save a single ticket
  saveTicket(ticket: Ticket): void {
    const tickets = this.loadTickets();
    const existingIndex = tickets.findIndex(t => t.id === ticket.id);
    
    if (existingIndex >= 0) {
      tickets[existingIndex] = ticket;
    } else {
      tickets.unshift(ticket); // Add to beginning
    }
    
    this.saveTickets(tickets);
  }

  // Save a single user
  saveUser(user: User): void {
    const users = this.loadUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    this.saveUsers(users);
  }

  // Add comment to ticket
  addCommentToTicket(ticketId: string, comment: Comment): void {
    const tickets = this.loadTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex >= 0) {
      tickets[ticketIndex].comments.push(comment);
      tickets[ticketIndex].updatedAt = new Date();
      this.saveTickets(tickets);
    }
  }

  // Add reply to comment
  addReplyToComment(ticketId: string, commentId: string, reply: Reply): void {
    const tickets = this.loadTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex >= 0) {
      const commentIndex = tickets[ticketIndex].comments.findIndex(c => c.id === commentId);
      if (commentIndex >= 0) {
        if (!tickets[ticketIndex].comments[commentIndex].replies) {
          tickets[ticketIndex].comments[commentIndex].replies = [];
        }
        tickets[ticketIndex].comments[commentIndex].replies!.push(reply);
        tickets[ticketIndex].updatedAt = new Date();
        this.saveTickets(tickets);
      }
    }
  }

  // Set reminder for ticket
  setTicketReminder(ticketId: string, reminder: Reminder): void {
    const tickets = this.loadTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex >= 0) {
      tickets[ticketIndex].reminder = reminder;
      tickets[ticketIndex].updatedAt = new Date();
      this.saveTickets(tickets);
    }
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🧹 All app data cleared');
    } catch (error) {
      console.error('❌ Failed to clear app data:', error);
    }
  }

  // Export data for backup
  exportData(): string {
    const data = this.loadAppData();
    return JSON.stringify(data, null, 2);
  }

  // Import data from backup
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.saveAppData(data);
      return true;
    } catch (error) {
      console.error('❌ Failed to import data:', error);
      return false;
    }
  }

  // Get data usage statistics
  getStorageStats(): { used: number; available: number; percentage: number } {
    try {
      const data = JSON.stringify(this.loadAppData());
      const used = new Blob([data]).size;
      const available = 5 * 1024 * 1024; // 5MB typical localStorage limit
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      return { used: 0, available: 5 * 1024 * 1024, percentage: 0 };
    }
  }

  private getDefaultAppData(): AppData {
    return {
      tickets: [],
      users: [],
      comments: {},
      lastUpdated: new Date().toISOString(),
      version: this.VERSION
    };
  }

  private migrateData(oldData: any): AppData {
    // Handle future data migrations here
    return {
      ...this.getDefaultAppData(),
      ...oldData,
      version: this.VERSION
    };
  }
}

// Create singleton instance
export const storageService = new StorageService();

// Auto-save hook for React components
export function useAutoSave<T>(key: string, data: T, delay: number = 1000) {
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  
  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (key === 'tickets' && Array.isArray(data)) {
        storageService.saveTickets(data as Ticket[]);
      } else if (key === 'users' && Array.isArray(data)) {
        storageService.saveUsers(data as User[]);
      }
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, data, delay]);
}