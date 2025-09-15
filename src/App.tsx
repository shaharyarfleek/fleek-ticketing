// TypeScript Fix: getAllUsers async - Deployed 2025-01-15-21:30 - User Management Fixed
import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getAutoAssignedUser } from './data/mockData';
import { Layout } from './components/Layout';
import { TicketList } from './components/TicketList';
import { TicketDetail } from './components/TicketDetail';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { Ticket, TicketStatus, Comment, User, Attachment, Reply, Reminder } from './types';
import { departments } from './data/mockData';

function AppContent() {
  const [currentView, setCurrentView] = useState<'tickets' | 'analytics' | 'settings'>('tickets');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleTicketSelectById = (ticketId: string, tickets: Ticket[]) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
    }
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
  };

  // These handlers will be passed down to components that use DataContext
  // They now just update the selectedTicket state for UI purposes

  const renderContent = () => {
    if (currentView === 'analytics') {
      return <Analytics />;
    }

    if (currentView === 'settings') {
      return <Settings />;
    }

    if (selectedTicket) {
      return (
        <TicketDetail
          ticket={selectedTicket}
          onBack={handleBackToList}
        />
      );
    }

    return (
      <TicketList
        onTicketSelect={handleTicketSelect}
        selectedTicketId={selectedTicket?.id}
        searchQuery={searchQuery}
      />
    );
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;