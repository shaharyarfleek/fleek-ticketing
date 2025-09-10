-- Initial data setup for Supabase
-- Run this after creating the tables

-- Create a default admin user
INSERT INTO users (id, name, email, role, department_id, department_name, is_active) 
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'System Administrator',
  'admin@fleek.com',
  'admin',
  'dept-001',
  'Engineering',
  true
) ON CONFLICT (id) DO NOTHING;

-- Create additional default users (optional)
INSERT INTO users (id, name, email, role, department_id, department_name, is_active) VALUES
  ('b1eebc00-0c1b-4ef8-bb7e-7bb0ce481b22', 'John Doe', 'john@fleek.com', 'agent', 'dept-001', 'Engineering', true),
  ('c2eebc11-1d2c-4ef8-bb8f-8bb1ce592c33', 'Jane Smith', 'jane@fleek.com', 'team_lead', 'dept-002', 'Support', true),
  ('d3eebc22-2e3d-4ef8-bb9a-9bb2ce603d44', 'Bob Johnson', 'bob@fleek.com', 'agent', 'dept-002', 'Support', true)
ON CONFLICT (id) DO NOTHING;

-- You can also add some test tickets if needed (optional)
-- INSERT INTO tickets (id, title, description, status, priority, department_id, department_name, reporter_id, reporter_name, reporter_email, issue_type) 
-- VALUES (
--   'TK-2024-001',
--   'Test Ticket',
--   'This is a test ticket to verify the system is working',
--   'open',
--   'medium',
--   'dept-001',
--   'Engineering',
--   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
--   'System Administrator',
--   'admin@fleek.com',
--   'internal'
-- );

-- Verify the data was inserted
SELECT * FROM users;