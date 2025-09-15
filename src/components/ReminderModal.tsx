import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { Reminder } from '../types';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  ticketId: string;
  userId: string;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  onSetReminder,
  ticketId,
  userId
}) => {
  const [reminderTime, setReminderTime] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reminderTime && message.trim()) {
      onSetReminder({
        ticketId,
        userId,
        reminderTime: new Date(reminderTime),
        message: message.trim(),
        isActive: true
      });
      
      setReminderTime('');
      setMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Set Reminder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Time *
            </label>
            <input
              type="datetime-local"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 resize-none"
              placeholder="What should we remind you about?"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              Set Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};