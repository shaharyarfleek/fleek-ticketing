import React, { useState } from 'react';
import { Reply, User, Attachment } from '../types';
import { formatDateTime } from '../utils/dateUtils';
import { MentionInput } from './MentionInput';
import { FileUpload, AttachmentList } from './FileUpload';
import { useAuth } from '../contexts/AuthContext';
import { Send, MessageSquare, User as UserIcon, ChevronDown, ChevronUp } from 'lucide-react';

interface CommentThreadProps {
  commentId: string;
  replies: Reply[];
  onAddReply: (commentId: string, reply: Omit<Reply, 'id' | 'createdAt'>) => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  commentId,
  replies,
  onAddReply
}) => {
  const { authState } = useAuth();
  const currentUser = authState.user || { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Admin', email: 'admin@fleek.com', department: { id: '1', name: 'Finance' }, role: 'admin' };
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [replyAttachments, setReplyAttachments] = useState<Attachment[]>([]);

  const handleFilesSelected = (files: File[]) => {
    const newAttachments: Attachment[] = files.map(file => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 'document',
      size: file.size,
      uploadedAt: new Date(),
      uploadedBy: currentUser
    }));

    setReplyAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setReplyAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleAddReply = () => {
    if (replyContent.trim() || replyAttachments.length > 0) {
      onAddReply(commentId, {
        content: replyContent,
        author: currentUser,
        isInternal,
        attachments: replyAttachments
      });
      
      setReplyContent('');
      setReplyAttachments([]);
      setShowReplyForm(false);
    }
  };

  const renderMentions = (content: string) => {
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    const parts = content.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <span
            key={index}
            className="bg-blue-100 text-blue-800 px-1 rounded font-medium"
          >
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  if (replies?.length || 0 === 0 && !showReplyForm) {
    return (
      <div className="ml-12 mt-2">
        <button
          onClick={() => setShowReplyForm(true)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1 transition-colors duration-200"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Reply</span>
        </button>
      </div>
    );
  }

  return (
    <div className="ml-12 mt-4 space-y-4">
      {replies?.length || 0 > 0 && (
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1 transition-colors duration-200"
        >
          {showReplies ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span>{replies?.length || 0} {replies?.length || 0 === 1 ? 'reply' : 'replies'}</span>
        </button>
      )}

      {showReplies && (
        <div className="space-y-4 border-l-2 border-gray-100 pl-4">
          {replies.map((reply) => (
            <div key={reply.id} className="flex space-x-3">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-3 h-3 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{reply.author.name}</span>
                  <span className="text-xs text-gray-500">{formatDateTime(reply.createdAt)}</span>
                  {reply.isInternal && (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                      Internal
                    </span>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{renderMentions(reply.content)}</p>
                  {reply.attachments && reply.attachments?.length > 0 && (
                    <div className="mt-2">
                      <AttachmentList attachments={reply.attachments} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showReplyForm && (
        <button
          onClick={() => setShowReplyForm(true)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1 transition-colors duration-200"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Reply</span>
        </button>
      )}

      {showReplyForm && (
        <div className="border-l-2 border-gray-100 pl-4">
          <div className="flex space-x-3">
            <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <MentionInput
                value={replyContent}
                onChange={setReplyContent}
                placeholder="Write a reply... (Type @ to mention someone)"
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none transition-all duration-200"
                rows={2}
              />
              
              <div className="mt-2">
                <FileUpload onFilesSelected={handleFilesSelected} className="mb-2" />
                <AttachmentList 
                  attachments={replyAttachments} 
                  onRemove={handleRemoveAttachment}
                  showRemove={true}
                />
              </div>

              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-xs text-gray-700">Internal note</span>
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent('');
                      setReplyAttachments([]);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddReply}
                    disabled={!replyContent.trim() && replyAttachments.length === 0}
                    className="bg-gray-900 text-white px-3 py-1 rounded text-xs hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors duration-200"
                  >
                    <Send className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};