import React, { useState, useRef, useEffect, useDeferredValue } from 'react';
import { X, ChevronDown, Search, Package, DollarSign, Globe, RefreshCw } from 'lucide-react';
import { departments } from '../data/mockData';
import { Priority, Department, User, Attachment, IssueType, Currency } from '../types';
import { FileUpload, AttachmentList } from './FileUpload';
import { TagGenerator } from '../utils/tagGenerator';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useOrderSearch } from '../hooks/useOrderSearch';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: {
    title: string;
    description: string;
    priority: Priority;
    department: Department;
    assignee?: User;
    tags: string[];
    dueDate?: Date;
    attachments: Attachment[];
    issueType: IssueType;
    orderNumber?: string;
    orderValue?: number;
    refundValue?: number;
    currency?: Currency;
  }) => void;
}

const currencies: Currency[] = ['GBP', 'USD', 'EUR', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { authState } = useAuth();
  const { users: dataUsers } = useData();
  const { orders, suggestions, loading: ordersLoading, error: ordersError, searchStats, cacheInfo, searchOrders, searchOrdersImmediate, clearSearch, isTyping } = useOrderSearch();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [departmentId, setDepartmentId] = useState(departments[0].id);
  const [assigneeId, setAssigneeId] = useState('');
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [tags, setTags] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [issueType, setIssueType] = useState<IssueType>('internal');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderNumberSearch, setOrderNumberSearch] = useState('');
  const [showOrderNumberDropdown, setShowOrderNumberDropdown] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [orderValue, setOrderValue] = useState('');
  const [refundValue, setRefundValue] = useState('');
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [issueCategory, setIssueCategory] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  
  // Use users directly from DataContext instead of loading separately
  const users = dataUsers;
  
  // Debug users from DataContext
  useEffect(() => {
    console.log('🔄 NewTicketModal: Users from DataContext:', {
      userCount: users.length,
      usersData: users,
      userNames: users.map(u => u.name),
      userDepartments: users.map(u => u.department?.name || 'No Dept')
    });
  }, [users]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const orderDropdownRef = useRef<HTMLDivElement>(null);

  // Use deferred values for search results (low priority updates)
  const deferredOrders = useDeferredValue(orders);
  const deferredSuggestions = useDeferredValue(suggestions);
  
  // Get unique order numbers from search results
  const orderNumbers = deferredOrders.map(order => order.orderLineId);

  // Completely separate search effect - runs independently of typing
  useEffect(() => {
    // Set typing indicator immediately
    setIsUserTyping(true);
    
    // Create a timer to search after user stops typing
    const searchTimer = setTimeout(() => {
      setIsUserTyping(false);
      
      if (orderNumberSearch.trim().length >= 2) {
        searchOrders(orderNumberSearch.trim());
      } else if (orderNumberSearch.trim().length === 0) {
        clearSearch();
      }
    }, 300); // 300ms delay

    // Cleanup timer on every change
    return () => {
      clearTimeout(searchTimer);
    };
  }, [orderNumberSearch]); // Only depends on the input value

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAssigneeDropdown(false);
      }
      if (orderDropdownRef.current && !orderDropdownRef.current.contains(event.target as Node)) {
        setShowOrderNumberDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-generate tags when title, description, or category changes
  useEffect(() => {
    if (title || description || issueCategory) {
      const autoTags = TagGenerator.generateTags(
        title, 
        description, 
        issueCategory, 
        orderValue ? parseFloat(orderValue) : undefined
      );
      setGeneratedTags(autoTags);
      setTags(autoTags.join(', '));
    }
  }, [title, description, issueCategory, orderValue]);

  // Get tag suggestions as user types
  useEffect(() => {
    if (tags) {
      const lastTag = tags.split(',').pop()?.trim() || '';
      if (lastTag.length > 0) {
        const suggestions = TagGenerator.getSuggestedTags(lastTag);
        setTagSuggestions(suggestions);
      } else {
        setTagSuggestions([]);
      }
    }
  }, [tags]);

  const handleFilesSelected = (files: File[]) => {
    const newAttachments: Attachment[] = files.map(file => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 'document',
      size: file.size,
      uploadedAt: new Date(),
      uploadedBy: authState.user || { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Admin', email: 'admin@fits.com', department: departments[0], role: 'admin' }
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const validateRefundValue = (refund: string, order: string): boolean => {
    const refundNum = parseFloat(refund);
    const orderNum = parseFloat(order);
    if (refundNum && orderNum) {
      return refundNum <= orderNum;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate refund value
    if (refundValue && orderValue && !validateRefundValue(refundValue, orderValue)) {
      alert('Refund value cannot be greater than order value');
      return;
    }
    
    const selectedDepartment = departments.find(d => d.id === departmentId)!;
    
    // Manual assignment only
    const selectedAssignee = assigneeId ? users.find(u => u.id === assigneeId) : undefined;
    
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    onSubmit({
      title,
      description,
      priority,
      department: selectedDepartment,
      assignee: selectedAssignee,
      tags: tagArray,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      attachments,
      issueType,
      orderNumber: orderNumber.trim() || undefined,
      orderValue: orderValue ? parseFloat(orderValue) : undefined,
      refundValue: refundValue ? parseFloat(refundValue) : undefined,
      currency: orderValue ? currency : undefined,
      issueCategory: issueCategory || undefined,
      slaHours: issueCategory ? availableCategories.find(cat => cat.name === issueCategory)?.slaHours : selectedDepartment?.slaHours,
      pocName: issueCategory ? availableCategories.find(cat => cat.name === issueCategory)?.poc : undefined,
    });

    // Reset form
    resetForm();
    onClose();
  };

  const handleOrderNumberSelect = async (orderNum: string) => {
    setOrderNumber(orderNum);
    setOrderNumberSearch(orderNum);
    setShowOrderNumberDropdown(false);

    // Find the order details from BigQuery data
    const selectedOrder = orders.find(order => order.orderLineId === orderNum);
    if (selectedOrder) {
      // Always auto-populate order value and currency from BigQuery data
      setOrderValue(selectedOrder.orderValue ? selectedOrder.orderValue.toString() : '0');
      setCurrency(selectedOrder.currency as Currency);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDepartmentId(departments[0].id);
    setAssigneeId('');
    setAssigneeSearch('');
    setShowAssigneeDropdown(false);
    setTags('');
    setDueDate('');
    setAttachments([]);
    setIssueType('internal');
    setOrderNumber('');
    setOrderNumberSearch('');
    setShowOrderNumberDropdown(false);
    setOrderValue('');
    setRefundValue('');
    setCurrency('GBP');
    setIssueCategory('');
    setGeneratedTags([]);
    setTagSuggestions([]);
    setIssueCategory('');
  };

  // Filter users based on search and selected department
  const filteredUsers = users.filter(user => {
    // If no department is selected, show all users (for backwards compatibility)
    const matchesDepartment = !departmentId || user.department.id === departmentId;
    
    // Check search criteria
    const matchesSearch = assigneeSearch === '' || 
      user.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
      user.department.name.toLowerCase().includes(assigneeSearch.toLowerCase());
    
    return matchesDepartment && matchesSearch;
  });

  // Debug logging for user filtering
  console.log('🔧 NewTicketModal User Filter Debug:', {
    totalUsers: users.length,
    selectedDepartmentId: departmentId,
    selectedDepartmentName: departments.find(d => d.id === departmentId)?.name,
    filteredUsersCount: filteredUsers.length,
    filteredUserNames: filteredUsers.map(u => u.name),
    assigneeSearch
  });

  // Use search results directly (no client-side filtering needed)
  const filteredOrderNumbers = orderNumbers;

  // Group filtered users by department
  const usersByDepartment = departments.map(dept => ({
    department: dept,
    users: filteredUsers.filter(user => user.department.id === dept.id)
  })).filter(group => group.users.length > 0);

  const selectedAssignee = users.find(u => u.id === assigneeId);
  const selectedDepartment = departments.find(d => d.id === departmentId);
  const availableCategories = selectedDepartment?.issueCategories || [];

  const handleAssigneeSelect = (user: User) => {
    setAssigneeId(user.id);
    setAssigneeSearch(user.name);
    setShowAssigneeDropdown(false);
  };

  const clearAssignee = () => {
    setAssigneeId('');
    setAssigneeSearch('');
    setShowAssigneeDropdown(false);
  };

  const handleAssigneeSearchChange = (value: string) => {
    setAssigneeSearch(value);
    setShowAssigneeDropdown(true);
    
    // If search is cleared, also clear the selected assignee
    if (!value.trim()) {
      setAssigneeId('');
    }
  };

  const clearOrderNumber = () => {
    setOrderNumber('');
    setOrderNumberSearch('');
    setOrderValue('');
    setCurrency('GBP');
    setShowOrderNumberDropdown(false);
    clearSearch();
  };

  const handleOrderNumberSearchChange = (value: string) => {
    // ONLY update input value - nothing else!
    setOrderNumberSearch(value);
    setOrderNumber(value);
    setShowOrderNumberDropdown(true);
  };

  // Check if order fields should be shown
  const showOrderFields = issueType === 'buyer' || issueType === 'seller';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Create New Ticket</h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 resize-none"
              placeholder="Detailed description of the issue"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Type *
              </label>
              <div className="relative">
                <select
                  value={issueType}
                  onChange={(e) => {
                    setIssueType(e.target.value as IssueType);
                    setIssueCategory(''); // Reset issue category when department changes
                    // Clear order fields when switching to internal
                    if (e.target.value === 'internal') {
                      setOrderNumber('');
                      setOrderNumberSearch('');
                      setOrderValue('');
                      setCurrency('GBP');
                    }
                  }}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
                  required
                >
                  <option value="buyer">🛒 Buyer</option>
                  <option value="seller">🏪 Seller</option>
                  <option value="internal">🏢 Internal</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <div className="relative">
                <select
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    setIssueCategory(''); // Reset issue category when department changes
                  }}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
                  required
                >
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Issue Category - Department Linked */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Category (Optional)
              <span className="ml-2 text-xs text-gray-500">
                {availableCategories.length > 0 
                  ? `${availableCategories.length} categories available for ${selectedDepartment?.name}` 
                  : 'No categories defined for this department'
                }
              </span>
            </label>
            <div className="relative">
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
                disabled={availableCategories.length === 0}
              >
                <option value="">
                  {availableCategories.length > 0 
                    ? "Select issue category" 
                    : "No categories available for this department"
                  }
                </option>
                {availableCategories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Show selected category details */}
            {issueCategory && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm">
                  <div className="font-medium text-green-900">✓ Selected: {issueCategory}</div>
                  <div className="text-green-700 mt-1">
                    📅 SLA: {availableCategories.find(cat => cat.name === issueCategory)?.slaHours} hours
                  </div>
                  <div className="text-green-700">
                    🏢 Department: {selectedDepartment?.name}
                  </div>
                  {availableCategories.find(cat => cat.name === issueCategory)?.poc && (
                    <div className="text-green-700">
                      👤 POC: {availableCategories.find(cat => cat.name === issueCategory)?.poc}
                      {availableCategories.find(cat => cat.name === issueCategory)?.poc2 && 
                        ` / ${availableCategories.find(cat => cat.name === issueCategory)?.poc2}`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show available categories for reference */}
            {!issueCategory && availableCategories.length > 0 && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-600 mb-2">
                  📋 Available issue types for <strong>{selectedDepartment?.name}</strong>:
                </div>
                <div className="space-y-1">
                  {availableCategories.slice(0, 6).map(category => (
                    <div key={category.name} className="text-xs text-gray-700 flex items-center justify-between">
                      <span>• {category.name}</span>
                      <span className="text-gray-500">({category.slaHours}h SLA)</span>
                    </div>
                  ))}
                  {availableCategories.length > 6 && (
                    <div className="text-xs text-gray-500">
                      ... and {availableCategories.length - 6} more categories
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Information - Always show, but highlight when relevant */}
          <div className={`p-6 rounded-xl border-2 transition-all duration-200 ${
            showOrderFields 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Information
              {showOrderFields && (
                <span className="ml-3 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                  Required for {issueType} tickets
                </span>
              )}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Order Number - Searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                  <span>
                    <Package className="w-4 h-4 inline mr-1" />
                    Order Number
                  </span>
                  {ordersError && orderNumberSearch.length >= 2 && (
                    <button
                      type="button"
                      onClick={() => searchOrders(orderNumberSearch)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry Search
                    </button>
                  )}
                </label>
                <div className="relative" ref={orderDropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={orderNumberSearch}
                      onChange={(e) => handleOrderNumberSearchChange(e.target.value)}
                      onFocus={() => setShowOrderNumberDropdown(true)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder={ordersLoading ? "Loading orders..." : "Search or enter order number..."}
                      disabled={ordersLoading}
                    />
                    {(orderNumber || orderNumberSearch) && (
                      <button
                        type="button"
                        onClick={clearOrderNumber}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {showOrderNumberDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {isUserTyping && (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                            <span className="text-sm">Typing...</span>
                          </div>
                        </div>
                      )}
                      {!isUserTyping && ordersLoading && (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1" />
                          <div className="text-sm">Searching cached orders...</div>
                          <div className="text-xs text-gray-400 mt-1">Lightning fast results</div>
                        </div>
                      )}
                      {ordersError && (
                        <div className="px-4 py-3 text-red-500 text-center">
                          <div className="text-sm">Error loading orders</div>
                          <button
                            type="button"
                            onClick={() => orderNumberSearch.length >= 2 && searchOrders(orderNumberSearch)}
                            className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                            disabled={orderNumberSearch.length < 2}
                          >
                            {orderNumberSearch.length >= 2 ? 'Retry search' : 'Enter search term to retry'}
                          </button>
                        </div>
                      )}
                      {!ordersLoading && !ordersError && filteredOrderNumbers.length === 0 && orderNumberSearch.length >= 2 && (
                        <div className="px-4 py-2 text-gray-500 text-center">
                          <div className="text-sm">
                            No orders found matching "{orderNumberSearch}"
                          </div>
                          <div className="text-xs mt-1">
                            Try a different search term or order ID
                          </div>
                        </div>
                      )}
                      {!ordersLoading && !ordersError && orderNumberSearch.length < 2 && orderNumberSearch.length > 0 && (
                        <div className="px-4 py-2 text-gray-500 text-center">
                          <div className="text-sm">
                            Type at least 2 characters to search orders
                          </div>
                        </div>
                      )}
                      {!ordersLoading && !ordersError && filteredOrderNumbers.map((orderNum) => (
                        <button
                          key={orderNum}
                          type="button"
                          onClick={() => handleOrderNumberSelect(orderNum)}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center transition-colors duration-200 ${
                            orderNum === orderNumber ? 'bg-blue-50 text-blue-700' : ''
                          }`}
                        >
                          <Package className="w-4 h-4 mr-2 text-gray-400" />
                          {orderNum}
                          {orderNum === orderNumber && (
                            <div className="ml-auto text-blue-600">✓</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  🚀 Fast cached search • 
                  {isUserTyping ? '⌨️ Typing...' : ordersLoading ? '⏳ Searching...' : orders.length > 0 ? `📋 ${orders.length} matches found` : 'Type 2+ characters to search'}
                  {cacheInfo && ` • 💾 ${cacheInfo.totalOrders?.toLocaleString()} orders cached`}
                </p>
                
                {/* Search Suggestions - only show when not typing */}
                {!isUserTyping && !ordersLoading && deferredSuggestions.length > 0 && orderNumberSearch.length >= 2 && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs font-medium text-blue-700 mb-2">💡 Quick Suggestions:</div>
                    <div className="flex flex-wrap gap-1">
                      {deferredSuggestions.slice(0, 6).map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={async () => {
                            setOrderNumberSearch(suggestion);
                            setOrderNumber(suggestion);
                            // Use immediate search for suggestion clicks
                            await searchOrdersImmediate(suggestion);
                            handleOrderSelect(suggestion);
                            setShowOrderNumberDropdown(false);
                          }}
                          className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors duration-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Cache Status */}
                {!ordersLoading && cacheInfo && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-xs text-green-700">
                      <strong>⚡ High-Speed Cache:</strong> {orders.length} results from {cacheInfo.totalOrders?.toLocaleString()} cached orders
                      {searchStats && (
                        <span className="ml-2">
                          ({searchStats.exactMatches} exact, {searchStats.prefixMatches} prefix, {searchStats.containsMatches} contains)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Last updated: {cacheInfo.lastUpdated ? new Date(cacheInfo.lastUpdated).toLocaleTimeString() : 'N/A'} • Refreshes hourly
                    </div>
                  </div>
                )}
                
                {ordersError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-xs text-red-700">
                      <strong>⚠️ Search Error:</strong> {ordersError}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Value
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">£</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={orderValue}
                    onChange={(e) => setOrderValue(e.target.value)}
                    readOnly={!!orderNumber}
                    className={`w-full border rounded-lg pl-8 pr-4 py-3 transition-all duration-200 ${
                      orderNumber 
                        ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                        : 'border-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder={orderNumber ? 'Auto-filled from selected order' : '0.00'}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  💰 Amount in British Pounds
                  {orderNumber 
                    ? <span className="text-green-600"> • Auto-filled from selected order</span>
                    : <span> • Enter manually or select an order above</span>
                  }
                </p>
              </div>

              {/* Refund Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Value
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">£</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={orderValue || undefined}
                    value={refundValue}
                    onChange={(e) => setRefundValue(e.target.value)}
                    className={`w-full border rounded-lg pl-8 pr-4 py-3 focus:ring-1 transition-all duration-200 ${
                      refundValue && orderValue && !validateRefundValue(refundValue, orderValue)
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {refundValue && orderValue && !validateRefundValue(refundValue, orderValue) && (
                  <p className="text-xs text-red-600 mt-1">⚠️ Refund cannot exceed order value</p>
                )}
                <p className="text-xs text-gray-500 mt-1">💸 Refund amount in British Pounds</p>
              </div>
              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Currency
                </label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    {currencies.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-500 mt-1">🌍 Select currency</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee (Optional - Auto-assigned if Issue Category selected)
              </label>
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={assigneeSearch}
                    onChange={(e) => handleAssigneeSearchChange(e.target.value)}
                    onFocus={() => setShowAssigneeDropdown(true)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
                    placeholder="Search by name, email, or department..."
                  />
                  {(assigneeId || assigneeSearch) && (
                    <button
                      type="button"
                      onClick={clearAssignee}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {showAssigneeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {!assigneeId && (
                      <button
                        type="button"
                        onClick={clearAssignee}
                        className="w-full px-4 py-2 text-left text-gray-500 hover:bg-gray-50 border-b border-gray-100"
                      >
                        ❌ Unassigned
                      </button>
                    )}
                    
                    {usersByDepartment.length === 0 ? (
                      <div className="px-4 py-2 text-gray-500">No users found</div>
                    ) : (
                      usersByDepartment.map(({ department, users: deptUsers }) => (
                        <div key={department.id}>
                          <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 border-b border-gray-100">
                            🏢 {department.name}
                          </div>
                          {deptUsers.map(user => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => handleAssigneeSelect(user)}
                              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between transition-colors duration-200 ${
                                user.id === assigneeId ? 'bg-blue-50 text-blue-700' : ''
                              }`}
                            >
                              <div>
                                <div className="font-medium">👤 {user.name}</div>
                                <div className="text-sm text-gray-500">{user.role} • {user.email}</div>
                              </div>
                              {user.id === assigneeId && (
                                <div className="text-blue-600">✓</div>
                              )}
                            </button>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                {selectedAssignee && (
                  <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-800">✅ Selected: {selectedAssignee.name}</div>
                    <div className="text-xs text-green-600">{selectedAssignee.role} • {selectedAssignee.department.name}</div>
                    <div className="text-xs text-green-600 mt-1">Manual assignment will override auto-assignment</div>
                  </div>
                )}
                
                {!assigneeId && issueCategory && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-800">🤖 Auto-Assignment Enabled</div>
                    <div className="text-xs text-blue-600">
                      Will be automatically assigned to: {availableCategories.find(cat => cat.name === issueCategory)?.poc}
                      {availableCategories.find(cat => cat.name === issueCategory)?.poc2 && 
                        ` or ${availableCategories.find(cat => cat.name === issueCategory)?.poc2}`}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">🔍 Searchable field • 🤖 Auto-assigns based on Issue Category</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Auto-generated)
            </label>
            {generatedTags.length > 0 && (
              <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-900 mb-2">🤖 Auto-generated tags:</div>
                <div className="flex flex-wrap gap-2">
                  {generatedTags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
              placeholder="Edit auto-generated tags or add custom ones (comma-separated)"
            />
            {tagSuggestions.length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">💡 Suggested tags:</div>
                <div className="flex flex-wrap gap-1">
                  {tagSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        const currentTags = tags.split(',').map(t => t.trim()).filter(t => t);
                        const lastTagIndex = currentTags.length - 1;
                        currentTags[lastTagIndex] = suggestion;
                        setTags(currentTags.join(', '));
                      }}
                      className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-100 transition-colors duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <FileUpload onFilesSelected={handleFilesSelected} className="mb-4" />
            <AttachmentList 
              attachments={attachments} 
              onRemove={handleRemoveAttachment}
              showRemove={true}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};