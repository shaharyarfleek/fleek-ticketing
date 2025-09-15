import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, AuthUser, LoginCredentials, SignupData, AuthContextType } from '../types/auth';
import { departments } from '../data/mockData';
import { supabaseService } from '../services/supabaseService';
import { User } from '../types';

// Storage keys for session management
const STORAGE_KEYS = {
  AUTH_USER: 'fleek_auth_user'
};

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'SIGNUP_START' }
  | { type: 'SIGNUP_SUCCESS'; payload: AuthUser }
  | { type: 'SIGNUP_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_PROFILE'; payload: AuthUser };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'SIGNUP_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount and clean up old localStorage data
  useEffect(() => {
    // Clean up old localStorage-based user data (force migration to Supabase)
    const cleanupOldData = () => {
      // Remove old users database
      localStorage.removeItem('fleek_users_database');
      
      // Remove old user passwords (they had user-timestamp format IDs)
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('fleek_user_password_user-')) {
          localStorage.removeItem(key);
          console.log('🧹 Cleaned up old password:', key);
        }
      });

      // Check stored user for invalid ID format
      const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          // If user has invalid UUID format, remove it
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(user.id)) {
            console.log('🧹 Removing user with invalid UUID:', user.id);
            localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
          } else {
            // Valid UUID, but verify user exists in Supabase
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          }
        } catch (error) {
          localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
        }
      }
    };

    cleanupOldData();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Authenticate with Supabase
      const supabaseUser = await supabaseService.authenticateUser(credentials.username, credentials.password);
      
      if (!supabaseUser) {
        throw new Error('Invalid username/email or password');
      }

      // Convert Supabase User to AuthUser
      const authUser: AuthUser = {
        id: supabaseUser.id,
        username: supabaseUser.name.toLowerCase().replace(/\s+/g, ''), // Convert name to username
        email: supabaseUser.email,
        name: supabaseUser.name,
        role: supabaseUser.role as any,
        department: supabaseUser.department,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: !supabaseUser.isBlocked,
        isBlocked: supabaseUser.isBlocked,
      };

      // Always store in localStorage for session management
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(authUser));

      dispatch({ type: 'LOGIN_SUCCESS', payload: authUser });
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
      throw error;
    }
  };

  const signup = async (data: SignupData): Promise<void> => {
    dispatch({ type: 'SIGNUP_START' });

    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Password strength validation
      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }

      // Check if email already exists in Supabase
      const existingUser = await supabaseService.getUserByEmail(data.email.toLowerCase().trim());
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Generate a proper UUID for the new user
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      // Create new user for Supabase
      const newSupabaseUser: User = {
        id: generateUUID(),
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        role: 'agent',
        department: data.department ? departments.find(d => d.id === data.department) || departments[0] : departments[0],
        isBlocked: false
      };

      // Save user to Supabase
      await supabaseService.createUser(newSupabaseUser);

      // Store password in localStorage for demo (in production, this would be handled by proper auth service)
      localStorage.setItem(`fleek_user_password_${newSupabaseUser.id}`, data.password);

      // Convert to AuthUser format
      const authUser: AuthUser = {
        id: newSupabaseUser.id,
        username: newSupabaseUser.name.toLowerCase().replace(/\s+/g, ''),
        email: newSupabaseUser.email,
        name: newSupabaseUser.name,
        role: newSupabaseUser.role as any,
        department: newSupabaseUser.department,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
        isBlocked: false,
      };

      // Auto-login after signup
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(authUser));
      dispatch({ type: 'SIGNUP_SUCCESS', payload: authUser });
      
      console.log('✅ User created in Supabase and logged in:', authUser.email);
    } catch (error) {
      dispatch({ 
        type: 'SIGNUP_FAILURE', 
        payload: error instanceof Error ? error.message : 'Signup failed' 
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    dispatch({ type: 'LOGOUT' });
  };

  const resetPassword = async (email: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user exists in Supabase
    const user = await supabaseService.getUserByEmail(email.toLowerCase());
    if (!user) {
      throw new Error('No account found with this email address');
    }

    // In a real app, this would send an email
    console.log(`Password reset email sent to ${email}`);
  };

  const updateProfile = async (data: Partial<AuthUser>): Promise<void> => {
    if (!authState.user) {
      throw new Error('No user logged in');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedUser = {
      ...authState.user,
      ...data,
    };

    // Update in database
    const userIndex = usersDatabase.findIndex(u => u.id === authState.user!.id);
    if (userIndex !== -1) {
      usersDatabase[userIndex] = updatedUser;
      saveUsersToStorage(usersDatabase);
    }

    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_PROFILE', payload: updatedUser });
  };

  // Admin functions (and user mentions)
  const getAllUsers = async (): Promise<AuthUser[]> => {
    console.log('🔧 getAllUsers called, current user:', authState.user?.name, 'role:', authState.user?.role);
    // Allow any authenticated user to get user list for mentions
    if (!authState.user) {
      console.error('❌ No authenticated user for getAllUsers');
      throw new Error('Authentication required');
    }
    
    try {
      console.log('🔧 Loading users from Supabase...');
      const supabaseUsers = await supabaseService.loadUsers();
      console.log('🔧 Loaded from Supabase:', supabaseUsers.length, 'users');
      
      // Convert Supabase Users to AuthUsers
      return supabaseUsers.map(user => ({
        id: user.id,
        username: user.name.toLowerCase().replace(/\s+/g, ''),
        email: user.email,
        name: user.name,
        role: user.role as any,
        department: user.department,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: !user.isBlocked,
        isBlocked: user.isBlocked,
      }));
    } catch (error) {
      console.error('Failed to load users from Supabase:', error);
      return [];
    }
  };

  const blockUser = async (userId: string, reason: string): Promise<void> => {
    if (authState.user?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update user in Supabase to set is_active = false
    await supabaseService.updateUser(userId, { isBlocked: true } as Partial<User>);
    
    console.log(`User ${userId} blocked with reason: ${reason}`);
  };

  const unblockUser = async (userId: string): Promise<void> => {
    if (authState.user?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update user in Supabase to set is_active = true
    await supabaseService.updateUser(userId, { isBlocked: false } as Partial<User>);
    
    console.log(`User ${userId} unblocked`);
  };

  const deleteUser = async (userId: string): Promise<void> => {
    if (authState.user?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Delete user from Supabase (this will deactivate them for safety)
    await supabaseService.deleteUser(userId);
    
    // Clean up user's password
    localStorage.removeItem(`fleek_user_password_${userId}`);
    
    console.log(`User ${userId} deactivated`);
  };

  const updateUserProfile = async (userId: string, data: Partial<AuthUser>): Promise<void> => {
    if (authState.user?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Convert AuthUser data to User format for Supabase
    const userUpdate: Partial<User> = {
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      isBlocked: data.isBlocked
    };

    // Update user in Supabase
    await supabaseService.updateUser(userId, userUpdate);
    
    console.log(`User ${userId} profile updated in Supabase`);
  };

  // Security questions functions
  const verifySecurityQuestions = async (email: string, answers: SecurityQuestion[]): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists in Supabase
    const user = await supabaseService.getUserByEmail(email.toLowerCase());
    
    if (!user) {
      throw new Error('User not found');
    }

    // For demo purposes, we'll use predefined correct answers
    // In a real app, these would be stored securely and hashed
    const correctAnswers: Record<string, Record<string, string>> = {
      'admin@fleek.com': {
        "What was the name of your first pet?": "fluffy",
        "What city were you born in?": "new york"
      },
      'shaharyar@fleek.com': {
        "What was the name of your first pet?": "buddy", 
        "What city were you born in?": "karachi"
      }
    };

    const userCorrectAnswers = correctAnswers[user.email.toLowerCase()];
    if (!userCorrectAnswers) {
      // For users without predefined answers, simulate failure
      return false;
    }

    // Check if all provided answers match (case-insensitive)
    for (const answer of answers) {
      const correctAnswer = userCorrectAnswers[answer.question];
      if (!correctAnswer || correctAnswer.toLowerCase() !== answer.answer.toLowerCase().trim()) {
        return false;
      }
    }

    return true;
  };

  const resetPasswordWithSecurity = async (data: {
    email: string;
    securityQuestions: SecurityQuestion[];
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Check if user exists in Supabase
    const user = await supabaseService.getUserByEmail(data.email.toLowerCase());
    
    if (!user) {
      throw new Error('User not found');
    }

    // Store new password (in production, this would be handled by proper auth service)
    localStorage.setItem(`fleek_user_password_${user.id}`, data.newPassword);
    console.log('✅ Password updated for user:', user.email);
  };

  const isAdmin = authState.user?.role === 'admin' || authState.user?.role === 'super_admin';
  
  const value: AuthContextType = {
    authState,
    login,
    signup,
    logout,
    resetPassword,
    verifySecurityQuestions,
    resetPasswordWithSecurity,
    updateProfile,
    // Available to all authenticated users (for mentions)
    getAllUsers,
    
    // Admin functions (always defined but with role check inside)
    blockUser: isAdmin ? blockUser : undefined,
    unblockUser: isAdmin ? unblockUser : undefined,
    deleteUser: isAdmin ? deleteUser : undefined,
    updateUserProfile: isAdmin ? updateUserProfile : undefined,
  };

  // Debug log to verify functions are available
  console.log('🔧 AuthContext value object:', {
    getAllUsersPresent: !!value.getAllUsers,
    userRole: authState.user?.role,
    isAdmin,
    blockUserPresent: !!value.blockUser,
    updateUserProfilePresent: !!value.updateUserProfile,
    authStatePresent: !!authState.user
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};