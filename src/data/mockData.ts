import { Ticket, User, Department, TicketStatus, Priority, Notification, IssueCategory } from '../types';

export const departments: Department[] = [
  { 
    id: '1', 
    name: 'Finance', 
    color: '#3B82F6', 
    description: 'Financial operations and accounting',
    slaHours: 24,
    issueCategories: [
      { name: 'Refunds not processed', slaHours: 24, poc: 'Rani', poc2: 'Rani' },
      { name: 'Invoices from credit partner', slaHours: 24, poc: 'Rani', poc2: 'Rani' },
      { name: 'Bank transfer', slaHours: 24, poc: 'Rani', poc2: 'Rani' },
      { name: 'Refund approval', slaHours: 24, poc: 'Hashim', poc2: '' }
    ]
  },
  { 
    id: '2', 
    name: 'Operations', 
    color: '#10B981', 
    description: 'Day-to-day business operations',
    slaHours: 24,
    issueCategories: [
      { name: 'TID live but stuck or delayed', slaHours: 24, poc: 'Waris', poc2: 'Husaain Ali Moosa' },
      { name: 'Missing Items', slaHours: 24, poc: 'Waris', poc2: 'Husaain Ali Moosa' },
      { name: 'Order Lost by courier', slaHours: 48, poc: 'Waris', poc2: 'Husaain Ali Moosa' },
      { name: 'Order stuck in customs', slaHours: 48, poc: 'Waris', poc2: 'Husaain Ali Moosa' },
      { name: 'Redelivery', slaHours: 48, poc: 'Waris', poc2: 'Husaain Ali Moosa' },
      { name: 'Damage in transit', slaHours: 48, poc: 'Waris', poc2: 'Husaain Ali Moosa' },
      { name: 'Order swap', slaHours: 48, poc: 'Khurram', poc2: 'Naeem' },
      { name: 'QC HOLD- pictures required', slaHours: 24, poc: 'Naeem', poc2: '' },
      { name: 'QC HOLD- replacements available but sheet not updated', slaHours: 24, poc: 'Naeem', poc2: '' },
      { name: 'QC HOLD- clarity for hold reason', slaHours: 24, poc: 'Naeem', poc2: '' },
      { name: 'QC HOLD- replacement ready for pickup', slaHours: 24, poc: 'Waqar Younus', poc2: '' },
      { name: 'QC HOLD- rtv', slaHours: 24, poc: 'Ali Jamshed', poc2: '' }
    ]
  },
  { 
    id: '3', 
    name: 'Supply', 
    color: '#F59E0B', 
    description: 'Supply chain and logistics',
    slaHours: 24,
    issueCategories: [
      { name: 'Row seller issues', slaHours: 24, poc: 'Albash', poc2: 'Shahiq' },
      { name: 'QC issues', slaHours: 24, poc: 'Naeem', poc2: '' },
      { name: 'Fulfillment', slaHours: 24, poc: '', poc2: '' },
      { name: 'PQ- incorrect sizes', slaHours: 48, poc: '', poc2: '' },
      { name: 'PQ- authenticity', slaHours: 48, poc: '', poc2: '' },
      { name: 'PQ- grading', slaHours: 48, poc: '', poc2: '' },
      { name: 'PQ- items do not match description', slaHours: 48, poc: '', poc2: '' },
      { name: 'QC HOLD- Seller not responding', slaHours: 24, poc: 'Malik', poc2: '' },
      { name: 'QC HOLD- Replacements not sent by the seller', slaHours: 24, poc: '', poc2: '' }
    ]
  },
  { 
    id: '4', 
    name: 'Tech', 
    color: '#8B5CF6', 
    description: 'Technology and development',
    slaHours: 24,
    issueCategories: [
      { name: 'Tech related issues', slaHours: 24, poc: '', poc2: '' }
    ]
  },
  { 
    id: '5', 
    name: 'Growth', 
    color: '#EF4444', 
    description: 'Marketing and growth initiatives',
    slaHours: 24,
    issueCategories: [
      { name: 'Affiliate buyer issues', slaHours: 24, poc: 'Lissy', poc2: '' },
      { name: 'PQ- authenticity', slaHours: 48, poc: '', poc2: '' }
    ]
  },
  { 
    id: '6', 
    name: 'CX', 
    color: '#6B7280', 
    description: 'Customer experience and support',
    slaHours: 12,
    issueCategories: [
      { name: 'Cancellation', slaHours: 12, poc: 'Abigail', poc2: 'Abigail' },
      { name: 'Discount vouchers', slaHours: 12, poc: 'Abigail', poc2: 'Abigail' }
    ]
  },
  {
    id: '7',
    name: 'Engineers',
    color: '#059669',
    description: 'Engineering and technical support',
    slaHours: 24,
    issueCategories: [
      { name: 'Tech related issues', slaHours: 24, poc: '', poc2: '' }
    ]
  },
  {
    id: '8',
    name: 'Seller Support',
    color: '#DC2626',
    description: 'Seller support and management',
    slaHours: 24,
    issueCategories: [
      { name: 'QC HOLD- Seller not responding', slaHours: 24, poc: 'Malik', poc2: '' }
    ]
  }
];

