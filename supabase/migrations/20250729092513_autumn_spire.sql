/*
  # Seed Initial Data for Fleek Ticketing System

  1. Departments
    - Create all departments with their issue categories and SLA settings
    
  2. Users
    - Create admin and sample users
    - Set up proper roles and department assignments
    
  3. Sample Tickets
    - Create representative tickets for testing
    
  4. Tags
    - Create common tags for ticket categorization
*/

-- Insert departments
INSERT INTO departments (id, name, color, description, sla_hours, issue_categories) VALUES
('dept-finance', 'Finance', '#3B82F6', 'Financial operations and accounting', 24, '[
  {"name": "Refunds not processed", "slaHours": 24, "poc": "Rani", "poc2": "Rani"},
  {"name": "Invoices from credit partner", "slaHours": 24, "poc": "Rani", "poc2": "Rani"},
  {"name": "Bank transfer", "slaHours": 24, "poc": "Rani", "poc2": "Rani"},
  {"name": "Refund approval", "slaHours": 24, "poc": "Hashim", "poc2": ""}
]'::jsonb),

('dept-operations', 'Operations', '#10B981', 'Day-to-day business operations', 24, '[
  {"name": "TID live but stuck or delayed", "slaHours": 24, "poc": "Waris", "poc2": "Husaain Ali Moosa"},
  {"name": "Missing Items", "slaHours": 24, "poc": "Waris", "poc2": "Husaain Ali Moosa"},
  {"name": "Order Lost by courier", "slaHours": 48, "poc": "Waris", "poc2": "Husaain Ali Moosa"},
  {"name": "Order stuck in customs", "slaHours": 48, "poc": "Waris", "poc2": "Husaain Ali Moosa"},
  {"name": "Redelivery", "slaHours": 48, "poc": "Waris", "poc2": "Husaain Ali Moosa"},
  {"name": "Damage in transit", "slaHours": 48, "poc": "Waris", "poc2": "Husaain Ali Moosa"},
  {"name": "Order swap", "slaHours": 48, "poc": "Khurram", "poc2": "Naeem"},
  {"name": "QC HOLD- pictures required", "slaHours": 24, "poc": "Naeem", "poc2": ""},
  {"name": "QC HOLD- replacements available but sheet not updated", "slaHours": 24, "poc": "Naeem", "poc2": ""},
  {"name": "QC HOLD- clarity for hold reason", "slaHours": 24, "poc": "Naeem", "poc2": ""},
  {"name": "QC HOLD- replacement ready for pickup", "slaHours": 24, "poc": "Waqar Younus", "poc2": ""},
  {"name": "QC HOLD- rtv", "slaHours": 24, "poc": "Ali Jamshed", "poc2": ""}
]'::jsonb),

('dept-supply', 'Supply', '#F59E0B', 'Supply chain and logistics', 24, '[
  {"name": "Row seller issues", "slaHours": 24, "poc": "Albash", "poc2": "Shahiq"},
  {"name": "QC issues", "slaHours": 24, "poc": "Naeem", "poc2": ""},
  {"name": "Fulfillment", "slaHours": 24, "poc": "", "poc2": ""},
  {"name": "PQ- incorrect sizes", "slaHours": 48, "poc": "", "poc2": ""},
  {"name": "PQ- authenticity", "slaHours": 48, "poc": "", "poc2": ""},
  {"name": "PQ- grading", "slaHours": 48, "poc": "", "poc2": ""},
  {"name": "PQ- items do not match description", "slaHours": 48, "poc": "", "poc2": ""},
  {"name": "QC HOLD- Seller not responding", "slaHours": 24, "poc": "Malik", "poc2": ""},
  {"name": "QC HOLD- Replacements not sent by the seller", "slaHours": 24, "poc": "", "poc2": ""}
]'::jsonb),

