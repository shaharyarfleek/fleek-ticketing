import { supabase, TABLES, DatabaseTicket, DatabaseUser, DatabaseComment, DatabaseReply, DatabaseReminder } from './supabase';
import { Ticket, User, Comment, Reply, Reminder, TicketStatus } from '../types';

class SupabaseService {
  // Convert database types to app types
  private mapDatabaseTicketToTicket(dbTicket: DatabaseTicket): Ticket {
    return {
      id: dbTicket.id,
      title: dbTicket.title,
      description: dbTicket.description,
      status: dbTicket.status as TicketStatus,
      priority: dbTicket.priority as any,
      department: {
        id: dbTicket.department_id,
        name: dbTicket.department_name,
        description: '',
        color: '#3B82F6'
      },
      assignee: dbTicket.assignee_id ? {
        id: dbTicket.assignee_id,
        name: dbTicket.assignee_name || '',
        email: dbTicket.assignee_email || '',
        role: 'agent',
        department: { id: dbTicket.department_id, name: dbTicket.department_name, description: '', color: '#3B82F6' },
        isBlocked: false
      } : null,
      reporter: {
        id: dbTicket.reporter_id,
        name: dbTicket.reporter_name,
        email: dbTicket.reporter_email,
        role: 'agent',
        department: { id: dbTicket.department_id, name: dbTicket.department_name, description: '', color: '#3B82F6' },
        isBlocked: false
      },
      createdAt: new Date(dbTicket.created_at),
      updatedAt: new Date(dbTicket.updated_at),
      dueDate: dbTicket.due_date ? new Date(dbTicket.due_date) : undefined,
      tags: dbTicket.tags || [],
      comments: [],
      issueType: dbTicket.issue_type as any,
      orderNumber: dbTicket.order_number,
      orderValue: dbTicket.order_value,
      refundValue: dbTicket.refund_value,
      currency: dbTicket.currency as any,
      issueCategory: dbTicket.issue_category,
      slaHours: dbTicket.sla_hours,
      pocName: dbTicket.poc_name,
      escalationLevel: dbTicket.escalation_level as any,
      businessImpact: dbTicket.business_impact as any,
      resolutionTime: dbTicket.resolution_time ? Math.floor((new Date(dbTicket.resolution_time).getTime() - new Date(dbTicket.created_at).getTime()) / 60000) : undefined,
      firstResponseTime: dbTicket.first_response_time ? Math.floor((new Date(dbTicket.first_response_time).getTime() - new Date(dbTicket.created_at).getTime()) / 60000) : undefined,
      watchers: dbTicket.watchers || [],
      linkedTickets: dbTicket.linked_tickets || [],
      customFields: dbTicket.custom_fields || {},
      reminder: undefined
    };
  }