export const users: User[] = [
  // Finance Department
  { id: '1', name: 'Sarah Chen', email: 'sarah@fleek.com', department: departments[0], role: 'manager' },
  { id: '2', name: 'Rani', email: 'rani@fleek.com', department: departments[0], role: 'agent' },
  { id: '3', name: 'Hashim', email: 'hashim@fleek.com', department: departments[0], role: 'agent' },
  { id: '4', name: 'James Wilson', email: 'james@fleek.com', department: departments[0], role: 'agent' },
  
  // Operations Department
  { id: '5', name: 'Marcus Johnson', email: 'marcus@fleek.com', department: departments[1], role: 'manager' },
  { id: '6', name: 'Husaain Ali Moosa', email: 'husaain@fleek.com', department: departments[1], role: 'agent' },
  { id: '7', name: 'Waris', email: 'waris@fleek.com', department: departments[1], role: 'agent' },
  { id: '8', name: 'Khurram', email: 'khurram@fleek.com', department: departments[1], role: 'agent' },
  { id: '9', name: 'Naeem', email: 'naeem@fleek.com', department: departments[1], role: 'agent' },
  { id: '10', name: 'Ali Jamshed', email: 'ali.jamshed@fleek.com', department: departments[1], role: 'agent' },
  { id: '11', name: 'Wahab', email: 'wahab@fleek.com', department: departments[1], role: 'agent' },
  { id: '12', name: 'Haris', email: 'haris@fleek.com', department: departments[1], role: 'agent' },
  { id: '13', name: 'Waqar Younus', email: 'waqar@fleek.com', department: departments[1], role: 'agent' },
  
  // Supply Department
  { id: '14', name: 'Emily Watson', email: 'emily@fleek.com', department: departments[2], role: 'manager' },
  { id: '15', name: 'Shahiq', email: 'shahiq@fleek.com', department: departments[2], role: 'agent' },
  { id: '16', name: 'Albash', email: 'albash@fleek.com', department: departments[2], role: 'agent' },
  { id: '17', name: 'Hassan Arain', email: 'hassan@fleek.com', department: departments[2], role: 'agent' },
  { id: '18', name: 'KAMS', email: 'kams@fleek.com', department: departments[2], role: 'agent' },
  { id: '19', name: 'Ahmed Munir', email: 'ahmed.munir@fleek.com', department: departments[2], role: 'agent' },
  { id: '20', name: 'Ramish', email: 'ramish@fleek.com', department: departments[2], role: 'agent' },
  { id: '21', name: 'Faizan', email: 'faizan@fleek.com', department: departments[2], role: 'agent' },
  { id: '22', name: 'KAM', email: 'kam@fleek.com', department: departments[2], role: 'agent' },
  { id: '23', name: 'Malik', email: 'malik@fleek.com', department: departments[2], role: 'agent' },
  
  // Tech Department
  { id: '24', name: 'Kevin Zhang', email: 'kevin@fleek.com', department: departments[3], role: 'manager' },
  { id: '25', name: 'Eng', email: 'eng@fleek.com', department: departments[3], role: 'agent' },
  { id: '26', name: 'Chris Lee', email: 'chris@fleek.com', department: departments[3], role: 'agent' },
  { id: '27', name: 'Anna Kowalski', email: 'anna@fleek.com', department: departments[3], role: 'agent' },
  
  // Growth Department
  { id: '28', name: 'Jessica Liu', email: 'jessica@fleek.com', department: departments[4], role: 'manager' },
  { id: '29', name: 'Lissy', email: 'lissy@fleek.com', department: departments[4], role: 'agent' },
  { id: '30', name: 'Caoimhe', email: 'caoimhe@fleek.com', department: departments[4], role: 'agent' },
  { id: '31', name: 'Noah Johnson', email: 'noah@fleek.com', department: departments[4], role: 'agent' },
  
  // CX Department
  { id: '32', name: 'Isabella Moore', email: 'isabella@fleek.com', department: departments[5], role: 'manager' },
  { id: '33', name: 'Abigail', email: 'abigail@fleek.com', department: departments[5], role: 'agent' },
  { id: '34', name: 'Ava Lewis', email: 'ava@fleek.com', department: departments[5], role: 'agent' },
  { id: '35', name: 'Lucas Walker', email: 'lucas@fleek.com', department: departments[5], role: 'agent' },
  
  // Engineers Department
  { id: '36', name: 'Maya Patel', email: 'maya@fleek.com', department: departments[6], role: 'manager' },
  { id: '37', name: 'Sam Miller', email: 'sam@fleek.com', department: departments[6], role: 'agent' },
  
  // Seller Support Department
  { id: '38', name: 'Daniel Garcia', email: 'daniel@fleek.com', department: departments[7], role: 'manager' },
  { id: '39', name: 'Olivia White', email: 'olivia@fleek.com', department: departments[7], role: 'agent' },
];