('dept-tech', 'Tech', '#8B5CF6', 'Technology and development', 24, '[
  {"name": "Tech related issues", "slaHours": 24, "poc": "", "poc2": ""}
]'::jsonb),

('dept-growth', 'Growth', '#EF4444', 'Marketing and growth initiatives', 24, '[
  {"name": "Affiliate buyer issues", "slaHours": 24, "poc": "Lissy", "poc2": ""},
  {"name": "PQ- authenticity", "slaHours": 48, "poc": "", "poc2": ""}
]'::jsonb),

('dept-cx', 'CX', '#6B7280', 'Customer experience and support', 12, '[
  {"name": "Cancellation", "slaHours": 12, "poc": "Abigail", "poc2": "Abigail"},
  {"name": "Discount vouchers", "slaHours": 12, "poc": "Abigail", "poc2": "Abigail"}
]'::jsonb),

('dept-engineers', 'Engineers', '#059669', 'Engineering and technical support', 24, '[
  {"name": "Tech related issues", "slaHours": 24, "poc": "", "poc2": ""}
]'::jsonb),

('dept-seller-support', 'Seller Support', '#DC2626', 'Seller support and management', 24, '[
  {"name": "QC HOLD- Seller not responding", "slaHours": 24, "poc": "Malik", "poc2": ""}
]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert users (passwords will be handled by auth system)
INSERT INTO users (id, username, email, name, password_hash, role, department_id, security_questions) VALUES
-- Admin user
('user-admin', 'admin', 'admin@fleek.com', 'System Administrator', '$2b$10$dummy_hash_for_admin123', 'admin', 'dept-finance', '{"questions": [{"question": "What was the name of your first pet?", "answer": "fluffy"}, {"question": "What city were you born in?", "answer": "new york"}]}'::jsonb),

-- Finance Department
('user-sarah', 'sarah.chen', 'sarah@fleek.com', 'Sarah Chen', '$2b$10$dummy_hash_for_password123', 'manager', 'dept-finance', '{"questions": [{"question": "What was the name of your first pet?", "answer": "buddy"}, {"question": "What city were you born in?", "answer": "chicago"}]}'::jsonb),
('user-rani', 'rani', 'rani@fleek.com', 'Rani', '$2b$10$dummy_hash_for_password123', 'agent', 'dept-finance', NULL),
('user-hashim', 'hashim', 'hashim@fleek.com', 'Hashim', '$2b$10$dummy_hash_for_password123', 'agent', 'dept-finance', NULL),

-- Operations Department
('user-marcus', 'marcus.johnson', 'marcus@fleek.com', 'Marcus Johnson', '$2b$10$dummy_hash_for_password123', 'manager', 'dept-operations', NULL),
('user-husaain', 'husaain', 'husaain@fleek.com', 'Husaain Ali Moosa', '$2b$10$dummy_hash_for_password123', 'agent', 'dept-operations', NULL),
('user-waris', 'waris', 'waris@fleek.com', 'Waris', '$2b$10$dummy_hash_for_password123', 'agent', 'dept-operations', NULL),
('user-khurram', 'khurram', 'khurram@fleek.com', 'Khurram', '$2b$10$dummy_hash_for_password123', 'agent', 'dept-operations', NULL),
('user-naeem', 'naeem', 'naeem@fleek.com', 'Naeem', '$2b$10$dummy_hash_for_password123', 'agent', 'dept-operations', NULL),

-- Supply Department
('user-emily', 'emily.watson', 'emily@fleek.com', 'Emily Watson', '$2b$10$dummy_hash_for_password123', 'manager', 'dept-supply', NULL),
('user-shahiq', 'shahiq', 'shahiq@fleek.com', 'Shahiq', '$2b$10$dummy_hash_for_password123', 'agent', 'dept-supply', NULL),
('user-albash', 'albash', 'albash@fleek.com', 'Albash', '$2b$10$dummy_hash_for_password123', 'agent', 'dept-supply', NULL),
('user-malik', 'malik', 'malik@fleek.com', 'Malik', '$2b$10$dummy_hash_for_password123', 'agent', 'dept-supply', NULL),

