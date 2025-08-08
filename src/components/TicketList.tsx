import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatus, Priority, AdvancedFilters, SavedFilter } from '../types';
import { departments, users } from '../data/mockData';
import { formatDate, isOverdue } from '../utils/dateUtils';
import { NewTicketModal } from './NewTicketModal';
import { BulkActionsBar } from './BulkActionsBar';
import { AdvancedFilterPanel } from './AdvancedFilterPanel';
import { TicketCard } from './TicketCard';
import { 
  Plus, 
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Bookmark,
  Download,
  RefreshCw,
  Zap,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  Search,
  X
} from 'lucide-react';

interface TicketListProps {
  onTicketSelect: (ticket: Ticket) => void;
  selectedTicketId?: string;
  tickets: Ticket[];
  onCreateTicket: (ticket: any) => void;
  searchQuery?: string;
}

export const TicketList: React.FC<TicketListProps> = ({ 
  onTicketSelect, 
  selectedTicketId, 
  tickets,
  onCreateTicket,
  searchQuery = ''
}) => {
  const [filters, setFilters] = useState<AdvancedFilters>({});
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'priority' | 'dueDate'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Smart filtering with AI-like search
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = tickets.filter(ticket => {
      // Advanced search logic
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
        
        const searchableText = [
          ticket.title,
          ticket.description,
          ticket.id,
          ticket.assignee?.name || '',
          ticket.reporter.name,
          ticket.department.name,
          ticket.issueCategory || '',
          ticket.orderNumber || '',
          ...ticket.tags,
          ticket.status.replace('_', ' '),
          ticket.priority
        ].join(' ').toLowerCase();

        const matchesSearch = searchTerms.every(term => searchableText.includes(term));
        if (!matchesSearch) return false;
      }

      // Apply advanced filters
      if (filters.status && filters.status.length > 0 && !filters.status.includes(ticket.status)) return false;
      if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(ticket.priority)) return false;
      if (filters.department && filters.department.length > 0 && !filters.department.includes(ticket.department.id)) return false;
      if (filters.assignee && filters.assignee.length > 0) {
        if (filters.assignee.includes('unassigned') && ticket.assignee) return false;
        if (!filters.assignee.includes('unassigned') && (!ticket.assignee || !filters.assignee.includes(ticket.assignee.id))) return false;
      }
      if (filters.slaStatus) {
        const isOverdueTicket = isOverdue(ticket.dueDate);
        const isAtRisk = ticket.dueDate && (new Date(ticket.dueDate).getTime() - Date.now()) < (2 * 60 * 60 * 1000); // 2 hours
        
        if (filters.slaStatus === 'breached' && !isOverdueTicket) return false;
        if (filters.slaStatus === 'at_risk' && !isAtRisk) return false;
        if (filters.slaStatus === 'on_track' && (isOverdueTicket || isAtRisk)) return false;
      }

      return true;
    });

    // Advanced sorting
    return filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        default:
          aValue = new Date(a[sortBy]).getTime();
          bValue = new Date(b[sortBy]).getTime();
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [tickets, filters, sortBy, sortOrder, searchQuery]);

  // Analytics for current view
  const analytics = useMemo(() => {
    const total = filteredAndSortedTickets.length;
    const critical = filteredAndSortedTickets.filter(t => t.priority === 'critical').length;
    const overdue = filteredAndSortedTickets.filter(t => isOverdue(t.dueDate)).length;
    const unassigned = filteredAndSortedTickets.filter(t => !t.assignee).length;
    const avgAge = total > 0 ? filteredAndSortedTickets.reduce((acc, t) => 
      acc + (Date.now() - new Date(t.createdAt).getTime()), 0) / total / (1000 * 60 * 60 * 24) : 0;

    return { total, critical, overdue, unassigned, avgAge };
  }, [filteredAndSortedTickets]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleBulkAction = (action: string, ticketIds: string[]) => {
    console.log('Bulk action:', action, ticketIds);
    setSelectedTickets([]);
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-tight">
                Support Tickets
              </h1>
              <div className="flex items-center space-x-2">
                {analytics.critical > 0 && (
                  <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-full animate-pulse">
                    <Zap className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-700">{analytics.critical} critical</span>
                  </div>
                )}
                {analytics.overdue > 0 && (
                  <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-700">{analytics.overdue} overdue</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-full">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">Live updates</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{analytics.total} total tickets</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Avg age: {analytics.avgAge.toFixed(1)} days</span>
              </div>
              {analytics.unassigned > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{analytics.unassigned} unassigned</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button 
              onClick={() => setShowNewTicketModal(true)}
              className="group relative bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-3 rounded-2xl hover:from-slate-800 hover:to-slate-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10 font-semibold">New Ticket</span>
            </button>
          </div>
        </div>

        {/* Advanced Controls */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60">
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-slate-900' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-sm text-slate-900' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Advanced Filters */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                showAdvancedFilters || Object.keys(filters).length > 0
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters</span>
              {Object.keys(filters).length > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>

            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Sort by:</span>
              {['updatedAt', 'createdAt', 'priority', 'dueDate'].map((field) => (
                <button
                  key={field}
                  onClick={() => toggleSort(field as typeof sortBy)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                    sortBy === field
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="capitalize">{field.replace('At', '').replace('Date', ' Date')}</span>
                  {sortBy === field && (
                    sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {selectedTickets.length > 0 && (
              <span className="text-sm text-slate-600">
                {selectedTickets.length} selected
              </span>
            )}
            
            <button className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200">
              <Download className="w-4 h-4" />
              <span className="font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* Advanced Filter Panel */}
        {showAdvancedFilters && (
          <AdvancedFilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowAdvancedFilters(false)}
          />
        )}

        {/* Bulk Actions Bar */}
        {selectedTickets.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedTickets.length}
            onAction={handleBulkAction}
            onClear={() => setSelectedTickets([])}
          />
        )}

        {/* Tickets Grid/List */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' 
            : 'space-y-4'
        }`}>
          {filteredAndSortedTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              viewMode={viewMode}
              isSelected={selectedTickets.includes(ticket.id)}
              onSelect={() => {
                setSelectedTickets(prev => 
                  prev.includes(ticket.id) 
                    ? prev.filter(id => id !== ticket.id)
                    : [...prev, ticket.id]
                );
              }}
              onClick={() => onTicketSelect(ticket)}
              isHighlighted={selectedTicketId === ticket.id}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedTickets.length === 0 && (
          <div className="text-center py-16">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full animate-ping"></div>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">No tickets found</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              {searchQuery || Object.keys(filters).length > 0
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Create your first ticket to get started with the support system."
              }
            </p>
            <div className="flex items-center justify-center space-x-4">
              {(searchQuery || Object.keys(filters).length > 0) && (
                <button
                  onClick={() => {
                    setFilters({});
                    // Clear search if available
                  }}
                  className="flex items-center space-x-2 px-6 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  <span>Clear filters</span>
                </button>
              )}
              <button
                onClick={() => setShowNewTicketModal(true)}
                className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-3 rounded-xl hover:from-slate-800 hover:to-slate-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Create First Ticket</span>
              </button>
            </div>
          </div>
        )}

        <NewTicketModal
          isOpen={showNewTicketModal}
          onClose={() => setShowNewTicketModal(false)}
          onSubmit={onCreateTicket}
        />
      </div>
    </div>
  );
};