// Auto-assignment function
export const getAutoAssignedUser = (departmentId: string, issueCategory?: string): User | null => {
  const department = departments.find(d => d.id === departmentId);
  if (!department) return null;

  if (issueCategory) {
    const category = department.issueCategories.find(cat => cat.name === issueCategory);
    if (category && category.poc) {
      // Try to find primary POC first
      let assignedUser = users.find(user => 
        user.name.toLowerCase() === category.poc.toLowerCase() && 
        user.department.id === departmentId
      );
      
      // If primary POC not found and there's a secondary POC, try that
      if (!assignedUser && category.poc2) {
        assignedUser = users.find(user => 
          user.name.toLowerCase() === category.poc2.toLowerCase() && 
          user.department.id === departmentId
        );
      }
      
      return assignedUser || null;
    }
  }

  // Fallback: assign to department manager or first available agent
  const departmentUsers = users.filter(user => user.department.id === departmentId);
  const manager = departmentUsers.find(user => user.role === 'manager');
  return manager || departmentUsers[0] || null;
};

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'assignment',
    title: 'New ticket assigned',
    message: 'TK-2024-007 has been assigned to you',
    ticketId: 'TK-2024-007',
    userId: '25',
    createdAt: new Date('2024-01-15T14:20:00'),
    read: false,
    actionUrl: '/tickets/TK-2024-007'
  },
  {
    id: 'notif-2',
    type: 'mention',
    title: 'You were mentioned',
    message: 'Marcus Johnson mentioned you in TK-2024-002',
    ticketId: 'TK-2024-002',
    userId: '5',
    createdAt: new Date('2024-01-15T10:15:00'),
    read: false,
    actionUrl: '/tickets/TK-2024-002'
  },
  {
    id: 'notif-3',
    type: 'reminder',
    title: 'Reminder: Follow up required',
    message: 'TK-2024-004 needs your response',
    ticketId: 'TK-2024-004',
    userId: '33',
    createdAt: new Date('2024-01-15T09:00:00'),
    read: true,
    actionUrl: '/tickets/TK-2024-004'
  },
  {
    id: 'notif-4',
    type: 'sla_breach',
    title: 'SLA Breach Alert',
    message: 'TK-2024-001 has exceeded its 12-hour SLA',
    ticketId: 'TK-2024-001',
    userId: '33',
    createdAt: new Date('2024-01-15T21:30:00'),
    read: false,
    actionUrl: '/tickets/TK-2024-001'
  }
];

