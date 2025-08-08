import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getAutoAssignedUser } from './data/mockData';
import { Layout } from './components/Layout';
import { TicketList } from './components/TicketList';
import { TicketDetail } from './components/TicketDetail';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { Ticket, TicketStatus, Comment, User, Attachment, Reply, Reminder } from './types';
import { mockTickets, users } from './data/mockData';

function AppContent() {
  const [currentView, setCurrentView] = useState<'tickets' | 'analytics' | 'settings'>('tickets');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleTicketSelectById = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
    }
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
  };

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: newStatus, updatedAt: new Date() }
          : ticket
      )
    );
    
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus, updatedAt: new Date() } : null);
    }
  };

  const handleAssigneeChange = (ticketId: string, assignee: User | null) => {
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, assignee, updatedAt: new Date() }
          : ticket
      )
    );
    
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, assignee, updatedAt: new Date() } : null);
    }
  };

  const handleAddComment = (ticketId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      createdAt: new Date(),
      ...comment
    };

    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, comments: [...ticket.comments, newComment], updatedAt: new Date() }
          : ticket
      )
    );

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => prev ? { 
        ...prev, 
        comments: [...prev.comments, newComment], 
        updatedAt: new Date() 
      } : null);
    }
  };

  const handleAddReply = (commentId: string, reply: Omit<Reply, 'id' | 'createdAt'>) => {
    const newReply: Reply = {
      id: Date.now().toString(),
      createdAt: new Date(),
      ...reply
    };

    setTickets(prevTickets => 
      prevTickets.map(ticket => ({
        ...ticket,
        comments: ticket.comments.map(comment =>
          comment.id === commentId
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        ),
        updatedAt: new Date()
      }))
    );

    if (selectedTicket) {
      setSelectedTicket(prev => prev ? {
        ...prev,
        comments: prev.comments.map(comment =>
          comment.id === commentId
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        ),
        updatedAt: new Date()
      } : null);
    }
  };

  const handleSetReminder = (reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      createdAt: new Date(),
      ...reminder
    };

    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === reminder.ticketId 
          ? { ...ticket, reminder: newReminder, updatedAt: new Date() }
          : ticket
      )
    );

    if (selectedTicket && selectedTicket.id === reminder.ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, reminder: newReminder, updatedAt: new Date() } : null);
    }
  };

  const handleCreateTicket = (ticketData: any) => {
    // Auto-assign if issue category is provided and no manual assignee
    let assignee = ticketData.assignee;
    if (!assignee && ticketData.issueCategory) {
      assignee = getAutoAssignedUser(ticketData.department.id, ticketData.issueCategory);
    }
    
    const newTicket: Ticket = {
      id: `TK-2024-${String(tickets.length + 1).padStart(3, '0')}`,
      title: ticketData.title,
      description: ticketData.description,
      status: 'new',
      priority: ticketData.priority,
      department: ticketData.department,
      assignee: assignee,
      reporter: users[0], // Current user
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ticketData.tags,
      comments: [],
      dueDate: ticketData.dueDate,
      attachments: ticketData.attachments || [],
      issueType: ticketData.issueType,
      orderNumber: ticketData.orderNumber,
      orderValue: ticketData.orderValue,
      refundValue: ticketData.refundValue,
      currency: ticketData.currency,
      issueCategory: ticketData.issueCategory,
      slaHours: ticketData.slaHours,
      pocName: ticketData.pocName,
      escalationLevel: 'none',
      businessImpact: 'medium',
      resolutionTime: undefined,
      firstResponseTime: undefined,
      watchers: [],
      linkedTickets: [],
      customFields: {},
      automationRules: [],
      slaBreaches: [],
      worklog: [],
    };

    setTickets(prevTickets => [newTicket, ...prevTickets]);
  };

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
          onStatusChange={handleStatusChange}
          onAddComment={handleAddComment}
          onAssigneeChange={handleAssigneeChange}
          onAddReply={handleAddReply}
          onSetReminder={handleSetReminder}
        />
      );
    }

    return (
      <TicketList
        onTicketSelect={handleTicketSelect}
        selectedTicketId={selectedTicket?.id}
        tickets={tickets}
        onCreateTicket={handleCreateTicket}
        searchQuery={searchQuery}
      />
    );
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      onTicketSelect={handleTicketSelectById}
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
        <ProtectedRoute>
          <AppContent />
        </ProtectedRoute>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;