-- Tech Department
('user-kevin', 'kevin.zhang', 'kevin@fleek.com', 'Kevin Zhang', '$2b$10$dummy_hash_for_password123', 'manager', 'dept-tech', NULL),

-- Growth Department
('user-jessica', 'jessica.liu', 'jessica@fleek.com', 'Jessica Liu', '$2b$10$dummy_hash_for_password123', 'manager', 'dept-growth', NULL),
('user-lissy', 'lissy', 'lissy@fleek.com', 'Lissy', '$2b$10$dummy_hash_for_password123', 'agent', 'dept-growth', NULL),

-- CX Department
('user-isabella', 'isabella.moore', 'isabella@fleek.com', 'Isabella Moore', '$2b$10$dummy_hash_for_password123', 'manager', 'dept-cx', NULL),
('user-abigail', 'abigail', 'abigail@fleek.com', 'Abigail', '$2b$10$dummy_hash_for_password123', 'agent', 'dept-cx', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert common tags
INSERT INTO tags (name, color, usage_count) VALUES
('urgent', '#EF4444', 15),
('refund', '#F59E0B', 12),
('quality', '#8B5CF6', 8),
('shipping', '#10B981', 20),
('payment', '#3B82F6', 10),
('authentication', '#6366F1', 5),
('missing', '#F97316', 7),
('damaged', '#DC2626', 6),
('delayed', '#FBBF24', 9),
('cancelled', '#6B7280', 4),
('swap', '#14B8A6', 3),
('customs', '#84CC16', 2),
('courier', '#06B6D4', 8),
('seller', '#8B5CF6', 12),
('buyer', '#3B82F6', 18),
('technical', '#6366F1', 6),
('affiliate', '#EC4899', 3),
('discount', '#10B981', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert sample tickets
INSERT INTO tickets (id, title, description, status, priority, department_id, assignee_id, reporter_id, issue_type, issue_category, order_number, order_value, currency, sla_hours, poc_name, due_date) VALUES
('TK-2024-001', 'Customer requesting cancellation for premium dress order', 'Customer wants to cancel their order for a premium dress due to change in event plans. Order was placed 2 hours ago and payment has been processed.', 'assigned', 'high', 'dept-cx', 'user-abigail', 'user-sarah', 'buyer', 'Cancellation', 'FL-2024-8834', 299.99, 'USD', 12, 'Abigail', now() + interval '12 hours'),

('TK-2024-002', 'Missing items from bulk Zara order', 'Customer reports 3 items missing from their bulk Zara winter collection order. Order was delivered yesterday but items are not in the package.', 'assigned', 'medium', 'dept-operations', 'user-waris', 'user-marcus', 'buyer', 'Missing Items', 'FL-2024-7721', 2450.00, 'USD', 24, 'Waris', now() + interval '24 hours'),

('TK-2024-003', 'Order lost by courier - Premium handbag delivery', 'Courier company reports that premium handbag order has been lost in transit. Customer is requesting immediate replacement or full refund.', 'assigned', 'critical', 'dept-operations', 'user-waris', 'user-marcus', 'buyer', 'Order Lost by courier', 'FL-2024-6543', 1250.00, 'USD', 48, 'Waris', now() + interval '48 hours'),

('TK-2024-004', 'Refund not processed for returned Nike shoes', 'Customer returned Nike shoes 5 days ago but refund has not been processed yet. Customer is following up via multiple channels.', 'assigned', 'high', 'dept-finance', 'user-rani', 'user-isabella', 'buyer', 'Refunds not processed', 'FL-2024-5432', 129.99, 'USD', 24, 'Rani', now() - interval '12 hours'), -- Overdue

('TK-2024-005', 'Tech issue: Payment gateway timeout errors', 'Multiple customers reporting payment gateway timeout errors during checkout. Affecting conversion rates significantly.', 'assigned', 'critical', 'dept-engineers', 'user-kevin', 'user-kevin', 'system', 'Tech related issues', NULL, NULL, 'USD', 24, '', now() + interval '24 hours'),

('TK-2024-006', 'Affiliate buyer commission dispute', 'Affiliate partner claiming incorrect commission calculation for Q4 sales. Need to review and resolve the discrepancy.', 'assigned', 'medium', 'dept-growth', 'user-lissy', 'user-jessica', 'internal', 'Affiliate buyer issues', NULL, NULL, 'USD', 24, 'Lissy', now() + interval '24 hours'),

('TK-2024-007', 'QC Hold - Seller not responding to quality concerns', 'Luxury handbag batch from Premium Brands Ltd has quality issues. Seller has not responded to our quality concerns for 48 hours.', 'assigned', 'high', 'dept-supply', 'user-malik', 'user-emily', 'seller', 'QC HOLD- Seller not responding', 'FL-2024-3210', 1250.00, 'USD', 24, 'Malik', now() - interval '6 hours'), -- Overdue

('TK-2024-008', 'Order swap request - Wrong size delivered', 'Customer received wrong size for Adidas sneakers. Requesting swap for correct size. Original order was for size 9, received size 7.', 'assigned', 'medium', 'dept-operations', 'user-khurram', 'user-marcus', 'buyer', 'Order swap', 'FL-2024-2109', 159.99, 'USD', 48, 'Khurram', now() + interval '48 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert sample comments
INSERT INTO comments (ticket_id, author_id, content, is_internal) VALUES
('TK-2024-002', 'user-waris', 'Contacted customer to confirm missing items. Checking with warehouse team. @Husaain Ali Moosa please verify inventory.', true),
('TK-2024-004', 'user-rani', 'Checking with payment processor for refund status. Will update customer within 2 hours.', true),
('TK-2024-005', 'user-kevin', 'Identified the issue with payment processor API. Implementing fix now.', true),
('TK-2024-007', 'user-malik', 'Escalated to seller management. Awaiting response by EOD today.', true)
ON CONFLICT DO NOTHING;

-- Link tickets with tags
INSERT INTO ticket_tags (ticket_id, tag_id) 
SELECT t.id, tag.id 
FROM tickets t, tags tag 
WHERE 
  (t.id = 'TK-2024-001' AND tag.name IN ('cancelled', 'urgent')) OR
  (t.id = 'TK-2024-002' AND tag.name IN ('missing', 'shipping')) OR
  (t.id = 'TK-2024-003' AND tag.name IN ('courier', 'urgent')) OR
  (t.id = 'TK-2024-004' AND tag.name IN ('refund', 'delayed')) OR
  (t.id = 'TK-2024-005' AND tag.name IN ('technical', 'urgent', 'payment')) OR
  (t.id = 'TK-2024-006' AND tag.name IN ('affiliate', 'payment')) OR
  (t.id = 'TK-2024-007' AND tag.name IN ('seller', 'quality')) OR
  (t.id = 'TK-2024-008' AND tag.name IN ('swap', 'shipping'))
ON CONFLICT DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (user_id, ticket_id, notification_type, title, message, priority) VALUES
('user-kevin', 'TK-2024-007', 'assignment', 'New ticket assigned', 'TK-2024-007 has been assigned to you', 'medium'),
('user-marcus', 'TK-2024-002', 'mention', 'You were mentioned', 'Marcus Johnson mentioned you in TK-2024-002', 'medium'),
('user-abigail', 'TK-2024-004', 'reminder', 'Reminder: Follow up required', 'TK-2024-004 needs your response', 'medium'),
('user-abigail', 'TK-2024-001', 'sla_breach', 'SLA Breach Alert', 'TK-2024-001 has exceeded its 12-hour SLA', 'urgent')
ON CONFLICT DO NOTHING;