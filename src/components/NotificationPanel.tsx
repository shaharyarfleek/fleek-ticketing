import React from 'react';
import { Bell, X, Clock, User, MessageSquare, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { Notification } from '../types';
import { formatDateTime } from '../utils/dateUtils';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick: (ticketId: string) => void;
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  onNotificationClick,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'mention':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'status_change':
        return <CheckCircle2 className="w-4 h-4 text-purple-600" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'sla_breach':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'from-blue-50 to-blue-100 border-blue-200';
      case 'mention':
        return 'from-emerald-50 to-emerald-100 border-emerald-200';
      case 'status_change':
        return 'from-purple-50 to-purple-100 border-purple-200';
      case 'reminder':
        return 'from-orange-50 to-orange-100 border-orange-200';
      case 'sla_breach':
        return 'from-red-50 to-red-100 border-red-200';
      default:
        return 'from-slate-50 to-slate-100 border-slate-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 z-50 overflow-hidden">
      {/* Premium Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl">
              <Bell className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-500">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors duration-200 px-2 py-1 hover:bg-slate-100 rounded-lg"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="font-medium text-slate-900 mb-2">All caught up!</h4>
            <p className="text-slate-500 text-sm">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group p-4 hover:bg-slate-50 cursor-pointer transition-all duration-200 ${
                  !notification.read ? 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50' : ''
                }`}
                onClick={() => {
                  onMarkAsRead(notification.id);
                  onNotificationClick(notification.ticketId);
                  onClose();
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 mt-0.5 p-2 rounded-xl bg-gradient-to-r ${getNotificationColor(notification.type)} border`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-slate-800 transition-colors duration-200">
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse" />
                        )}
                        <Sparkles className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDateTime(notification.createdAt)}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};