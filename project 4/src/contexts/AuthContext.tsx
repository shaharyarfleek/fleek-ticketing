import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, AuthUser, LoginCredentials, SignupData, AuthContextType } from '../types/auth';
import { departments } from '../data/mockData';
import { supabaseService } from '../services/supabaseService';
import { User } from '../types';

// Only admin user - will be created if doesn't exist
const createAdminUser = (): AuthUser => ({
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // UUID matching Supabase user
  username: 'admin',
  email: 'admin@fleek.com',
  name: 'System Administrator',
  role: 'admin',
  department: departments[0],
  createdAt: new Date('2024-01-01'),
  lastLogin: new Date(),
  isActive: true,
  isBlocked: false,
});

// Storage keys
const STORAGE_KEYS = {
  USERS: 'fleek_users_database',
  AUTH_USER: 'fleek_auth_user'
};

// Get users from localStorage or return initial users
const getUsersFromStorage = (): AuthUser[] => {
  try {
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (storedUsers) {
      const parsed = JSON.parse(storedUsers);
      // Check if admin exists, if not add it
      const hasAdmin = parsed.some((u: AuthUser) => u.username.toLowerCase() === 'admin');
      if (!hasAdmin) {
        return [...parsed, createAdminUser()];
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading users from storage:', error);
  }
  // If no users exist, create admin user
  return [createAdminUser()];
};

// Save users to localStorage
const saveUsersToStorage = (users: AuthUser[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to storage:', error);
  }
};

// Initialize users database
let usersDatabase = getUsersFromStorage();

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

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Verify user still exists in database
        const userExists = usersDatabase.find(u => u.id === user.id);
        if (userExists) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
        }
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
    }
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

      // Store in localStorage if remember me is checked
      if (credentials.rememberMe) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(authUser));
      }

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Reload users from storage to get latest data
      usersDatabase = getUsersFromStorage();

      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Check if username already exists (case-insensitive)
      if (usersDatabase.some(u => u.username.toLowerCase() === data.username.toLowerCase())) {
        throw new Error('Username already exists');
      }

      // Check if email already exists (case-insensitive)
      if (usersDatabase.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error('Email already exists');
      }

      // Password strength validation
      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }

      // Generate a proper UUID for the new user
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      // Create new user
      const newUser: AuthUser = {
        id: generateUUID(), // Use proper UUID format
        username: data.username.toLowerCase().trim(),
        email: data.email.toLowerCase().trim(),
        name: data.name.trim(),
        role: 'agent',
        department: data.department ? departments.find(d => d.id === data.department) : undefined,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
        isBlocked: false,
      };

      // Add to database and save
      usersDatabase.push(newUser);
      saveUsersToStorage(usersDatabase);

      // Store password separately (in real app, this would be properly hashed)
      localStorage.setItem(`fleek_user_password_${newUser.id}`, data.password);

      // Auto-login after signup
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(newUser));
      dispatch({ type: 'SIGNUP_SUCCESS', payload: newUser });
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

    // Reload users from storage
    usersDatabase = getUsersFromStorage();

    const user = usersDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());
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

  // Admin functions
  const getAllUsers = async (): Promise<AuthUser[]> => {
    if (authState.user?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    
    try {
      const supabaseUsers = await supabaseService.loadUsers();
      
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
    
    usersDatabase = getUsersFromStorage();
    const userIndex = usersDatabase.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    if (usersDatabase[userIndex].role === 'super_admin') {
      throw new Error('Cannot block super admin');
    }

    usersDatabase[userIndex] = {
      ...usersDatabase[userIndex],
      isBlocked: true,
      blockedAt: new Date(),
      blockedBy: authState.user.id,
      blockedReason: reason
    };

    saveUsersToStorage(usersDatabase);
  };

  const unblockUser = async (userId: string): Promise<void> => {
    if (authState.user?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    
    usersDatabase = getUsersFromStorage();
    const userIndex = usersDatabase.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    usersDatabase[userIndex] = {
      ...usersDatabase[userIndex],
      isBlocked: false,
      blockedAt: undefined,
      blockedBy: undefined,
      blockedReason: undefined
    };

    saveUsersToStorage(usersDatabase);
  };

  const deleteUser = async (userId: string): Promise<void> => {
    if (authState.user?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    
    usersDatabase = getUsersFromStorage();
    const userIndex = usersDatabase.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    if (usersDatabase[userIndex].role === 'super_admin') {
      throw new Error('Cannot delete super admin');
    }

    // Remove user from database
    usersDatabase.splice(userIndex, 1);
    saveUsersToStorage(usersDatabase);

    // Clean up user's password
    localStorage.removeItem(`fleek_user_password_${userId}`);
  };

  const updateUserProfile = async (userId: string, data: Partial<AuthUser>): Promise<void> => {
    if (authState.user?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    
    usersDatabase = getUsersFromStorage();
    const userIndex = usersDatabase.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Prevent changing super admin role
    if (usersDatabase[userIndex].role === 'super_admin' && data.role !== 'super_admin') {
      throw new Error('Cannot change super admin role');
    }

    usersDatabase[userIndex] = {
      ...usersDatabase[userIndex],
      ...data,
      id: usersDatabase[userIndex].id, // Prevent ID changes
    };

    saveUsersToStorage(usersDatabase);
  };

  // Security questions functions
  const verifySecurityQuestions = async (email: string, answers: SecurityQuestion[]): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    usersDatabase = getUsersFromStorage();
    const user = usersDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());
    
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
      'sarah@fleek.com': {
        "What was the name of your first pet?": "buddy",
        "What city were you born in?": "chicago"
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

    usersDatabase = getUsersFromStorage();
    const userIndex = usersDatabase.findIndex(u => u.email.toLowerCase() === data.email.toLowerCase());
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Store new password
    localStorage.setItem(`fleek_user_password_${usersDatabase[userIndex].id}`, data.newPassword);
  };

  const value: AuthContextType = {
    authState,
    login,
    signup,
    logout,
    resetPassword,
    verifySecurityQuestions,
    resetPasswordWithSecurity,
    updateProfile,
    // Admin functions (only available to admin)
    ...(authState.user?.role === 'admin' && {
      getAllUsers,
      blockUser,
      unblockUser,
      deleteUser,
      updateUserProfile,
    }),
    // Admin functions (only available to super_admin)
    ...(authState.user?.role === 'super_admin' && {
      getAllUsers,
      blockUser,
      unblockUser,
      deleteUser,
      updateUserProfile,
    }),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};