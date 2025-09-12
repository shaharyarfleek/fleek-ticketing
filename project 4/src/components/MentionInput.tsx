import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { useData } from '../contexts/DataContext';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  onSubmit?: () => void;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  rows = 3,
  onSubmit
}) => {
  const { users: dataUsers } = useData();
  const [users, setUsers] = useState<User[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use users directly from DataContext
  useEffect(() => {
    setUsers(dataUsers);
    console.log('🔧 MentionInput - Users from DataContext:', dataUsers.length, dataUsers.map(u => u.name));
  }, [dataUsers]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    onChange(newValue);

    // Check for @ mentions
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      console.log('🔧 Mention detected:', mentionMatch, 'Query:', mentionMatch[1]);
      console.log('🔧 Available users:', users.length, 'Filtered users will be:', users.filter(user =>
        user.name.toLowerCase().includes(mentionMatch[1].toLowerCase()) ||
        user.email.toLowerCase().includes(mentionMatch[1].toLowerCase())
      ).length);
      setShowMentions(true);
      setMentionQuery(mentionMatch[1]);
      setMentionPosition(cursorPosition - mentionMatch[0].length);
      setSelectedMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user: User) => {
    const beforeMention = value.substring(0, mentionPosition);
    const afterMention = value.substring(mentionPosition + mentionQuery.length + 1);
    const newValue = `${beforeMention}@${user.name} ${afterMention}`;
    
    onChange(newValue);
    setShowMentions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPosition = mentionPosition + user.name.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle mentions dropdown navigation
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredUsers[selectedMentionIndex]);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
      return;
    }

    // Handle form submission when not in mentions mode
    if (e.key === 'Enter') {
      if (e.metaKey || e.ctrlKey) {
        // Cmd+Enter or Ctrl+Enter: Insert new line (default behavior)
        return;
      } else {
        // Plain Enter: Submit form
        e.preventDefault();
        if (onSubmit) {
          onSubmit();
        }
      }
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={rows}
      />
      
      {(() => {
        console.log('🔧 Dropdown render check - showMentions:', showMentions, 'filteredUsers.length:', filteredUsers.length);
        return showMentions && filteredUsers.length > 0 && (
          <div className="absolute z-[9999] bg-white border-2 border-blue-300 rounded-lg shadow-2xl mt-1 max-h-48 overflow-y-auto w-full left-0 top-full">
          {filteredUsers.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => insertMention(user)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 ${
                index === selectedMentionIndex ? 'bg-gray-50' : ''
              }`}
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.department.name}</div>
              </div>
            </button>
          ))}
        </div>
        );
      })()}
    </div>
  );
};