import React, { useState } from 'react';
import { Plus, Zap, Filter, Download, Upload, MoreHorizontal } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);

  const actions = [
    { icon: Plus, label: 'New Ticket', shortcut: 'N', action: () => console.log('New ticket') },
    { icon: Filter, label: 'Quick Filter', shortcut: 'F', action: () => console.log('Filter') },
    { icon: Download, label: 'Export', shortcut: 'E', action: () => console.log('Export') },
    { icon: Upload, label: 'Import', shortcut: 'I', action: () => console.log('Import') },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-3.5 text-slate-400 hover:text-slate-600 transition-all duration-300 hover:bg-slate-100/60 rounded-2xl group"
      >
        <Zap className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden z-50">
          <div className="p-2">
            {actions.map(({ icon: Icon, label, shortcut, action }, index) => (
              <button
                key={index}
                onClick={() => {
                  action();
                  setShowMenu(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    {label}
                  </span>
                </div>
                <kbd className="px-2 py-1 text-xs bg-slate-100 border border-slate-200 rounded text-slate-500">
                  {shortcut}
                </kbd>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};