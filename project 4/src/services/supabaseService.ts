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
      department_id: ticket.department.id,
      department_name: ticket.department.name,
      assignee_id: ticket.assignee?.id,
      assignee_name: ticket.assignee?.name,
      assignee_email: ticket.assignee?.email,
      reporter_id: ticket.reporter.id,
      reporter_name: ticket.reporter.name,
      reporter_email: ticket.reporter.email,
      due_date: ticket.dueDate?.toISOString(),
      tags: ticket.tags,
      issue_type: ticket.issueType,
      order_number: ticket.orderNumber,
      order_value: ticket.orderValue,
      refund_value: ticket.refundValue,
      currency: ticket.currency,
      issue_category: ticket.issueCategory,
      sla_hours: ticket.slaHours,
      poc_name: ticket.pocName,
      escalation_level: ticket.escalationLevel,
      business_impact: ticket.businessImpact,
      resolution_time: ticket.resolutionTime ? new Date(Date.now() + ticket.resolutionTime * 60000).toISOString() : undefined,
      first_response_time: ticket.firstResponseTime ? new Date(Date.now() + ticket.firstResponseTime * 60000).toISOString() : undefined,
      watchers: ticket.watchers,
      linked_tickets: ticket.linkedTickets,
      custom_fields: ticket.customFields
    };
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
  async createTicket(ticket: Ticket): Promise<void> {
    const { error } = await supabase
      .from(TABLES.TICKETS)
      .insert(this.mapTicketToDatabaseTicket(ticket));

    if (error) throw error;
    console.log('✅ Ticket created in Supabase:', ticket.id);
  }

  async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<void> {
    const { error } = await supabase
      .from(TABLES.TICKETS)
      .update({
        ...this.mapTicketToDatabaseTicket(updates as Ticket),
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

  async loadTickets(): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from(TABLES.TICKETS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('✅ Loaded tickets from Supabase:', data?.length || 0);
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
    const { error } = await supabase
      .from(TABLES.USERS)
      .insert(this.mapUserToDatabaseUser(user));

    if (error) throw error;
    console.log('✅ User created in Supabase:', user.id);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const { error } = await supabase
      .from(TABLES.USERS)
      .update({
        ...this.mapUserToDatabaseUser(updates as User),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    console.log('✅ User updated in Supabase:', userId);
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