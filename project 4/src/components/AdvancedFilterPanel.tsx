import React from 'react';
import { AdvancedFilters } from '../types';
import { departments, users } from '../data/mockData';
import { X, Filter, Calendar, User, Building, Tag, AlertTriangle, AtSign, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdvancedFilterPanelProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClose: () => void;
}

export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const { authState } = useAuth();
  const currentUser = authState.user;
  const users = authState.getAllUsers ? authState.getAllUsers() : [];

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Advanced Filters</h3>
              <p className="text-sm text-slate-500">
                {activeFilterCount > 0 ? `${activeFilterCount} filters active` : 'No filters applied'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1 hover:bg-slate-100 rounded-lg transition-all duration-200"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <div className="space-y-2">
              {['new', 'assigned', 'in_progress', 'awaiting_customer', 'awaiting_internal', 'escalated', 'resolved', 'closed'].map(status => (
                <label key={status} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(status as any) || false}
                    onChange={(e) => {
                      const currentStatuses = filters.status || [];
                      if (e.target.checked) {
                        updateFilter('status', [...currentStatuses, status]);
                      } else {
                        updateFilter('status', currentStatuses.filter(s => s !== status));
                      }
                    }}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-sm text-slate-700 capitalize">{status.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Priority
            </label>
            <div className="space-y-2">
              {['critical', 'high', 'medium', 'low'].map(priority => (
                <label key={priority} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.priority?.includes(priority as any) || false}
                    onChange={(e) => {
                      const currentPriorities = filters.priority || [];
                      if (e.target.checked) {
                        updateFilter('priority', [...currentPriorities, priority]);
                      } else {
                        updateFilter('priority', currentPriorities.filter(p => p !== priority));
                      }
                    }}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-sm text-slate-700 capitalize">{priority}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Department
            </label>
            <div className="space-y-2">
              {departments.map(dept => (
                <label key={dept.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.department?.includes(dept.id) || false}
                    onChange={(e) => {
                      const currentDepts = filters.department || [];
                      if (e.target.checked) {
                        updateFilter('department', [...currentDepts, dept.id]);
                      } else {
                        updateFilter('department', currentDepts.filter(d => d !== dept.id));
                      }
                    }}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-sm text-slate-700">{dept.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* SLA Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              SLA Status
            </label>
            <div className="space-y-2">
              {[
                { value: 'on_track', label: 'On Track', color: 'text-emerald-600' },
                { value: 'at_risk', label: 'At Risk', color: 'text-amber-600' },
                { value: 'breached', label: 'Breached', color: 'text-red-600' }
              ].map(({ value, label, color }) => (
                <label key={value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="slaStatus"
                    checked={filters.slaStatus === value}
                    onChange={() => updateFilter('slaStatus', value)}
                    className="border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className={`text-sm font-medium ${color}`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Filters */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <AtSign className="w-4 h-4 inline mr-1" />
              Special Filters
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.customFields?.mentionedUser === currentUser?.id}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFilter('customFields', { mentionedUser: currentUser?.id });
                    } else {
                      updateFilter('customFields', {});
                    }
                  }}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700">Mentions me</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hasAttachments === true}
                  onChange={(e) => updateFilter('hasAttachments', e.target.checked || undefined)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700">Has attachments</span>
              </label>
            </div>
          </div>
        </div>

        {/* Assignee Filter */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Assignee
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.assignee?.includes('unassigned') || false}
                onChange={(e) => {
                  const currentAssignees = filters.assignee || [];
                  if (e.target.checked) {
                    updateFilter('assignee', [...currentAssignees, 'unassigned']);
                  } else {
                    updateFilter('assignee', currentAssignees.filter(a => a !== 'unassigned'));
                  }
                }}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-sm text-slate-700">Unassigned</span>
            </label>
            
            {currentUser && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.assignee?.includes(currentUser.id) || false}
                  onChange={(e) => {
                    const currentAssignees = filters.assignee || [];
                    if (e.target.checked) {
                      updateFilter('assignee', [...currentAssignees, currentUser.id]);
                    } else {
                      updateFilter('assignee', currentAssignees.filter(a => a !== currentUser.id));
                    }
                  }}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700 font-medium">Assigned to me</span>
              </label>
            )}
            
            {users.slice(0, 15).map(user => (
              <label key={user.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.assignee?.includes(user.id) || false}
                  onChange={(e) => {
                    const currentAssignees = filters.assignee || [];
                    if (e.target.checked) {
                      updateFilter('assignee', [...currentAssignees, user.id]);
                    } else {
                      updateFilter('assignee', currentAssignees.filter(a => a !== user.id));
                    }
                  }}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700 truncate">{user.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">From</label>
              <input
                type="date"
                value={filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const start = e.target.value ? new Date(e.target.value) : undefined;
                  updateFilter('dateRange', { 
                    start, 
                    end: filters.dateRange?.end 
                  });
                }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">To</label>
              <input
                type="date"
                value={filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const end = e.target.value ? new Date(e.target.value) : undefined;
                  updateFilter('dateRange', { 
                    start: filters.dateRange?.start, 
                    end 
                  });
                }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>
          
          {/* Quick Date Filters */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { label: 'Today', days: 0 },
              { label: 'Yesterday', days: -1 },
              { label: 'Last 7 days', days: -7 },
              { label: 'Last 30 days', days: -30 }
            ].map(({ label, days }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  const date = new Date();
                  if (days === 0) {
                    // Today
                    date.setHours(0, 0, 0, 0);
                    const tomorrow = new Date(date);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    updateFilter('dateRange', { start: date, end: tomorrow });
                  } else if (days === -1) {
                    // Yesterday
                    const yesterday = new Date(date);
                    yesterday.setDate(yesterday.getDate() - 1);
                    yesterday.setHours(0, 0, 0, 0);
                    const today = new Date(yesterday);
                    today.setDate(today.getDate() + 1);
                    updateFilter('dateRange', { start: yesterday, end: today });
                  } else {
                    // Last X days
                    const startDate = new Date(date);
                    startDate.setDate(startDate.getDate() + days);
                    startDate.setHours(0, 0, 0, 0);
                    updateFilter('dateRange', { start: startDate, end: new Date() });
                  }
                }}
                className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors duration-200"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};