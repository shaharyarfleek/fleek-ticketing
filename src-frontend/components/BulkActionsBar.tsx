import React, { useState } from 'react';
import { Check, X, User, Tag, Trash2, Archive, MessageSquare } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onAction: (action: string, ticketIds: string[]) => void;
  onClear: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onAction,
  onClear
}) => {
  const [showActions, setShowActions] = useState(false);

  const actions = [
    { id: 'assign', label: 'Assign', icon: User, color: 'blue' },
    { id: 'status', label: 'Change Status', icon: Check, color: 'emerald' },
    { id: 'tag', label: 'Add Tags', icon: Tag, color: 'purple' },
    { id: 'comment', label: 'Add Comment', icon: MessageSquare, color: 'indigo' },
    { id: 'archive', label: 'Archive', icon: Archive, color: 'amber' },
    { id: 'delete', label: 'Delete', icon: Trash2, color: 'red' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        <div className="flex items-center px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="font-medium">{selectedCount} tickets selected</span>
            </div>
            
            <div className="h-4 w-px bg-slate-600"></div>
            
            <div className="flex items-center space-x-2">
              {actions.slice(0, 4).map(action => (
                <button
                  key={action.id}
                  onClick={() => onAction(action.id, [])}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-${action.color}-500/20 hover:text-${action.color}-300`}
                >
                  <action.icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              ))}
              
              <button
                onClick={() => setShowActions(!showActions)}
                className="px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all duration-200"
              >
                More
              </button>
            </div>
          </div>
          
          <button
            onClick={onClear}
            className="ml-6 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {showActions && (
          <div className="border-t border-slate-700 p-4">
            <div className="grid grid-cols-2 gap-2">
              {actions.slice(4).map(action => (
                <button
                  key={action.id}
                  onClick={() => onAction(action.id, [])}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-${action.color}-500/20 hover:text-${action.color}-300`}
                >
                  <action.icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};