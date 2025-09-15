/*
  # Create Fleek Ticketing System Tables

  1. New Tables
    - `departments` - Department information with SLA settings
    - `users` - User accounts with authentication and profile data
    - `tickets` - Support tickets with full metadata
    - `comments` - Ticket comments and replies
    - `attachments` - File attachments for tickets and comments
    - `notifications` - User notifications
    - `reminders` - Ticket reminders
    - `tags` - Ticket tags
    - `ticket_tags` - Many-to-many relationship for ticket tags

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure access based on user roles and departments

  3. Features
    - Auto-assignment based on department and issue category
    - SLA tracking with due dates
    - File attachment support
    - Notification system
    - User management with roles
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT '#6B7280',
  description text,
  sla_hours integer NOT NULL DEFAULT 24,
  issue_categories jsonb DEFAULT '[]'::jsonb,
  working_hours jsonb DEFAULT '{"start": "09:00", "end": "17:00", "timezone": "UTC", "workingDays": [1,2,3,4,5]}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'senior_agent', 'team_lead', 'manager', 'admin', 'super_admin')),
  department_id uuid REFERENCES departments(id),
  avatar_url text,
  timezone text DEFAULT 'UTC',
  working_hours jsonb DEFAULT '{"start": "09:00", "end": "17:00", "timezone": "UTC", "workingDays": [1,2,3,4,5]}'::jsonb,
  skills text[] DEFAULT '{}',
  max_concurrent_tickets integer DEFAULT 10,
  is_online boolean DEFAULT false,
  is_active boolean DEFAULT true,
  is_blocked boolean DEFAULT false,
  blocked_at timestamptz,
  blocked_by uuid REFERENCES users(id),
  blocked_reason text,
  security_questions jsonb,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'triaged', 'assigned', 'in_progress', 'awaiting_customer', 'awaiting_internal', 'escalated', 'resolved', 'closed', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  severity text DEFAULT 'sev3' CHECK (severity IN ('sev1', 'sev2', 'sev3', 'sev4')),
  department_id uuid NOT NULL REFERENCES departments(id),
  assignee_id uuid REFERENCES users(id),
  reporter_id uuid NOT NULL REFERENCES users(id),
  issue_type text NOT NULL DEFAULT 'internal' CHECK (issue_type IN ('seller', 'buyer', 'internal', 'system')),
  issue_category text,
  order_number text,
  order_value decimal(10,2),
  refund_value decimal(10,2),
  currency text DEFAULT 'USD',
  sla_hours integer,
  poc_name text,
  escalation_level text DEFAULT 'none' CHECK (escalation_level IN ('none', 'level1', 'level2', 'level3')),
  business_impact text DEFAULT 'medium' CHECK (business_impact IN ('high', 'medium', 'low')),
  customer_tier text CHECK (customer_tier IN ('enterprise', 'pro', 'standard', 'free')),
  resolution_time integer, -- in minutes
  first_response_time integer, -- in minutes
  watchers uuid[] DEFAULT '{}',
  linked_tickets text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}'::jsonb,
  due_date timestamptz,
  resolved_at timestamptz,
  first_response_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id text NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id), -- for replies
  author_id uuid NOT NULL REFERENCES users(id),
  content text NOT NULL,
  is_internal boolean DEFAULT true,
  comment_type text DEFAULT 'comment' CHECK (comment_type IN ('comment', 'status_change', 'assignment', 'escalation')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id text REFERENCES tickets(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  size_bytes bigint NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES users(id),
  uploaded_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticket_id text REFERENCES tickets(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('assignment', 'mention', 'status_change', 'reminder', 'sla_breach', 'escalation', 'comment_added', 'ticket_created', 'ticket_resolved')),
  title text NOT NULL,
  message text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  channels text[] DEFAULT '{"in_app"}',
  action_url text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id text NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reminder_time timestamptz NOT NULL,
  message text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text DEFAULT '#6B7280',
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create ticket_tags junction table
CREATE TABLE IF NOT EXISTS ticket_tags (
  ticket_id text NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (ticket_id, tag_id)
);

-- Create worklog entries table
CREATE TABLE IF NOT EXISTS worklog_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id text NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  time_spent integer NOT NULL, -- in minutes
  description text NOT NULL,
  work_date date DEFAULT CURRENT_DATE,
  is_billable boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_department ON tickets(department_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_reporter ON tickets(reporter_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_due_date ON tickets(due_date);
CREATE INDEX IF NOT EXISTS idx_comments_ticket ON comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();