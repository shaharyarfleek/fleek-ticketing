import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, ArrowRight, Clock, User, Tag } from 'lucide-react';
import { departments } from '../data/mockData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketSelect?: (ticketId: string) => void;
  onViewChange: (view: 'tickets' | 'analytics' | 'settings') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onTicketSelect,
  onViewChange
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { type: 'action', label: 'Go to Tickets', action: () => onViewChange('tickets'), icon: ArrowRight },
    { type: 'action', label: 'Go to Analytics', action: () => onViewChange('analytics'), icon: ArrowRight },
    { type: 'action', label: 'Go to Settings', action: () => onViewChange('settings'), icon: ArrowRight },
    // Commands will be populated dynamically based on actual tickets and users
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    (cmd.sublabel && cmd.sublabel.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-32 z-50">
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-6 py-4 border-b border-slate-100">
            <Command className="w-5 h-5 text-slate-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tickets, users, or actions..."
              className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 outline-none text-lg"
            />
            <kbd className="px-2 py-1 text-xs bg-slate-100 border border-slate-200 rounded text-slate-500">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No results found</p>
              </div>
            ) : (
              <div className="py-2">
                {filteredCommands.map((command, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      command.action();
                      onClose();
                    }}
                    className={`w-full flex items-center px-6 py-3 text-left transition-all duration-150 ${
                      index === selectedIndex
                        ? 'bg-slate-50 border-r-2 border-blue-500'
                        : 'hover:bg-slate-25'
                    }`}
                  >
                    <command.icon className={`w-4 h-4 mr-3 ${
                      command.type === 'ticket' ? 'text-blue-500' :
                      command.type === 'user' ? 'text-emerald-500' :
                      'text-slate-400'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{command.label}</div>
                      {command.sublabel && (
                        <div className="text-sm text-slate-500">{command.sublabel}</div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};