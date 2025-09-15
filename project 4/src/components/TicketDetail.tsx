import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, Comment, User, Attachment, Reply, Reminder } from '../types';
import { formatDateTime, isOverdue } from '../utils/dateUtils';
import { departments } from '../data/mockData';
import { MentionInput } from './MentionInput';
import { FileUpload, AttachmentList } from './FileUpload';
import { CommentThread } from './CommentThread';
import { ReminderModal } from './ReminderModal';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  ArrowLeft,
  MessageSquare,
  Clock,
  User as UserIcon,
  AlertTriangle,
  Send,
  ChevronDown,
  CheckCircle2,
  Paperclip,
  Bell,
  DollarSign,
  Package,
  Globe,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';

interface TicketDetailProps {
  ticket: Ticket;
  onBack: () => void;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ 
  ticket, 
  onBack
}) => {
  console.log('🔧 TicketDetail: Starting render with ticket:', ticket?.id, ticket?.title);
  
  try {
    const { tickets, updateTicket, addComment, addReply, setReminder, loadTicketComments, users } = useData();
    const { authState } = useAuth();
    
    console.log('🔧 TicketDetail: DataContext loaded, tickets count:', tickets.length, 'users count:', users.length);
    
    // Get the live ticket data from DataContext instead of relying on static prop
    const liveTicket = tickets.find(t => t.id === ticket.id) || ticket;
    
    console.log('🔧 TicketDetail: Live ticket found:', !!liveTicket, 'ID:', liveTicket?.id);
    
    // Safety check to prevent crashes with incomplete ticket data
    if (!liveTicket || !liveTicket.id) {
      console.error('❌ TicketDetail: Invalid ticket data', { ticket, liveTicket, ticketsInContext: tickets.length });
      return (
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Ticket not found</h2>
            <p className="text-slate-600 mb-4">The requested ticket could not be loaded.</p>
            <button
              onClick={onBack}
              className="bg-slate-900 text-white px-6 py-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Back to Tickets
            </button>
          </div>
        </div>
      );
    }
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [commentAttachments, setCommentAttachments] = useState<Attachment[]>([]);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const currentUser = authState.user || { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Admin', email: 'admin@fleek.com', department: departments[0], role: 'admin' };

  // Load comments when ticket is opened (if not already loaded)
  useEffect(() => {
    if (liveTicket && liveTicket.id && (!liveTicket.comments || liveTicket.comments.length === 0)) {
      console.log('🔄 Loading comments for ticket:', liveTicket.id);
      try {
        loadTicketComments(liveTicket.id);
      } catch (error) {
        console.error('❌ Failed to load ticket comments:', error);
      }
    }
  }, [liveTicket?.id, loadTicketComments]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      await updateTicket(liveTicket.id, { status: newStatus });
      console.log('✅ Ticket status updated:', newStatus);
    } catch (error) {
      console.error('❌ Failed to update ticket status:', error);
    }
  };

  const handleAssigneeChange = async (userId: string) => {
    try {
      const newAssignee = userId ? users.find(u => u.id === userId) || null : null;
      const previousAssignee = liveTicket.assignee;
      
      // Update the ticket assignee
      await updateTicket(liveTicket.id, { assignee: newAssignee });
      
      // Generate automatic assignment comment
      let commentContent = '';
      if (!previousAssignee && newAssignee) {
        // New assignment
        commentContent = `${currentUser.name} assigned this ticket to @${newAssignee.name}`;
      } else if (previousAssignee && newAssignee && previousAssignee.id !== newAssignee.id) {
        // Reassignment
        commentContent = `${currentUser.name} reassigned this ticket from @${previousAssignee.name} to @${newAssignee.name}`;
      } else if (previousAssignee && !newAssignee) {
        // Unassignment
        commentContent = `${currentUser.name} unassigned this ticket from @${previousAssignee.name}`;
      }
      
      // Add the automatic comment if there was a change
      if (commentContent) {
        const assignmentComment: Comment = {
          id: `assignment-comment-${Date.now()}`,
          content: commentContent,
          author: currentUser,
          isInternal: false,
          type: 'comment',
          attachments: [],
          replies: [],
          createdAt: new Date()
        };
        
        await addComment(liveTicket.id, assignmentComment);
        console.log('✅ Assignment comment added:', commentContent);
      }
      
      console.log('✅ Ticket assignee updated:', newAssignee?.name || 'Unassigned');
    } catch (error) {
      console.error('❌ Failed to update ticket assignee:', error);
    }
  };

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

    setCommentAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setCommentAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleAddComment = async () => {
    if (newComment.trim() || commentAttachments.length > 0) {
      console.log('🔧 Attempting to add comment by user:', currentUser?.name, 'to ticket:', liveTicket.id);
      try {
        const comment: Comment = {
          id: `comment-${Date.now()}`,
          content: newComment,
          author: currentUser,
          isInternal,
          type: 'comment',
          attachments: commentAttachments,
          replies: [],
          createdAt: new Date()
        };
        
        await addComment(liveTicket.id, comment);
        setNewComment('');
        setCommentAttachments([]);
        console.log('✅ Comment added successfully');
      } catch (error) {
        console.error('❌ Failed to add comment:', error);
        alert(`Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleMarkAsSolved = async () => {
    console.log('🔧 Attempting to mark ticket as solved:', liveTicket.id, 'by user:', currentUser?.name);
    try {
      await updateTicket(liveTicket.id, { status: 'resolved' });
      console.log('✅ Ticket marked as solved successfully');
      // Auto-close window after marking as solved
      setTimeout(() => {
        onBack();
      }, 1500); // 1.5 second delay to show the status change
    } catch (error) {
      console.error('❌ Failed to mark ticket as solved:', error);
      alert(`Failed to mark ticket as solved: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSetReminder = async (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => {
    try {
      const reminder: Reminder = {
        id: `reminder-${Date.now()}`,
        createdAt: new Date(),
        ...reminderData
      };
      await setReminder(liveTicket.id, reminder);
      console.log('✅ Reminder set successfully');
    } catch (error) {
      console.error('❌ Failed to set reminder:', error);
    }
  };

  const canMarkAsSolved = () => {
    // Allow anyone to mark tickets as resolved
    console.log('🔧 CanMarkAsSolved check - Current user:', currentUser?.name, 'Ticket:', liveTicket.id);
    return true;
  };

  const canSetReminder = () => {
    return liveTicket.assignee && liveTicket.assignee.id === currentUser.id;
  };

  const getStatusOptions = (currentStatus: TicketStatus): TicketStatus[] => {
    const statusFlow: Record<TicketStatus, TicketStatus[]> = {
      new: ['assigned', 'in_progress', 'closed'],
      assigned: ['in_progress', 'awaiting_response', 'resolved', 'closed'],
      in_progress: ['awaiting_response', 'resolved', 'assigned'],
      awaiting_response: ['in_progress', 'resolved', 'closed'],
      resolved: ['closed', 'in_progress'],
      closed: ['in_progress']
    };
    return statusFlow[currentStatus] || [];
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'new': return 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200';
      case 'assigned': return 'text-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      case 'in_progress': return 'text-orange-700 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      case 'awaiting_response': return 'text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200';
      case 'resolved': return 'text-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200';
      case 'closed': return 'text-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200';
      default: return 'text-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-emerald-600';
      default: return 'text-slate-600';
    }
  };

  const getIssueTypeColor = (issueType: string) => {
    switch (issueType) {
      case 'buyer': return 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200';
      case 'seller': return 'text-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200';
      case 'internal': return 'text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200';
      default: return 'text-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200';
    }
  };

  const renderMentions = (content: string) => {
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    const parts = content.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const user = users.find(u => u.name === part);
        return (
          <span
            key={index}
            className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-medium"
          >
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  // Debug user loading
  console.log('🔧 TicketDetail User Debug:', {
    totalUsersFromContext: users.length,
    usersData: users,
    ticketDepartment: liveTicket.department,
    ticketDepartmentId: liveTicket.department?.id
  });

  // Filter users to show only those from the ticket's department
  const departmentUsers = users.filter(user => {
    const matches = user.department?.id === liveTicket.department?.id;
    console.log(`🔧 User ${user.name} (${user.department?.name}) matches ticket dept ${liveTicket.department?.name}:`, matches);
    return matches;
  });
  
  console.log('🔧 Filtered department users:', departmentUsers.length, departmentUsers.map(u => u.name));

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-6">
          <button
            onClick={onBack}
            className="group p-3 hover:bg-slate-100/60 rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-900 group-hover:scale-110 transition-all duration-200" />
          </button>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{liveTicket.title}</h1>
              {isOverdue(liveTicket.dueDate) && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-full">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Overdue</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-500">
              <span className="font-mono">{liveTicket.id}</span>
              <span>•</span>
              <span>Created {formatDateTime(liveTicket.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {canSetReminder() && (
            <button
              onClick={() => setShowReminderModal(true)}
              className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Bell className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Set Reminder</span>
            </button>
          )}
          
          {canMarkAsSolved() && liveTicket.status !== 'resolved' && liveTicket.status !== 'closed' && (
            <button
              onClick={handleMarkAsSolved}
              className="group bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2.5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Mark as Solved</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2 space-y-8">
          {/* Status and Priority Bar */}
          <div className="flex items-center flex-wrap gap-4">
            {/* SLA Information */}
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">SLA:</span>
              <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                isOverdue(liveTicket.dueDate) 
                  ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-700' 
                  : 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700'
              }`}>
                {liveTicket.slaHours || liveTicket.department.slaHours}h
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-700">Status:</span>
              <div className="relative">
                <select
                  value={liveTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  className={`appearance-none border rounded-lg px-3 py-1.5 pr-8 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200 ${getStatusColor(liveTicket.status)}`}
                >
                  <option value={liveTicket.status}>
                    {liveTicket.status.replace('_', ' ')}
                  </option>
                  {getStatusOptions(liveTicket.status).map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-700">Type:</span>
              <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getIssueTypeColor(liveTicket.issueType)}`}>
                {liveTicket.issueType}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Priority:</span>
              <span className={`text-sm font-semibold ${getPriorityColor(liveTicket.priority)}`}>
                {liveTicket.priority}
              </span>
            </div>

            {liveTicket.reminder && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Reminder Set</span>
              </div>
            )}
          </div>

          {/* Issue Category & POC */}
          {(liveTicket.issueCategory || liveTicket.pocName) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                Issue Details
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {liveTicket.issueCategory && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Issue Category</p>
                    <p className="font-semibold text-slate-900">{liveTicket.issueCategory}</p>
                  </div>
                )}
                {liveTicket.pocName && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Point of Contact</p>
                    <p className="font-semibold text-slate-900">
                      {liveTicket.pocName}
                      {liveTicket.assignee && (
                        <span className="ml-2 text-sm text-emerald-600 font-medium">
                          (Assigned: {liveTicket.assignee.name})
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Information */}
          {(liveTicket.orderNumber || liveTicket.orderValue) && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200/60 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-slate-600" />
                Order Information
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {liveTicket.orderNumber && (
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="text-sm text-slate-500">Order Number</p>
                      <p className="font-semibold text-slate-900 font-mono">{liveTicket.orderNumber}</p>
                    </div>
                  </div>
                )}
                {liveTicket.orderValue && (
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="text-sm text-slate-500">Order Value</p>
                      <p className="font-semibold text-slate-900">{liveTicket.currency} {liveTicket.orderValue.toFixed(2)}</p>
                    </div>
                  </div>
                )}
                {liveTicket.currency && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="text-sm text-slate-500">Currency</p>
                      <p className="font-semibold text-slate-900">{liveTicket.currency}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Description</h2>
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{liveTicket.description}</p>
            </div>
          </div>

          {/* Attachments */}
          {liveTicket.attachments?.length || 0 > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Paperclip className="w-5 h-5 mr-2" />
                Attachments
              </h2>
              <AttachmentList attachments={liveTicket.attachments} />
            </div>
          )}

          {/* Tags */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {liveTicket.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-lg text-sm font-medium border border-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Activity Timeline
            </h2>
            <div className="space-y-6">
              {(() => {
                console.log('🔧 Rendering comments - Total:', liveTicket.comments?.length || 0, 'Comments:', liveTicket.comments);
                return !liveTicket.comments || liveTicket.comments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No activity yet. Be the first to comment!</p>
                  </div>
                ) : (
                  liveTicket.comments.map((comment) => (
                  <div key={comment.id}>
                    <div className="flex space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="font-semibold text-slate-900">{comment.author.name}</span>
                          <span className="text-sm text-slate-500">{formatDateTime(comment.createdAt)}</span>
                          {comment.isInternal && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 text-xs rounded-full font-medium border border-amber-200">
                              Internal
                            </span>
                          )}
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4">
                          <p className="text-slate-700 leading-relaxed">{renderMentions(comment.content)}</p>
                          {comment.attachments && comment.attachments?.length > 0 && (
                            <div className="mt-4">
                              <AttachmentList attachments={comment.attachments} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Comment Thread */}
                    <CommentThread
                      commentId={comment.id}
                      replies={comment.replies || []}
                      onAddReply={(commentId: string, reply: Omit<Reply, 'id' | 'createdAt'>) => {
                        addReply(liveTicket.id, commentId, {
                          ...reply,
                          id: `reply-${Date.now()}`,
                          createdAt: new Date()
                        } as Reply);
                      }}
                    />
                  </div>
                  ))
                );
              })()}
            </div>

            {/* Add Comment */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <MentionInput
                    value={newComment}
                    onChange={setNewComment}
                    placeholder="Add a comment... (Type @ to mention someone, Enter to submit, Cmd+Enter for new line)"
                    className="w-full border border-slate-200/60 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 resize-none transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white"
                    rows={3}
                    onSubmit={handleAddComment}
                  />
                  
                  {/* File Upload for Comments */}
                  <div className="mt-4">
                    <FileUpload onFilesSelected={handleFilesSelected} className="mb-2" />
                    <AttachmentList 
                      attachments={commentAttachments} 
                      onRemove={handleRemoveAttachment}
                      showRemove={true}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-sm text-slate-700">Internal note</span>
                    </label>
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() && commentAttachments.length === 0}
                      className="group bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-2.5 rounded-xl hover:from-slate-800 hover:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none"
                    >
                      <Send className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Sidebar */}
        <div className="space-y-6">
          {/* Assignee */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              Assignee
            </h3>
            
            {/* Current Assignee Display */}
            {liveTicket.assignee && (
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-blue-900">{liveTicket.assignee.name}</div>
                    <div className="text-xs text-blue-700">{liveTicket.assignee.role} • {liveTicket.assignee.department.name}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Reassignment Dropdown */}
            <div className="relative">
              <select
                value={liveTicket.assignee?.id || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full appearance-none border border-slate-200/60 rounded-xl px-4 py-3 pr-10 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-300 bg-white/80 hover:bg-white"
              >
                <option value="">
                  {liveTicket.assignee ? 'Unassign ticket' : 'Select assignee'}
                </option>
                {departmentUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                    {user.id === liveTicket.assignee?.id ? ' - Currently Assigned' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            
            {!liveTicket.assignee && (
              <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-amber-700 font-medium">This ticket is unassigned</span>
                </div>
              </div>
            )}
          </div>

          {/* Department */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Department</h3>
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: liveTicket.department.color }}
              ></div>
              <span className="text-sm font-medium text-slate-700">{liveTicket.department.name}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Timeline
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-900 font-medium">{formatDateTime(liveTicket.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Updated</span>
                <span className="text-slate-900 font-medium">{formatDateTime(liveTicket.updatedAt)}</span>
              </div>
              {liveTicket.dueDate && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Due</span>
                  <span className={`font-semibold ${isOverdue(liveTicket.dueDate) ? 'text-red-600' : 'text-slate-900'}`}>
                    {formatDateTime(liveTicket.dueDate)}
                  </span>
                </div>
              )}
              {liveTicket.reminder && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Reminder</span>
                  <span className="text-orange-600 font-semibold">
                    {formatDateTime(liveTicket.reminder.reminderTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reporter */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Reporter</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700">{liveTicket.reporter.name}</div>
                <div className="text-xs text-slate-500">{liveTicket.reporter.department.name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onSetReminder={handleSetReminder}
        ticketId={liveTicket.id}
        userId={currentUser.id}
      />
    </div>
  );
  } catch (error) {
    console.error('❌ TicketDetail: Caught error during render:', error);
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error loading ticket</h2>
          <p className="text-slate-600 mb-4">
            There was an error loading the ticket details: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button
            onClick={onBack}
            className="bg-slate-900 text-white px-6 py-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }
};