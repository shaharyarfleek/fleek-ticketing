// Enhanced type definitions for world-class ticketing system
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  severity: Severity;
  department: Department;
  assignee?: User;
  reporter: User;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  firstResponseAt?: Date;
  tags: string[];
  comments: Comment[];
  dueDate?: Date;
  attachments: Attachment[];
  issueType: IssueType;
  issueCategory?: string;
  orderNumber?: string;
  orderValue?: number;
  refundValue?: number;
  currency?: string;
  slaHours?: number;
  pocName?: string;
  escalationLevel: EscalationLevel;
  businessImpact: BusinessImpact;
  customerTier?: CustomerTier;
  resolutionTime?: number; // in minutes
  firstResponseTime?: number; // in minutes
  watchers: string[]; // user IDs
  linkedTickets: string[]; // related ticket IDs
  customFields: Record<string, any>;
  automationRules: AutomationRule[];
  slaBreaches: SLABreach[];
  worklog: WorklogEntry[];
}

export interface WorklogEntry {
  id: string;
  userId: string;
  timeSpent: number; // in minutes
  description: string;
  date: Date;
  billable: boolean;
}

export interface SLABreach {
  id: string;
  type: 'first_response' | 'resolution';
  breachedAt: Date;
  targetTime: Date;
  escalatedTo?: string;
  resolved: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  enabled: boolean;
}

export interface AutomationTrigger {
  type: 'status_change' | 'comment_added' | 'time_based' | 'assignment_change';
  value?: string;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

export interface AutomationAction {
  type: 'assign' | 'change_status' | 'add_comment' | 'send_notification' | 'escalate';
  value: string;
}

export interface TicketTemplate {
  id: string;
  name: string;
  department: string;
  issueCategory: string;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  customFields: Record<string, any>;
  automationRules: string[];
}

export interface BulkOperation {
  id: string;
  type: 'assign' | 'status_change' | 'add_tags' | 'delete';
  ticketIds: string[];
  value: any;
  performedBy: string;
  performedAt: Date;
}

export interface DepartmentMetrics {
  departmentId: string;
  totalTickets: number;
  openTickets: number;
  avgResolutionTime: number;
  avgFirstResponseTime: number;
  slaCompliance: number;
  topIssueCategories: Array<{ category: string; count: number }>;
  agentPerformance: Array<{ userId: string; metrics: AgentMetrics }>;
}

export interface AgentMetrics {
  ticketsAssigned: number;
  ticketsResolved: number;
  avgResolutionTime: number;
  avgFirstResponseTime: number;
  slaCompliance: number;
  customerSatisfaction?: number;
}

export type TicketStatus = 
  | 'new' 
  | 'triaged'
  | 'assigned' 
  | 'in_progress' 
  | 'awaiting_customer'
  | 'awaiting_internal'
  | 'escalated'
  | 'resolved' 
  | 'closed'
  | 'cancelled';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type Severity = 'sev1' | 'sev2' | 'sev3' | 'sev4';

export type EscalationLevel = 'none' | 'level1' | 'level2' | 'level3';

export type BusinessImpact = 'high' | 'medium' | 'low';

export type CustomerTier = 'enterprise' | 'pro' | 'standard' | 'free';

export type IssueType = 'seller' | 'buyer' | 'internal' | 'system';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | 'INR';

// Enhanced user interface
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: Department;
  role: UserRole;
  timezone?: string;
  workingHours?: WorkingHours;
  skills?: string[];
  maxConcurrentTickets?: number;
  isOnline?: boolean;
  lastSeen?: Date;
  isBlocked?: boolean;
}

export interface WorkingHours {
  start: string; // "09:00"
  end: string; // "17:00"
  timezone: string;
  workingDays: number[]; // [1,2,3,4,5] for Mon-Fri
}

export type UserRole = 'agent' | 'senior_agent' | 'team_lead' | 'manager' | 'admin';

// Enhanced department structure
export interface Department {
  id: string;
  name: string;
  color: string;
  description: string;
  slaHours?: number;
  escalationMatrix?: EscalationMatrix;
  issueCategories?: IssueCategory[];
  automationRules?: string[];
  workingHours?: WorkingHours;
  holidayCalendar?: string[];
}

export interface EscalationMatrix {
  level1: { timeHours: number; escalateTo: string[] };
  level2: { timeHours: number; escalateTo: string[] };
  level3: { timeHours: number; escalateTo: string[] };
}

export interface IssueCategory {
  name: string;
  slaHours: number;
  poc: string;
  poc2?: string;
  severity: Severity;
  automationRules: string[];
  requiredFields: string[];
  templates: string[];
}

// Enhanced filtering and search
export interface AdvancedFilters {
  status?: TicketStatus[];
  priority?: Priority[];
  severity?: Severity[];
  department?: string[];
  assignee?: string[];
  reporter?: string[];
  issueType?: IssueType[];
  issueCategory?: string[];
  tags?: string[];
  dateRange?: { start: Date; end: Date };
  slaStatus?: 'on_track' | 'at_risk' | 'breached';
  escalationLevel?: EscalationLevel[];
  businessImpact?: BusinessImpact[];
  customerTier?: CustomerTier[];
  hasAttachments?: boolean;
  customFields?: Record<string, any>;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: AdvancedFilters;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
}

// Notification enhancements
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  ticketId?: string;
  userId: string;
  createdAt: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: NotificationChannel[];
}

export type NotificationType = 
  | 'assignment' 
  | 'mention' 
  | 'status_change' 
  | 'reminder' 
  | 'sla_breach'
  | 'escalation'
  | 'comment_added'
  | 'ticket_created'
  | 'ticket_resolved';

export type NotificationChannel = 'in_app' | 'email' | 'slack' | 'sms';

// Analytics and reporting
export interface AnalyticsData {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  overallP90ResolutionTime: number;
  avgFirstResponseTime: number;
  slaBreaches: number;
  slaCompliance: number;
  ticketsByStatus: Record<TicketStatus, number>;
  ticketsByDepartment: Record<string, number>;
  ticketsByPriority: Record<Priority, number>;
  departmentResolutionTimes: Record<string, {
    avgResolutionTime: number;
    p90ResolutionTime: number;
    ticketCount: number;
    color: string;
  }>;
  ticketsBySeverity: Record<Severity, number>;
  resolutionTrends: Array<{ date: string; resolved: number; created: number }>;
  agentPerformance: Record<string, AgentMetrics>;
  departmentMetrics: Record<string, DepartmentMetrics>;
  customerSatisfaction: number;
  escalationRate: number;
}

export interface ReportConfig {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'agent_performance' | 'sla_compliance';
  filters: AdvancedFilters;
  schedule?: ReportSchedule;
  recipients: string[];
  format: 'pdf' | 'csv' | 'excel';
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  timezone: string;
  enabled: boolean;
}

// Missing interfaces for comments, replies, and reminders
export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  isInternal?: boolean;
  type?: 'comment' | 'status_change' | 'assignment';
  attachments?: Attachment[];
  replies?: Reply[];
}

export interface Reply {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
}

export interface Reminder {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  dueDate: Date;
  createdAt: Date;
  completed?: boolean;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: User;
}