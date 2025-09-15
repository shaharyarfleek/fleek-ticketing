export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'agent' | 'senior_agent' | 'team_lead';
  department?: {
    id: string;
    name: string;
  };
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  isBlocked?: boolean;
  blockedAt?: Date;
  blockedBy?: string;
  blockedReason?: string;
  isBlocked?: boolean;
  blockedAt?: Date;
  blockedBy?: string;
  blockedReason?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  username: string;
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  department?: string;
  securityQuestion1?: string;
  securityAnswer1?: string;
  securityQuestion2?: string;
  securityAnswer2?: string;
}

export interface SecurityQuestion {
  question: string;
  answer: string;
}

export interface UserManagementAction {
  type: 'block' | 'unblock' | 'delete' | 'edit';
  userId: string;
  reason?: string;
  performedBy: string;
  performedAt: Date;
}

export interface SecurityQuestion {
  question: string;
  answer: string;
}

export interface UserManagementAction {
  type: 'block' | 'unblock' | 'delete' | 'edit';
  userId: string;
  reason?: string;
  performedBy: string;
  performedAt: Date;
}

export interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  verifySecurityQuestions: (email: string, answers: SecurityQuestion[]) => Promise<boolean>;
  resetPasswordWithSecurity: (data: {
    email: string;
    securityQuestions: SecurityQuestion[];
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  // User functions (available to all authenticated users)
  getAllUsers?: () => Promise<AuthUser[]>;
  // Admin functions (only available to admin users)
  blockUser?: (userId: string, reason: string) => Promise<void>;
  unblockUser?: (userId: string) => Promise<void>;
  deleteUser?: (userId: string) => Promise<void>;
  updateUserProfile?: (userId: string, data: Partial<AuthUser>) => Promise<void>;
}