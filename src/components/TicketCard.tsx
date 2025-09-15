import React from 'react';
import { Ticket } from '../types';
import { formatDate, isOverdue } from '../utils/dateUtils';
import { 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare,
  Paperclip,
  Tag,
  Building,
  Package,
  DollarSign,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
  isHighlighted?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  viewMode,
  isSelected,
  onSelect,
  onClick,
  isHighlighted = false
}) => {
  const getStatusColor = (status: string) => {
    const colors = {
      new: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
      triaged: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700',
      assigned: 'from-amber-50 to-amber-100 border-amber-200 text-amber-700',
      in_progress: 'from-orange-50 to-orange-100 border-orange-200 text-orange-700',
      awaiting_customer: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
      awaiting_internal: 'from-pink-50 to-pink-100 border-pink-200 text-pink-700',
      escalated: 'from-red-50 to-red-100 border-red-200 text-red-700',
      resolved: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700',
      closed: 'from-slate-50 to-slate-100 border-slate-200 text-slate-700',
      cancelled: 'from-gray-50 to-gray-100 border-gray-200 text-gray-700'
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-amber-600',
      low: 'text-emerald-600'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPriorityIcon = (priority: string) => {
    const icons = {
      critical: Zap,
      high: TrendingUp,
      medium: Activity,
      low: CheckCircle2
    };
    const Icon = icons[priority as keyof typeof icons] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  const getIssueTypeColor = (issueType: string) => {
    const colors = {
      buyer: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
      seller: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700',
      internal: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
      system: 'from-slate-50 to-slate-100 border-slate-200 text-slate-700'
    };
    return colors[issueType as keyof typeof colors] || colors.internal;
  };

  const isTicketOverdue = isOverdue(ticket.dueDate);
  const hasComments = ticket.comments && ticket.comments?.length || 0 > 0;
  const hasAttachments = ticket.attachments && ticket.attachments?.length || 0 > 0;

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className={`group relative bg-white/80 backdrop-blur-sm border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300/60 hover:bg-white ${
          isHighlighted 
            ? 'ring-2 ring-blue-500/20 border-blue-500/30 bg-white shadow-lg shadow-blue-500/10' 
            : 'border-slate-200/60 hover:transform hover:scale-[1.01]'
        } ${isSelected ? 'ring-2 ring-slate-900/20 border-slate-900/30' : ''}`}
      >
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate group-hover:text-slate-800 transition-colors duration-200 mb-2">
                  {ticket.title}
                </h3>
                <p className="text-slate-600 text-sm line-clamp-1 leading-relaxed">
                  {ticket.description}
                </p>
              </div>
              
              <div className="ml-4 text-right flex-shrink-0">
                <div className="text-xs text-slate-500 mb-1">#{ticket.id}</div>
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(ticket.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 text-sm">
              <span className={`px-3 py-1 rounded-lg font-medium border bg-gradient-to-r ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              
              <span className={`px-3 py-1 rounded-lg font-medium border bg-gradient-to-r ${getIssueTypeColor(ticket.issueType)}`}>
                {ticket.issueType}
              </span>
              
              <div className={`flex items-center space-x-1 font-medium ${getPriorityColor(ticket.priority)}`}>
                {getPriorityIcon(ticket.priority)}
                <span className="capitalize">{ticket.priority}</span>
              </div>
              
              <div className="flex items-center space-x-1 text-slate-500">
                <Building className="w-4 h-4" />
                <span>{ticket.department.name}</span>
              </div>
              
              {ticket.assignee && (
                <div className="flex items-center space-x-1 text-slate-500">
                  <User className="w-4 h-4" />
                  <span>{ticket.assignee.name}</span>
                </div>
              )}

              {hasComments && (
                <div className="flex items-center space-x-1 text-slate-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>{ticket.comments?.length || 0}</span>
                </div>
              )}

              {hasAttachments && (
                <div className="flex items-center space-x-1 text-slate-500">
                  <Paperclip className="w-4 h-4" />
                  <span>{ticket.attachments?.length || 0}</span>
                </div>
              )}

              {isTicketOverdue && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-full">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  <span className="text-xs font-medium text-red-700">Overdue</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white/80 backdrop-blur-sm border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300/60 hover:bg-white ${
        isHighlighted 
          ? 'ring-2 ring-blue-500/20 border-blue-500/30 bg-white shadow-lg shadow-blue-500/10' 
          : 'border-slate-200/60 hover:transform hover:scale-[1.02]'
      } ${isSelected ? 'ring-2 ring-slate-900/20 border-slate-900/30' : ''}`}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
        />
      </div>

      {/* Priority Indicator */}
      <div className={`absolute top-4 right-4 p-2 rounded-xl ${getPriorityColor(ticket.priority)} bg-white/50`}>
        {getPriorityIcon(ticket.priority)}
      </div>

      {/* Overdue Badge */}
      {isTicketOverdue && (
        <div className="absolute top-4 right-16 flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-full">
          <AlertTriangle className="w-3 h-3 text-red-600" />
          <span className="text-xs font-medium text-red-700">Overdue</span>
        </div>
      )}

      <div className="space-y-4 mt-8">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-mono">#{ticket.id}</span>
            <span className="text-xs text-slate-500">{formatDate(ticket.updatedAt)}</span>
          </div>
          <h3 className="font-semibold text-slate-900 group-hover:text-slate-800 transition-colors duration-200 line-clamp-2 leading-tight mb-3">
            {ticket.title}
          </h3>
          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
            {ticket.description}
          </p>
        </div>

        {/* Status and Type */}
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-lg text-xs font-medium border bg-gradient-to-r ${getStatusColor(ticket.status)}`}>
            {ticket.status.replace('_', ' ')}
          </span>
          <span className={`px-3 py-1 rounded-lg text-xs font-medium border bg-gradient-to-r ${getIssueTypeColor(ticket.issueType)}`}>
            {ticket.issueType}
          </span>
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-slate-500">
              <Building className="w-4 h-4" />
              <span>{ticket.department.name}</span>
            </div>
            <div className={`flex items-center space-x-1 font-medium ${getPriorityColor(ticket.priority)}`}>
              <span className="capitalize">{ticket.priority}</span>
            </div>
          </div>

          {ticket.assignee && (
            <div className="flex items-center space-x-1 text-slate-500">
              <User className="w-4 h-4" />
              <span>{ticket.assignee.name}</span>
              {ticket.pocName && ticket.assignee.name.toLowerCase().includes(ticket.pocName.toLowerCase()) && (
                <span className="text-xs text-emerald-600 font-medium">(POC)</span>
              )}
            </div>
          )}

          {ticket.orderNumber && (
            <div className="flex items-center space-x-1 text-slate-500">
              <Package className="w-4 h-4" />
              <span className="font-mono text-xs">{ticket.orderNumber}</span>
            </div>
          )}

          {ticket.orderValue && (
            <div className="flex items-center space-x-1 text-slate-500">
              <span className="font-bold">£</span>
              <span className="font-medium">{ticket.orderValue.toFixed(2)} {ticket.currency}</span>
            </div>
          )}

          {ticket.issueCategory && (
            <div className="flex items-center space-x-1 text-slate-500">
              <Tag className="w-4 h-4" />
              <span className="text-xs">{ticket.issueCategory}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-3">
            {hasComments && (
              <div className="flex items-center space-x-1 text-slate-500">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">{ticket.comments?.length || 0}</span>
              </div>
            )}
            {hasAttachments && (
              <div className="flex items-center space-x-1 text-slate-500">
                <Paperclip className="w-4 h-4" />
                <span className="text-sm">{ticket.attachments?.length || 0}</span>
              </div>
            )}
          </div>
          
          {ticket.slaHours && (
            <div className={`flex items-center space-x-1 text-xs ${
              isTicketOverdue ? 'text-red-600' : 'text-slate-500'
            }`}>
              <Clock className="w-3 h-3" />
              <span>SLA: {ticket.slaHours}h</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};