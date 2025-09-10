import { createClient } from '@supabase/supabase-js';

// Supabase configuration - works with both REACT_APP_ and VITE_ prefixes
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Database table names
export const TABLES = {
  TICKETS: 'tickets',
  USERS: 'users',
  COMMENTS: 'comments',
  REPLIES: 'replies',
  REMINDERS: 'reminders',
  ATTACHMENTS: 'attachments'
} as const;

// Type definitions for database tables
export interface DatabaseTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  department_id: string;
  department_name: string;
  assignee_id?: string;
  assignee_name?: string;
  assignee_email?: string;
  reporter_id: string;
  reporter_name: string;
  reporter_email: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  tags: string[]; // JSON array
  issue_type: string;
  order_number?: string;
  order_value?: number;
  refund_value?: number;
  currency?: string;
  issue_category?: string;
  sla_hours?: number;
  poc_name?: string;
  escalation_level: string;
  business_impact: string;
  resolution_time?: string;
  first_response_time?: string;
  watchers: string[]; // JSON array of user IDs
  linked_tickets: string[]; // JSON array of ticket IDs
  custom_fields: Record<string, any>; // JSON object
}

export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department_id: string;
  department_name: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface DatabaseComment {
  id: string;
  ticket_id: string;
  author_id: string;
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_internal: boolean;
}

export interface DatabaseReply {
  id: string;
  comment_id: string;
  author_id: string;
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
}

export interface DatabaseReminder {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  due_date: string;
  created_at: string;
  is_completed: boolean;
}

// SQL schema for creating tables (run this in Supabase SQL editor)
export const CREATE_TABLES_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  department_id VARCHAR(255) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(50) PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  priority VARCHAR(50) NOT NULL,
  department_id VARCHAR(255) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  assignee_id UUID REFERENCES users(id),
  assignee_name VARCHAR(255),
  assignee_email VARCHAR(255),
  reporter_id UUID NOT NULL REFERENCES users(id),
  reporter_name VARCHAR(255) NOT NULL,
  reporter_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  issue_type VARCHAR(50) NOT NULL,
  order_number VARCHAR(255),
  order_value DECIMAL(10,2),
  refund_value DECIMAL(10,2),
  currency VARCHAR(10),
  issue_category VARCHAR(255),
  sla_hours INTEGER,
  poc_name VARCHAR(255),
  escalation_level VARCHAR(50) DEFAULT 'none',
  business_impact VARCHAR(50) DEFAULT 'medium',
  resolution_time TIMESTAMP WITH TIME ZONE,
  first_response_time TIMESTAMP WITH TIME ZONE,
  watchers TEXT[] DEFAULT '{}',
  linked_tickets TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}'
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id VARCHAR(50) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_internal BOOLEAN DEFAULT FALSE
);

-- Create replies table
CREATE TABLE IF NOT EXISTS replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id VARCHAR(50) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT FALSE
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id VARCHAR(50) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_updated_at ON tickets(updated_at);
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_replies_comment_id ON replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_reminders_ticket_id ON reminders(ticket_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - customize based on your needs)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on tickets" ON tickets FOR ALL USING (true);
CREATE POLICY "Allow all operations on comments" ON comments FOR ALL USING (true);
CREATE POLICY "Allow all operations on replies" ON replies FOR ALL USING (true);
CREATE POLICY "Allow all operations on reminders" ON reminders FOR ALL USING (true);
CREATE POLICY "Allow all operations on attachments" ON attachments FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// Environment variables template for .env file
export const ENV_TEMPLATE = `
# Add these to your .env file in the project root:
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
`;

// Schema and setup instructions are in SUPABASE_SETUP.md