import { Department } from '../types';

// Departments with updated issue type mapping based on your requirements
export const departments: Department[] = [
  { 
    id: '1', 
    name: 'Operations', 
    color: '#10B981', 
    description: 'Day-to-day business operations',
    slaHours: 24,
    issueCategories: [
      { name: 'TID live but stuck or delayed', slaHours: 24, poc: '', poc2: '' },
      { name: 'Missing Items', slaHours: 24, poc: '', poc2: '' },
      { name: 'Order Lost by courier', slaHours: 48, poc: '', poc2: '' },
      { name: 'Order stuck in customs', slaHours: 48, poc: '', poc2: '' },
      { name: 'Redelivery', slaHours: 48, poc: '', poc2: '' },
      { name: 'Damage in transit', slaHours: 48, poc: '', poc2: '' },
      { name: 'Order swap', slaHours: 48, poc: '', poc2: '' },
      { name: 'Row seller issues', slaHours: 24, poc: '', poc2: '' },
      { name: 'QC isssues', slaHours: 24, poc: '', poc2: '' },
      { name: 'Fulfillment', slaHours: 24, poc: '', poc2: '' },
      { name: 'QC HOLD- pictures required', slaHours: 24, poc: '', poc2: '' },
      { name: 'QC HOLD- replacements available but sheet not updated', slaHours: 24, poc: '', poc2: '' },
      { name: 'QC HOLD- clarity for hold reason', slaHours: 24, poc: '', poc2: '' },
      { name: 'QC HOLD- replacement ready for pickup', slaHours: 24, poc: '', poc2: '' },
      { name: 'QC HOLD- rtv', slaHours: 24, poc: '', poc2: '' }
    ]
  },
  { 
    id: '2', 
    name: 'Supply', 
    color: '#F59E0B', 
    description: 'Supply chain and logistics',
    slaHours: 24,
    issueCategories: [
      { name: 'Row seller issues', slaHours: 24, poc: '', poc2: '' },
      { name: 'QC isssues', slaHours: 24, poc: '', poc2: '' },
      { name: 'Fulfillment', slaHours: 24, poc: '', poc2: '' },
      { name: 'PQ- incorrect sizes', slaHours: 48, poc: '', poc2: '' },
      { name: 'PQ- authenticity', slaHours: 48, poc: '', poc2: '' },
      { name: 'PQ- grading', slaHours: 48, poc: '', poc2: '' },
      { name: 'PQ- items donot match description', slaHours: 48, poc: '', poc2: '' },
      { name: 'QC HOLD- Seller not responding', slaHours: 24, poc: '', poc2: '' },
      { name: 'QC HOLD- Replacements not sent by the seller', slaHours: 24, poc: '', poc2: '' }
    ]
  },
  { 
    id: '3', 
    name: 'Engineers', 
    color: '#8B5CF6', 
    description: 'Engineering and technical support',
    slaHours: 24,
    issueCategories: [
      { name: 'Tech related issues', slaHours: 24, poc: '', poc2: '' }
    ]
  },
  { 
    id: '4', 
    name: 'CX', 
    color: '#6B7280', 
    description: 'Customer experience and support',
    slaHours: 12,
    issueCategories: [
      { name: 'Cancellation', slaHours: 12, poc: '', poc2: '' },
      { name: 'Discount vouchers', slaHours: 12, poc: '', poc2: '' }
    ]
  },
  { 
    id: '5', 
    name: 'Finance', 
    color: '#3B82F6', 
    description: 'Financial operations and accounting',
    slaHours: 24,
    issueCategories: [
      { name: 'Refunds not processsed', slaHours: 24, poc: '', poc2: '' },
      { name: 'Invoices from credit partner', slaHours: 24, poc: '', poc2: '' },
      { name: 'Bank transfer', slaHours: 24, poc: '', poc2: '' },
      { name: 'Refund approval', slaHours: 24, poc: '', poc2: '' }
    ]
  },
  { 
    id: '6', 
    name: 'Growth', 
    color: '#EF4444', 
    description: 'Marketing and growth initiatives',
    slaHours: 24,
    issueCategories: [
      { name: 'Affiliate buyer  issues', slaHours: 24, poc: '', poc2: '' },
      { name: 'PQ- authenticity', slaHours: 48, poc: '', poc2: '' }
    ]
  },
  {
    id: '7',
    name: 'Seller Support',
    color: '#DC2626',
    description: 'Seller support and relationship management',
    slaHours: 24,
    issueCategories: [
      { name: 'QC HOLD- Seller not responding', slaHours: 24, poc: '', poc2: '' }
    ]
  }
];

// Auto-assignment function - now returns null since no users are predefined
export const getAutoAssignedUser = (departmentId: string, issueCategory?: string) => {
  return null; // Admin will assign users manually
};

// Empty arrays - no mock data
export const users: any[] = [];
export const mockNotifications: any[] = [];
export const mockTickets: any[] = [];