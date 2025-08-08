import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, User, AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/auth';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSwitchToSignup, 
  onSwitchToForgotPassword 
}) => {
  const { authState, login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Clear errors when user starts typing
  useEffect(() => {
    if (authState.error) {
      const timer = setTimeout(() => {
        setValidationErrors({});
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [credentials, authState.error]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!credentials.username.trim()) {
      errors.username = 'Username or email is required';
    }

    if (!credentials.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(credentials);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const fillDemoCredentials = () => {
    setCredentials({
      username: 'admin',
      password: 'admin123',
      rememberMe: false,
    });
  };

  // Detect if input looks like an email
  const isEmailFormat = (input: string) => {
    return input.includes('@') && input.includes('.');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Welcome back</h1>
        <p className="text-gray-600 mt-2">Sign in to F.I.T.S</p>
      </div>


      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global Error */}
        {authState.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Sign in failed</h3>
              <p className="text-sm text-red-700 mt-1">{authState.error}</p>
            </div>
          </div>
        )}

        {/* Username/Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username or Email
          </label>
          <div className="relative">
            {isEmailFormat(credentials.username) ? (
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            ) : (
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            )}
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                validationErrors.username 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Enter username or email"
              autoComplete="username"
              disabled={authState.isLoading}
            />
          </div>
          {validationErrors.username && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validationErrors.username}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            💡 You can sign in with either your username or email address
          </p>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                validationErrors.password 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={authState.isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              disabled={authState.isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {validationErrors.password && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validationErrors.password}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={credentials.rememberMe}
              onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
              className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 transition-colors duration-200"
              disabled={authState.isLoading}
            />
            <span className="text-sm text-gray-700">Remember me</span>
          </label>
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            disabled={authState.isLoading}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={authState.isLoading}
          className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
        >
          {authState.isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </button>

        {/* Switch to Signup */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-gray-900 hover:text-gray-700 font-medium transition-colors duration-200"
              disabled={authState.isLoading}
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};