  private mapTicketToDatabaseTicket(ticket: Ticket): Partial<DatabaseTicket> {
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      department_id: ticket.department?.id || 'dept-default',
      department_name: ticket.department?.name || 'Default Department',
      assignee_id: ticket.assignee?.id || null,
      assignee_name: ticket.assignee?.name || null,
      assignee_email: ticket.assignee?.email || null,
      reporter_id: ticket.reporter.id,
      reporter_name: ticket.reporter.name,
      reporter_email: ticket.reporter.email,
      due_date: ticket.dueDate?.toISOString() || null,
      tags: ticket.tags || [],
      issue_type: ticket.issueType || 'general',
      order_number: ticket.orderNumber || null,
      order_value: ticket.orderValue || null,
      refund_value: ticket.refundValue || null,
      currency: ticket.currency || null,
      issue_category: ticket.issueCategory || null,
      sla_hours: ticket.slaHours || null,
      poc_name: ticket.pocName || null,
      escalation_level: ticket.escalationLevel || 'none',
      business_impact: ticket.businessImpact || 'medium',
      // Handle resolution and response times correctly - these should be null for new tickets
      resolution_time: null,
      first_response_time: null,
      watchers: ticket.watchers || [],
      linked_tickets: ticket.linkedTickets || [],
      custom_fields: ticket.customFields || {}
    };
  }

  private mapPartialTicketToDatabaseTicket(ticket: Partial<Ticket>): Partial<DatabaseTicket> {
    console.log('🔧 Using PARTIAL mapping for ticket update:', Object.keys(ticket));
    const dbTicket: Partial<DatabaseTicket> = {};
    
    // Only map fields that are actually provided in the update
    if (ticket.id !== undefined) dbTicket.id = ticket.id;
    if (ticket.title !== undefined) dbTicket.title = ticket.title;
    if (ticket.description !== undefined) dbTicket.description = ticket.description;
    if (ticket.status !== undefined) dbTicket.status = ticket.status;
    if (ticket.priority !== undefined) dbTicket.priority = ticket.priority;
    if (ticket.department) {
      dbTicket.department_id = ticket.department.id;
      dbTicket.department_name = ticket.department.name;
    }
    if (ticket.assignee !== undefined) {
      dbTicket.assignee_id = ticket.assignee?.id || null;
      dbTicket.assignee_name = ticket.assignee?.name || null;
      dbTicket.assignee_email = ticket.assignee?.email || null;
    }
    if (ticket.reporter) {
      dbTicket.reporter_id = ticket.reporter.id;
      dbTicket.reporter_name = ticket.reporter.name;
      dbTicket.reporter_email = ticket.reporter.email;
    }
    if (ticket.dueDate !== undefined) dbTicket.due_date = ticket.dueDate?.toISOString() || null;
    if (ticket.tags !== undefined) dbTicket.tags = ticket.tags || [];
    if (ticket.issueType !== undefined) dbTicket.issue_type = ticket.issueType || 'general';
    if (ticket.orderNumber !== undefined) dbTicket.order_number = ticket.orderNumber || null;
    if (ticket.orderValue !== undefined) dbTicket.order_value = ticket.orderValue || null;
    if (ticket.refundValue !== undefined) dbTicket.refund_value = ticket.refundValue || null;
    if (ticket.currency !== undefined) dbTicket.currency = ticket.currency || null;
    if (ticket.issueCategory !== undefined) dbTicket.issue_category = ticket.issueCategory || null;
    if (ticket.slaHours !== undefined) dbTicket.sla_hours = ticket.slaHours || null;
    if (ticket.pocName !== undefined) dbTicket.poc_name = ticket.pocName || null;
    if (ticket.escalationLevel !== undefined) dbTicket.escalation_level = ticket.escalationLevel || 'none';
    if (ticket.businessImpact !== undefined) dbTicket.business_impact = ticket.businessImpact || 'medium';
    if (ticket.watchers !== undefined) dbTicket.watchers = ticket.watchers || [];
    if (ticket.linkedTickets !== undefined) dbTicket.linked_tickets = ticket.linkedTickets || [];
    if (ticket.customFields !== undefined) dbTicket.custom_fields = ticket.customFields || {};
    
    return dbTicket;
  }

  private mapDatabaseUserToUser(dbUser: DatabaseUser): User {
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role as any,
      department: {
        id: dbUser.department_id,
        name: dbUser.department_name,
        description: '',
        color: '#3B82F6'
      },
      avatar: dbUser.avatar,
      isBlocked: !dbUser.is_active
    };
  }

  private mapUserToDatabaseUser(user: User): Partial<DatabaseUser> {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department_id: user.department.id,
      department_name: user.department.name,
      avatar: user.avatar,
      is_active: !user.isBlocked
    };
  }

  // Ticket operations
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private convertToValidUUID(id: string): string {
    // If already a valid UUID, return as is
    if (this.isValidUUID(id)) {
      return id;
    }
    
    // For non-UUID IDs like "user-1756737662078", map to admin UUID
    console.warn(`⚠️ Non-UUID ID detected: ${id}, using admin UUID`);
    return 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Admin UUID
  }

  async createTicket(ticket: Ticket): Promise<void> {
    try {
      const dbTicket = this.mapTicketToDatabaseTicket(ticket);
      
      // Ensure UUIDs are valid
      dbTicket.reporter_id = this.convertToValidUUID(dbTicket.reporter_id!);
      if (dbTicket.assignee_id) {
        dbTicket.assignee_id = this.convertToValidUUID(dbTicket.assignee_id);
      }
      
      console.log('🔄 Creating ticket in Supabase:', ticket.id);
      console.log('📄 Database ticket data:', {
        id: dbTicket.id,
        title: dbTicket.title,
        reporter_id: dbTicket.reporter_id,
        assignee_id: dbTicket.assignee_id,
        department_id: dbTicket.department_id,
        status: dbTicket.status,
        priority: dbTicket.priority
      });

      const { data, error } = await supabase
        .from(TABLES.TICKETS)
        .insert(dbTicket)
        .select();

      if (error) {
        console.error('❌ Supabase createTicket error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Failed to create ticket: ${error.message}`);
      }
      
      console.log('✅ Ticket created in Supabase:', ticket.id, data);
    } catch (error) {
      console.error('❌ Ticket creation failed:', error);
      throw error;
    }
  }

  async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<void> {
    const { error } = await supabase
      .from(TABLES.TICKETS)
      .update({
        ...this.mapPartialTicketToDatabaseTicket(updates),
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (error) throw error;
    console.log('✅ Ticket updated in Supabase:', ticketId);
  }

  async deleteTicket(ticketId: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.TICKETS)
      .delete()
      .eq('id', ticketId);

    if (error) throw error;
    console.log('✅ Ticket deleted from Supabase:', ticketId);
  }

  async loadTickets(limit = 50, offset = 0): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from(TABLES.TICKETS)
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    console.log(`✅ Loaded tickets from Supabase: ${data?.length || 0} (limit: ${limit}, offset: ${offset})`);
    return (data || []).map(this.mapDatabaseTicketToTicket);
  }

  async loadTicketComments(ticketId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from(TABLES.COMMENTS)
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const comments = (data || []).map((dbComment: DatabaseComment): Comment => ({
      id: dbComment.id,
      author: {
        id: dbComment.author_id,
        name: dbComment.author_name,
        email: dbComment.author_email,
        role: 'agent',
        department: { id: '', name: '', description: '', color: '#3B82F6' },
        isBlocked: false
      },
      content: dbComment.content,
      createdAt: new Date(dbComment.created_at),
      isInternal: dbComment.is_internal,
      replies: []
    }));

    // Load replies for each comment
    for (const comment of comments) {
      const { data: repliesData, error: repliesError } = await supabase
        .from(TABLES.REPLIES)
        .select('*')
        .eq('comment_id', comment.id)
        .order('created_at', { ascending: true });

      if (!repliesError && repliesData) {
        comment.replies = repliesData.map((dbReply: DatabaseReply): Reply => ({
          id: dbReply.id,
          author: {
            id: dbReply.author_id,
            name: dbReply.author_name,
            email: dbReply.author_email,
            role: 'agent',
            department: { id: '', name: '', description: '', color: '#3B82F6' },
            isBlocked: false
          },
          content: dbReply.content,
          createdAt: new Date(dbReply.created_at)
        }));
      }
    }

    return comments;
  }

  // Comment operations
  async addComment(ticketId: string, comment: Comment): Promise<void> {
    const { error } = await supabase
      .from(TABLES.COMMENTS)
      .insert({
        ticket_id: ticketId,
        author_id: comment.author.id,
        author_name: comment.author.name,
        author_email: comment.author.email,
        content: comment.content,
        is_internal: comment.isInternal || false
      });

    if (error) throw error;

    // Update ticket's updated_at timestamp
    await this.updateTicket(ticketId, { updatedAt: new Date() } as Partial<Ticket>);
    console.log('✅ Comment added to Supabase:', comment.id);
  }

  async addReply(ticketId: string, commentId: string, reply: Reply): Promise<void> {
    const { error } = await supabase
      .from(TABLES.REPLIES)
      .insert({
        comment_id: commentId,
        author_id: reply.author.id,
        author_name: reply.author.name,
        author_email: reply.author.email,
        content: reply.content
      });

    if (error) throw error;

    // Update ticket's updated_at timestamp
    await this.updateTicket(ticketId, { updatedAt: new Date() } as Partial<Ticket>);
    console.log('✅ Reply added to Supabase:', reply.id);
  }

  // User operations
  async createUser(user: User): Promise<void> {
    const dbUser = this.mapUserToDatabaseUser(user);
    
    // Ensure user ID is valid UUID
    if (!this.isValidUUID(dbUser.id!)) {
      console.warn(`⚠️ Invalid user UUID: ${dbUser.id}, skipping user creation`);
      return; // Skip creating users with invalid UUIDs
    }
    
    const { error } = await supabase
      .from(TABLES.USERS)
      .insert(dbUser);

    if (error) {
      // Handle duplicate user error gracefully
      if (error.code === '23505') { // unique constraint violation
        console.warn(`⚠️ User already exists: ${user.id}`);
        return;
      }
      throw error;
    }
    console.log('✅ User created in Supabase:', user.id);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    // Only update fields that are provided and valid
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.department !== undefined) {
      updateData.department_id = updates.department.id;
      updateData.department_name = updates.department.name;
    }
    if (updates.isBlocked !== undefined) updateData.is_active = !updates.isBlocked;

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from(TABLES.USERS)
      .update(updateData)
      .eq('id', userId);

    if (error) throw error;
    console.log('✅ User updated in Supabase:', userId);
  }

  async deleteUser(userId: string): Promise<void> {
    // Safety check - don't delete admin users
    const { data: user, error: getUserError } = await supabase
      .from(TABLES.USERS)
      .select('role')
      .eq('id', userId)
      .single();

    if (getUserError) throw getUserError;

    if (user.role === 'admin' || user.role === 'super_admin') {
      throw new Error('Cannot delete admin users');
    }

    // Instead of deleting, mark as inactive for safety
    const { error } = await supabase
      .from(TABLES.USERS)
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
    console.log('✅ User deactivated in Supabase:', userId);
  }

  async loadUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    console.log('✅ Loaded users from Supabase:', data?.length || 0);
    return (data || []).map(this.mapDatabaseUserToUser);
  }

  // Reminder operations
  async setReminder(ticketId: string, reminder: Reminder): Promise<void> {
    const { error } = await supabase
      .from(TABLES.REMINDERS)
      .insert({
        ticket_id: ticketId,
        user_id: reminder.userId,
        message: reminder.message,
        due_date: reminder.dueDate.toISOString()
      });

    if (error) throw error;
    console.log('✅ Reminder set in Supabase for ticket:', ticketId);
  }

  // Real-time subscriptions
  subscribeToTickets(callback: (tickets: Ticket[]) => void): () => void {
    const subscription = supabase
      .channel('tickets_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLES.TICKETS },
        async () => {
          try {
            const tickets = await this.loadTickets();
            callback(tickets);
          } catch (error) {
            console.error('Failed to reload tickets after change:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }

  subscribeToUsers(callback: (users: User[]) => void): () => void {
    const subscription = supabase
      .channel('users_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLES.USERS },
        async () => {
          try {
            const users = await this.loadUsers();
            callback(users);
          } catch (error) {
            console.error('Failed to reload users after change:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }

  // Ensure admin user exists and create sample users if database is empty
  async ensureAdminUserExists(): Promise<void> {
    try {
      // Check how many users exist
      const { data: allUsers, error: countError } = await supabase
        .from(TABLES.USERS)
        .select('id');

      if (countError) {
        console.error('❌ Error checking user count:', countError);
        return;
      }

      console.log('🔧 Current user count in database:', allUsers?.length || 0);

      // Check if admin user already exists
      const { data: existingAdmin, error: checkError } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('email', 'admin@fleek.com')
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw checkError;
      }

      // If admin doesn't exist, create it
      if (!existingAdmin) {
        const adminUser: User = {
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Fixed admin UUID
          name: 'System Administrator',
          email: 'admin@fleek.com',
          role: 'admin',
          department: { id: '1', name: 'Operations' },
          isBlocked: false,
          is_active: true
        };

        const { error: createError } = await supabase
          .from(TABLES.USERS)
          .insert([this.mapUserToDatabaseUser(adminUser)]);

        if (createError) {
          console.error('❌ Failed to create admin user:', createError);
        } else {
          console.log('✅ Admin user created successfully');
        }
      } else {
        console.log('✅ Admin user already exists');
      }

      // If database is mostly empty, create sample users for testing
      if ((allUsers?.length || 0) < 3) {
        console.log('🔧 Creating sample users for testing...');
        const sampleUsers: User[] = [
          {
            id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
            name: 'John Smith',
            email: 'john@fleek.com',
            role: 'agent',
            department: { id: '1', name: 'Operations' },
            isBlocked: false,
            is_active: true
          },
          {
            id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
            name: 'Jane Doe',
            email: 'jane@fleek.com',
            role: 'senior_agent',
            department: { id: '2', name: 'Marketing' },
            isBlocked: false,
            is_active: true
          }
        ];

        for (const user of sampleUsers) {
          try {
            const { error } = await supabase
              .from(TABLES.USERS)
              .insert([this.mapUserToDatabaseUser(user)]);
            
            if (error) {
              console.error(`❌ Failed to create sample user ${user.name}:`, error);
            } else {
              console.log(`✅ Sample user created: ${user.name}`);
            }
          } catch (err) {
            console.error(`❌ Error creating sample user ${user.name}:`, err);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error ensuring admin user exists:', error);
    }
  }

  // Authentication operations
  async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      // Ensure admin user exists before authentication
      await this.ensureAdminUserExists();
      
      // Handle special case for admin login
      let searchQuery = `email.ilike.%${username}%,name.ilike.%${username}%`;
      
      // If username is 'admin', also search for admin@fleek.com specifically
      if (username.toLowerCase() === 'admin') {
        searchQuery = `email.eq.admin@fleek.com,name.ilike.%admin%`;
      }
      
      // Find user by email or name (since we don't have username column)
      const { data: users, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .or(searchQuery);

      if (error) throw error;

      if (!users || users.length === 0) {
        throw new Error('User not found');
      }

      // For demo, we'll check against hardcoded passwords and localStorage stored passwords
      const user = users[0];
      const validPasswords: Record<string, string> = {
        'admin@fleek.com': 'admin123',
        'shaharyar@fleek.com': 'shaharyar123',
        'john@fleek.com': 'john123',
        'jane@fleek.com': 'jane123',
        'bob@fleek.com': 'bob123',
        // Additional users for demo
        'sarah@fleek.com': 'sarah123',
        'mike@fleek.com': 'mike123',
        'lisa@fleek.com': 'lisa123',
        'alex@fleek.com': 'alex123',
        'emma@fleek.com': 'emma123',
        'david@fleek.com': 'david123',
        // Generic password for any user not explicitly listed
        'agent@fleek.com': 'agent123',
        'support@fleek.com': 'support123'
      };

      // Check if password matches (multiple methods for flexibility)
      let isValidPassword = false;
      
      // Method 1: Check hardcoded passwords
      if (validPasswords[user.email]) {
        isValidPassword = validPasswords[user.email] === password;
        if (isValidPassword) console.log('🔑 Using hardcoded password for user:', user.email);
      }
      
      // Method 2: Check localStorage for user passwords (for newly created users)
      if (!isValidPassword) {
        const storedPassword = localStorage.getItem(`fleek_user_password_${user.id}`);
        if (storedPassword && storedPassword === password) {
          isValidPassword = true;
          console.log('🔑 Using stored password for user:', user.email);
        }
      }
      
      // Method 3: Auto-generate password based on name (multiple formats)
      if (!isValidPassword) {
        const firstName = user.name.split(' ')[0].toLowerCase();
        const autoPasswords = [
          `${firstName}123`,      // john123
          `${firstName}@123`,     // john@123
          `${firstName}_123`,     // john_123
          `${firstName}`,         // john
          `${user.name.toLowerCase().replace(/\s+/g, '')}123`, // johnsmith123 (full name)
        ];
        
        console.log('🔍 Debug auto-password:', {
          userName: user.name,
          firstName: firstName,
          possiblePasswords: autoPasswords,
          enteredPassword: password
        });
        
        for (const autoPassword of autoPasswords) {
          if (password === autoPassword) {
            isValidPassword = true;
            console.log('🔑 Using auto-generated password for user:', user.email, 'password:', autoPassword);
            break;
          }
        }
      }
      
      // Method 4: Fallback default password
      if (!isValidPassword) {
        const defaultPassword = 'fleek123';
        if (password === defaultPassword) {
          isValidPassword = true;
          console.log('🔑 Using fallback password for user:', user.email);
        }
      }

      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      if (!user.is_active) {
        throw new Error('Account is deactivated');
      }

      console.log('✅ User authenticated:', user.email);
      return this.mapDatabaseUserToUser(user);
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return null;
        }
        throw error;
      }

      return this.mapDatabaseUserToUser(data);
    } catch (error) {
      console.error('Failed to get user by email:', error);
      return null;
    }
  }

  // Health check
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('id')
        .limit(1);

      if (error) {
        console.error('Supabase connection test failed:', error);
        return false;
      }

      console.log('✅ Supabase connection test successful');
      return true;
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();