export const mockTickets: Ticket[] = [
  {
    id: 'TK-2024-001',
    title: 'Customer requesting cancellation for premium dress order',
    description: 'Customer wants to cancel their order for a premium dress due to change in event plans. Order was placed 2 hours ago and payment has been processed.',
    status: 'assigned',
    priority: 'high',
    department: departments[5], // CX
    assignee: users[32], // Auto-assigned to Abigail (POC for Cancellation)
    reporter: users[0],
    createdAt: new Date('2024-01-15T09:30:00'),
    updatedAt: new Date('2024-01-15T09:30:00'),
    tags: ['cancellation', 'premium', 'urgent'],
    comments: [],
    dueDate: new Date('2024-01-15T21:30:00'), // 12 hours SLA for CX
    issueType: 'buyer',
    orderNumber: 'FL-2024-8834',
    orderValue: 299.99,
    currency: 'GBP',
    attachments: [],
    issueCategory: 'Cancellation',
    slaHours: 12,
    pocName: 'Abigail'
  },
  {
    id: 'TK-2024-002',
    title: 'Missing items from bulk Zara order',
    description: 'Customer reports 3 items missing from their bulk Zara winter collection order. Order was delivered yesterday but items are not in the package.',
    status: 'assigned',
    priority: 'medium',
    department: departments[1], // Operations
    assignee: users[6], // Auto-assigned to Waris (POC for Missing Items)
    reporter: users[4],
    createdAt: new Date('2024-01-14T14:20:00'),
    updatedAt: new Date('2024-01-15T10:15:00'),
    tags: ['missing-items', 'zara', 'bulk-order'],
    issueType: 'buyer',
    orderNumber: 'FL-2024-7721',
    orderValue: 2450.00,
    currency: 'GBP',
    comments: [
      {
        id: '1',
        content: 'Contacted customer to confirm missing items. Checking with warehouse team. @Husaain Ali Moosa please verify inventory.',
        author: users[6],
        createdAt: new Date('2024-01-15T10:15:00'),
        isInternal: true,
        type: 'comment',
        attachments: [],
        replies: []
      },
    ],
    attachments: [],
    dueDate: new Date('2024-01-15T14:20:00'), // 24 hours SLA
    issueCategory: 'Missing Items',
    slaHours: 24,
    pocName: 'Waris'
  },
  {
    id: 'TK-2024-003',
    title: 'Order lost by courier - Premium handbag delivery',
    description: 'Courier company reports that premium handbag order has been lost in transit. Customer is requesting immediate replacement or full refund.',
    status: 'assigned',
    priority: 'urgent',
    department: departments[1], // Operations
    assignee: users[6], // Auto-assigned to Waris (POC for Order Lost by courier)
    reporter: users[5],
    createdAt: new Date('2024-01-13T11:45:00'),
    updatedAt: new Date('2024-01-14T16:30:00'),
    tags: ['lost-order', 'courier', 'premium'],
    comments: [],
    dueDate: new Date('2024-01-15T11:45:00'), // 48 hours SLA
    issueType: 'buyer',
    orderNumber: 'FL-2024-6543',
    orderValue: 1250.00,
    currency: 'GBP',
    attachments: [],
    issueCategory: 'Order Lost by courier',
    slaHours: 48,
    pocName: 'Waris'
  },
  {
    id: 'TK-2024-004',
    title: 'Refund not processed for returned Nike shoes',
    description: 'Customer returned Nike shoes 5 days ago but refund has not been processed yet. Customer is following up via multiple channels.',
    status: 'assigned',
    priority: 'high',
    department: departments[0], // Finance
    assignee: users[1], // Auto-assigned to Rani (POC for Refunds not processed)
    reporter: users[32],
    createdAt: new Date('2024-01-12T16:20:00'),
    updatedAt: new Date('2024-01-14T09:45:00'),
    tags: ['refund', 'nike', 'delayed'],
    issueType: 'buyer',
    orderNumber: 'FL-2024-5432',
    orderValue: 129.99,
    currency: 'GBP',
    comments: [
      {
        id: '2',
        content: 'Checking with payment processor for refund status. Will update customer within 2 hours.',
        author: users[1],
        createdAt: new Date('2024-01-14T09:45:00'),
        isInternal: true,
        type: 'comment',
        attachments: [],
        replies: []
      },
    ],
    attachments: [],
    dueDate: new Date('2024-01-13T16:20:00'), // 24 hours SLA
    issueCategory: 'Refunds not processed',
    slaHours: 24,
    pocName: 'Rani'
  },
  {
    id: 'TK-2024-005',
    title: 'Tech issue: Payment gateway timeout errors',
    description: 'Multiple customers reporting payment gateway timeout errors during checkout. Affecting conversion rates significantly.',
    status: 'assigned',
    priority: 'urgent',
    department: departments[6], // Engineers
    assignee: users[36], // Auto-assigned to Maya Patel (Manager, since no specific POC)
    reporter: users[24],
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T12:15:00'),
    tags: ['payment', 'gateway', 'timeout', 'urgent'],
    comments: [
      {
        id: '4',
        content: 'Identified the issue with payment processor API. Implementing fix now.',
        author: users[36],
        createdAt: new Date('2024-01-15T12:15:00'),
        isInternal: true,
        type: 'comment',
        attachments: [],
        replies: []
      },
    ],
    attachments: [],
    issueType: 'internal',
    dueDate: new Date('2024-01-16T10:30:00'),
    issueCategory: 'Tech related issues',
    slaHours: 24,
    pocName: ''
  },
  {
    id: 'TK-2024-006',
    title: 'Affiliate buyer commission dispute',
    description: 'Affiliate partner claiming incorrect commission calculation for Q4 sales. Need to review and resolve the discrepancy.',
    status: 'assigned',
    priority: 'medium',
    department: departments[4], // Growth
    assignee: users[28], // Auto-assigned to Lissy (POC for Affiliate buyer issues)
    reporter: users[28],
    createdAt: new Date('2024-01-15T14:20:00'),
    updatedAt: new Date('2024-01-15T14:20:00'),
    tags: ['affiliate', 'commission', 'dispute'],
    comments: [],
    attachments: [],
    issueType: 'internal',
    dueDate: new Date('2024-01-16T14:20:00'),
    issueCategory: 'Affiliate buyer issues',
    slaHours: 24,
    pocName: 'Lissy'
  },
  {
    id: 'TK-2024-007',
    title: 'QC Hold - Seller not responding to quality concerns',
    description: 'Luxury handbag batch from Premium Brands Ltd has quality issues. Seller has not responded to our quality concerns for 48 hours.',
    status: 'assigned',
    priority: 'high',
    department: departments[2], // Supply
    assignee: users[22], // Auto-assigned to Malik (POC for QC HOLD- Seller not responding)
    reporter: users[14],
    createdAt: new Date('2024-01-13T16:45:00'),
    updatedAt: new Date('2024-01-15T09:30:00'),
    tags: ['qc-hold', 'seller-response', 'luxury'],
    comments: [
      {
        id: '5',
        content: 'Escalated to seller management. Awaiting response by EOD today.',
        author: users[22],
        createdAt: new Date('2024-01-15T09:30:00'),
        isInternal: true,
        type: 'comment',
        attachments: [],
        replies: []
      },
    ],
    attachments: [],
    issueType: 'seller',
    orderNumber: 'FL-2024-3210',
    orderValue: 1250.00,
    currency: 'GBP',
    dueDate: new Date('2024-01-14T16:45:00'), // 24 hours SLA - OVERDUE
    issueCategory: 'QC HOLD- Seller not responding',
    slaHours: 24,
    pocName: 'Malik'
  },
  {
    id: 'TK-2024-008',
    title: 'Order swap request - Wrong size delivered',
    description: 'Customer received wrong size for Adidas sneakers. Requesting swap for correct size. Original order was for size 9, received size 7.',
    status: 'assigned',
    priority: 'medium',
    department: departments[1], // Operations
    assignee: users[7], // Auto-assigned to Khurram (POC for Order swap)
    reporter: users[5],
    createdAt: new Date('2024-01-15T16:45:00'),
    updatedAt: new Date('2024-01-15T16:45:00'),
    tags: ['order-swap', 'wrong-size', 'adidas'],
    comments: [],
    attachments: [],
    issueType: 'buyer',
    orderNumber: 'FL-2024-2109',
    orderValue: 159.99,
    currency: 'GBP',
    dueDate: new Date('2024-01-17T16:45:00'), // 48 hours SLA
    issueCategory: 'Order swap',
    slaHours: 48,
    pocName: 'Khurram'
  }
];