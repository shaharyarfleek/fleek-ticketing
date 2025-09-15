import React, { useState, useEffect } from 'react';
import { 
  TicketIcon, 
  BarChart3, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  Filter,
  Plus,
  Command,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  TrendingUp,
  Activity,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import { QuickActions } from './QuickActions';
import { CommandPalette } from './CommandPalette';
import { Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Logo, LogoIcon, LogoText } from '../config/logo';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'tickets' | 'analytics' | 'settings';
  onViewChange: (view: 'tickets' | 'analytics' | 'settings') => void;
  onTicketSelect?: (ticketId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onViewChange,
  onTicketSelect,
  searchQuery = '',
  onSearchChange
}) => {
  const { authState, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const unreadCount = (notifications || []).filter(n => !n.read).length;
  const urgentCount = (notifications || []).filter(n => n.priority === 'urgent' && !n.read).length;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNotificationClick = (ticketId: string) => {
    if (onTicketSelect) {
      onTicketSelect(ticketId);
    }
    onViewChange('tickets');
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'
    }`}>
      {/* Premium Header with Advanced Features */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-sm transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900/80 border-slate-700/60' 
          : 'bg-white/80 border-slate-200/60'
      }`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Premium Logo with Status Indicator */}
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 overflow-hidden ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-slate-700 to-slate-800' 
                      : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
                  }`}>
                    <LogoIcon className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <div className="hidden md:block">
                  <h1 className={`text-lg font-bold tracking-tight transition-colors duration-200 ${
                    isDarkMode ? 'text-white' : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent'
                  }`}>
                    {LogoText.full}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className={`text-xs transition-colors duration-200 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Internal System
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Navigation */}
              <nav className={`flex items-center space-x-1 rounded-2xl p-1 backdrop-blur-sm transition-all duration-300 ${
                isDarkMode ? 'bg-slate-800/60' : 'bg-slate-100/60'
              }`}>
                {[
                  { key: 'tickets', label: 'Tickets', icon: TicketIcon },
                  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
                  { key: 'settings', label: 'Settings', icon: Settings }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => onViewChange(key as any)}
                    className={`relative px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                      currentView === key
                        ? isDarkMode
                          ? 'bg-slate-700 text-white shadow-lg'
                          : 'bg-white text-slate-900 shadow-lg'
                        : isDarkMode
                          ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                    {currentView === key && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Advanced Search with AI Suggestions */}
              <div className="relative group">
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm ${
                  isDarkMode ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20' : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20'
                }`}></div>
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                    searchFocused 
                      ? 'text-blue-500' 
                      : isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search tickets, users, or use AI..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className={`pl-12 pr-16 py-3.5 w-96 text-sm border rounded-2xl transition-all duration-300 backdrop-blur-sm ${
                      searchFocused
                        ? isDarkMode
                          ? 'bg-slate-800/90 border-blue-500/30 ring-2 ring-blue-500/20 text-white'
                          : 'bg-white/90 border-blue-500/30 ring-2 ring-blue-500/20 text-slate-900'
                        : isDarkMode
                          ? 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600/60'
                          : 'bg-white/80 border-slate-200/60 text-slate-900 hover:bg-white hover:border-slate-300/60'
                    } placeholder-slate-400`}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <kbd className={`px-2 py-1 text-xs rounded border transition-colors duration-200 ${
                      isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <QuickActions />
              
              {/* Advanced Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-3.5 rounded-2xl transition-all duration-300 group ${
                    isDarkMode 
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/60'
                  }`}
                >
                  <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  {unreadCount > 0 && (
                    <>
                      <span className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center font-medium text-xs shadow-lg animate-pulse ${
                        urgentCount > 0 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      }`}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                      {urgentCount > 0 && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500/20 rounded-full animate-ping"></div>
                      )}
                    </>
                  )}
                </button>
                
                <NotificationPanel
                  isOpen={showNotifications}
                  onClose={() => setShowNotifications(false)}
                  onNotificationClick={handleNotificationClick}
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                />
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-3.5 rounded-2xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/60'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className={`p-3.5 rounded-2xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/60'
                }`}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              
              {/* Enhanced User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-3 p-2 rounded-2xl transition-all duration-300 group ${
                    isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:shadow-md ${
                      isDarkMode ? 'bg-gradient-to-br from-slate-700 to-slate-800' : 'bg-gradient-to-br from-slate-200 to-slate-300'
                    }`}>
                      <User className={`w-5 h-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-left">
                    <div className={`text-sm font-semibold transition-colors duration-200 ${
                      isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
                    }`}>
                      {authState.user?.name}
                    </div>
                    <div className={`text-xs capitalize ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {authState.user?.role}
                    </div>
                  </div>
                </button>

                {/* Enhanced User Dropdown */}
                {showUserMenu && (
                  <div className={`absolute top-full right-0 mt-2 w-80 rounded-3xl shadow-xl border overflow-hidden backdrop-blur-xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-800/95 border-slate-700/60' 
                      : 'bg-white/95 border-slate-200/60'
                  }`}>
                    <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                            isDarkMode ? 'bg-gradient-to-br from-slate-700 to-slate-800' : 'bg-gradient-to-br from-slate-200 to-slate-300'
                          }`}>
                            <User className={`w-7 h-7 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {authState.user?.name}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {authState.user?.email}
                          </div>
                          <div className={`text-xs capitalize mt-1 flex items-center space-x-1 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-400'
                          }`}>
                            <Activity className="w-3 h-3" />
                            <span>{authState.user?.role}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-2xl transition-all duration-200 group ${
                          isDarkMode 
                            ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' 
                            : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                        }`}
                      >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        <span className="font-medium">Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onTicketSelect={onTicketSelect}
        onViewChange={onViewChange}
      />

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </div>
  );
};