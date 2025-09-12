import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatus, Priority, AdvancedFilters, SavedFilter } from '../types';
import { departments, users } from '../data/mockData';
import { formatDate, isOverdue } from '../utils/dateUtils';
import { NewTicketModal } from './NewTicketModal';
import { BulkActionsBar } from './BulkActionsBar';
import { AdvancedFilterPanel } from './AdvancedFilterPanel';
import { TicketCard } from './TicketCard';
import { TicketSkeleton } from './TicketSkeleton';
import { useData } from '../contexts/DataContext';
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
  X,
  User,
  AtSign,
  Calendar,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TicketListProps {
  onTicketSelect: (ticket: Ticket) => void;
  selectedTicketId?: string;
  searchQuery?: string;
}

export const TicketList: React.FC<TicketListProps> = ({ 
  onTicketSelect, 
  selectedTicketId,
  searchQuery = ''
}) => {
  const { tickets, addTicket, isLoading, ticketsLoading } = useData();
  const { authState } = useAuth();
  const currentUser = authState.user;
  const [filters, setFilters] = useState<AdvancedFilters>({});
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'priority' | 'dueDate'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle creating new ticket with cloud storage
  const handleCreateTicket = async (ticketData: any) => {
    try {
      const newTicket: Ticket = {
        id: `TK-2024-${String((tickets?.length || 0) + 1).padStart(3, '0')}`,
        title: ticketData.title,
        description: ticketData.description,
        status: 'new',
        priority: ticketData.priority,
        severity: 'medium',
        department: ticketData.department || departments[0],
        assignee: ticketData.assignee || null,
        reporter: currentUser || { 
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Default admin UUID
          name: 'System Administrator', 
          email: 'admin@fleek.com', 
          department: departments[0], 
          role: 'admin',
          isBlocked: false
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: undefined,
        firstResponseAt: undefined,
        tags: ticketData.tags || [],
        comments: [],
        dueDate: ticketData.dueDate,
        attachments: ticketData.attachments || [],
        issueType: ticketData.issueType || 'general',
        orderNumber: ticketData.orderNumber,
        orderValue: ticketData.orderValue,
        refundValue: ticketData.refundValue,
        currency: ticketData.currency,
        issueCategory: ticketData.issueCategory,
        slaHours: ticketData.slaHours,
        pocName: ticketData.pocName,
        escalationLevel: 'none',
        businessImpact: 'medium',
        customerTier: undefined,
        resolutionTime: undefined,
        firstResponseTime: undefined,
        watchers: [],
        linkedTickets: [],
        customFields: {},
        automationRules: [],
        slaBreaches: [],
        worklog: [],
      };

      console.log('🎫 Creating ticket with data:', newTicket);
      await addTicket(newTicket);
      setShowNewTicketModal(false);
      console.log('✅ Ticket created successfully:', newTicket.id);
    } catch (error) {
      console.error('❌ Failed to create ticket:', error);
      // Show more detailed error to user
      alert(`Failed to create ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Helper function for gradient classes
  const getGradientClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'purple': return 'from-purple-500 to-purple-600';
      case 'red': return 'from-red-500 to-red-600';
      case 'emerald': return 'from-emerald-500 to-emerald-600';
      case 'amber': return 'from-amber-500 to-amber-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Quick filter functions
  const applyQuickFilter = (filterType: string) => {
    switch (filterType) {
      case 'assigned_to_me':
        setFilters({ assignee: currentUser ? [currentUser.id] : [] });
        break;
      case 'mentions':
        // Filter tickets where current user is mentioned in comments
        setFilters({ 
          customFields: { 
            mentionedUser: currentUser?.id 
          } 
        });
        break;
      case 'reported_by_me':
        setFilters({ reporter: currentUser ? [currentUser.id] : [] });
        break;
      case 'overdue':
        setFilters({ slaStatus: 'breached' });
        break;
      case 'high_priority':
        setFilters({ priority: ['critical', 'high'] });
        break;
      case 'unassigned':
        setFilters({ assignee: ['unassigned'] });
        break;
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFilters({ 
          dateRange: { 
            start: today, 
            end: tomorrow 
          } 
        });
        break;
      default:
        setFilters({});
    }
  };

  // Smart filtering with AI-like search
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = (tickets || []).filter(ticket => {
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
        const timeUntilDue = ticket.dueDate ? new Date(ticket.dueDate).getTime() - Date.now() : Infinity;
        const isAtRisk = timeUntilDue > 0 && timeUntilDue < (2 * 60 * 60 * 1000); // 2 hours
        
        if (filters.slaStatus === 'breached' && !isOverdueTicket) return false;
        if (filters.slaStatus === 'at_risk' && !isAtRisk) return false;
        if (filters.slaStatus === 'on_track' && (isOverdueTicket || isAtRisk)) return false;
      }
      
      // Check for mentions
      if (filters.customFields?.mentionedUser && currentUser) {
        const isMentioned = ticket.comments.some(comment => 
          comment.content.includes(`@${currentUser.name}`)
        );
        if (!isMentioned) return false;
      }
      
      // Date range filter
      if (filters.dateRange) {
        const ticketDate = new Date(ticket.createdAt);
        if (filters.dateRange.start && ticketDate < filters.dateRange.start) return false;
        if (filters.dateRange.end && ticketDate >= filters.dateRange.end) return false;
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

  // Department resolution hours analytics
  const departmentResolutionHours = useMemo(() => {
    if (!departments || !Array.isArray(departments)) {
      return [];
    }
    const deptStats = departments.map(dept => {
      const deptTickets = filteredAndSortedTickets.filter(t => t.department.id === dept.id);
      const resolvedTickets = deptTickets.filter(t => t.status === 'resolved' && t.resolutionTime);
      
      let avgResolutionHours = 0;
      if (resolvedTickets.length > 0) {
        const totalMinutes = resolvedTickets.reduce((sum, ticket) => sum + (ticket.resolutionTime || 0), 0);
        avgResolutionHours = totalMinutes / resolvedTickets.length / 60; // Convert to hours
      }
      
      return {
        department: dept,
        totalTickets: deptTickets.length,
        resolvedTickets: resolvedTickets.length,
        avgResolutionHours,
        slaHours: dept.slaHours,
        performance: avgResolutionHours > 0 ? ((dept.slaHours - avgResolutionHours) / dept.slaHours) * 100 : 0
      };
    }).filter(stat => stat.totalTickets > 0);
    
    return deptStats;
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

  // Show loading state if data is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Department Resolution Hours Dashboard */}
        {departmentResolutionHours && departmentResolutionHours.length > 0 && (
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Department Resolution Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {departmentResolutionHours.map(stat => (
                  <div key={stat.department.id} className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-900">{stat.department.name}</h3>
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: stat.department.color }}
                      ></div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">SLA Target:</span>
                        <span className="font-semibold text-slate-900">{stat.slaHours}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Avg Resolution:</span>
                        <span className={`font-semibold ${
                          stat.avgResolutionHours <= stat.slaHours ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {stat.avgResolutionHours > 0 ? `${stat.avgResolutionHours.toFixed(1)}h` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Performance:</span>
                        <span className={`font-semibold ${
                          stat.performance >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {stat.performance > 0 ? `+${stat.performance.toFixed(0)}%` : `${stat.performance.toFixed(0)}%`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tickets:</span>
                        <span className="font-semibold text-slate-900">
                          {stat.resolvedTickets}/{stat.totalTickets}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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

        {/* World-Class Controls Panel */}
        <div className="mb-6 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-xl shadow-slate-200/20">
          {/* Primary Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-100/60">
            {/* Quick Filters Section */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Quick Actions</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'assigned_to_me', label: 'My Tickets', icon: User, color: 'blue' },
                  { key: 'mentions', label: 'Mentions', icon: AtSign, color: 'purple' },
                  { key: 'overdue', label: 'Overdue', icon: AlertTriangle, color: 'red' },
                  { key: 'today', label: 'Today', icon: Calendar, color: 'emerald' },
                  { key: 'unassigned', label: 'Unassigned', icon: Target, color: 'amber' }
                ].map(({ key, label, icon: Icon, color }) => {
                  const isActive = (key === 'assigned_to_me' && filters.assignee?.includes(currentUser?.id || '')) ||
                    (key === 'mentions' && filters.customFields?.mentionedUser) ||
                    (key === 'overdue' && filters.slaStatus === 'breached') ||
                    (key === 'unassigned' && filters.assignee?.includes('unassigned')) ||
                    (key === 'today' && filters.dateRange);
                  
                  return (
                    <button
                      key={key}
                      onClick={() => applyQuickFilter(key)}
                      className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                        isActive
                          ? `bg-gradient-to-r ${getGradientClasses(color)} text-white shadow-lg shadow-${color}-500/25`
                          : `text-slate-600 hover:text-slate-900 bg-slate-50/50 hover:bg-slate-100/80 border border-slate-200/50`
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : `text-${color}-500`}`} />
                      <span className="whitespace-nowrap">{label}</span>
                      {isActive && (
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${getGradientClasses(color)} opacity-20 animate-pulse`}></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100/60 backdrop-blur-sm rounded-2xl p-1.5 border border-slate-200/40">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-md text-slate-900 border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-md text-slate-900 border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>

              {/* Advanced Filters */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  showAdvancedFilters || Object.keys(filters).length > 0
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50/50 hover:bg-slate-100/80 border border-slate-200/50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="whitespace-nowrap">Filters</span>
                {Object.keys(filters).length > 0 && (
                  <span className="ml-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    {Object.keys(filters).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Secondary Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            {/* Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-slate-600">Sort by</span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { field: 'updatedAt', label: 'Updated', icon: RefreshCw },
                  { field: 'createdAt', label: 'Created', icon: Clock },
                  { field: 'priority', label: 'Priority', icon: TrendingUp },
                  { field: 'dueDate', label: 'Due Date', icon: Calendar }
                ].map(({ field, label, icon: Icon }) => (
                  <button
                    key={field}
                    onClick={() => toggleSort(field as typeof sortBy)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      sortBy === field
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/25'
                        : 'text-slate-600 hover:text-slate-900 bg-slate-50/50 hover:bg-slate-100/80 border border-slate-200/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="whitespace-nowrap">{label}</span>
                    {sortBy === field && (
                      sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {selectedTickets.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/80 border border-blue-200/50 rounded-xl">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedTickets.length} selected
                  </span>
                </div>
              )}
              
              {Object.keys(filters).length > 0 && (
                <button
                  onClick={() => setFilters({})}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 bg-red-50/50 hover:bg-red-100/80 border border-red-200/50 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm font-medium whitespace-nowrap">Clear filters</span>
                </button>
              )}
              
              <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 bg-slate-50/50 hover:bg-slate-100/80 border border-slate-200/50 rounded-xl transition-all duration-200 hover:scale-105">
                <Download className="w-4 h-4" />
                <span className="font-medium whitespace-nowrap">Export</span>
              </button>
            </div>
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
          {ticketsLoading ? (
            <div className={viewMode === 'grid' ? 'col-span-full' : ''}>
              <TicketSkeleton />
            </div>
          ) : filteredAndSortedTickets.length === 0 ? (
            <div className="text-center py-12 col-span-full">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No tickets found</h3>
              <p className="text-slate-500 mb-4">Create your first ticket to get started</p>
              <button
                onClick={() => setShowNewTicketModal(true)}
                className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-3 rounded-xl hover:from-slate-800 hover:to-slate-700 transition-all duration-300 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create Ticket</span>
              </button>
            </div>
          ) : (
            filteredAndSortedTickets.map((ticket) => (
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
            ))
          )}
        </div>


        <NewTicketModal
          isOpen={showNewTicketModal}
          onClose={() => setShowNewTicketModal(false)}
          onSubmit={handleCreateTicket}
        />
      </div>
    </div>
  );
};