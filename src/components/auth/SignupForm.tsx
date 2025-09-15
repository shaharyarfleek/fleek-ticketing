import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, User, Mail, AlertCircle, CheckCircle2, Loader2, Building, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SignupData } from '../../types/auth';
import { departments } from '../../data/mockData';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const { authState, signup } = useAuth();
  const [formData, setFormData] = useState<SignupData>({
    username: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[],
  });

  const securityQuestions = [
    "What was the name of your first pet?",
    "What city were you born in?",
    "What was your mother's maiden name?",
    "What was the name of your elementary school?",
    "What was your first car's make and model?",
    "What street did you grow up on?",
    "What was your childhood nickname?",
    "What is your favorite movie?",
    "What was the name of your first boss?",
    "What is your favorite food?"
  ];

  // Clear errors when user starts typing
  useEffect(() => {
    if (authState.error) {
      const timer = setTimeout(() => {
        setValidationErrors({});
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [formData, authState.error]);

  // Password strength checker
  useEffect(() => {
    const password = formData.password;
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) {
      score += 1;
    } else if (password.length > 0) {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else if (password.length > 0) {
      feedback.push('One lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else if (password.length > 0) {
      feedback.push('One uppercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else if (password.length > 0) {
      feedback.push('One number');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else if (password.length > 0) {
      feedback.push('One special character');
    }

    setPasswordStrength({ score, feedback });
  }, [formData.password]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, dots, hyphens, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (passwordStrength.score < 4) {
      errors.password = 'Password is too weak';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Security questions validation
    if (!formData.securityQuestion1) {
      errors.securityQuestion1 = 'Please select a security question';
    }
    if (!formData.securityAnswer1 || formData.securityAnswer1.trim().length < 2) {
      errors.securityAnswer1 = 'Answer must be at least 2 characters';
    }
    if (!formData.securityQuestion2) {
      errors.securityQuestion2 = 'Please select a security question';
    }
    if (!formData.securityAnswer2 || formData.securityAnswer2.trim().length < 2) {
      errors.securityAnswer2 = 'Answer must be at least 2 characters';
    }
    if (formData.securityQuestion1 && formData.securityQuestion2 && 
        formData.securityQuestion1 === formData.securityQuestion2) {
      errors.securityQuestion2 = 'Please select different security questions';
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
      await signup(formData);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleInputChange = (field: keyof SignupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 1) return 'bg-red-500';
    if (passwordStrength.score <= 2) return 'bg-orange-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    if (passwordStrength.score <= 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 1) return 'Very Weak';
    if (passwordStrength.score <= 2) return 'Weak';
    if (passwordStrength.score <= 3) return 'Fair';
    if (passwordStrength.score <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Create account</h1>
        <p className="text-gray-600 mt-2">Join the F.I.T.S team today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global Error */}
        {authState.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Signup failed</h3>
              <p className="text-sm text-red-700 mt-1">{authState.error}</p>
            </div>
          </div>
        )}

        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                validationErrors.name 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Enter your full name"
              autoComplete="name"
              disabled={authState.isLoading}
            />
          </div>
          {validationErrors.name && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validationErrors.name}
            </p>
          )}
        </div>

        {/* Username Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
              className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                validationErrors.username 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Choose a username"
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
            Letters, numbers, dots, hyphens, and underscores only
          </p>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                validationErrors.email 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Enter your email address"
              autoComplete="email"
              disabled={authState.isLoading}
            />
          </div>
          {validationErrors.email && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Department Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department (Optional)
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 appearance-none hover:border-gray-300"
              disabled={authState.isLoading}
            >
              <option value="">Select a department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Security Questions */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Security Questions
          </h3>
          <p className="text-sm text-gray-600">
            Please select and answer two security questions. These will be used to verify your identity if you forget your password.
          </p>
          
          {/* Security Question 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Security Question 1 *
            </label>
            <div className="relative mb-3">
              <select
                value={formData.securityQuestion1}
                onChange={(e) => handleInputChange('securityQuestion1', e.target.value)}
                className={`w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 appearance-none ${
                  validationErrors.securityQuestion1 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={authState.isLoading}
              >
                <option value="">Select a security question</option>
                {securityQuestions
                  .filter(q => q !== formData.securityQuestion2)
                  .map(question => (
                    <option key={question} value={question}>{question}</option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            <input
              type="text"
              value={formData.securityAnswer1}
              onChange={(e) => handleInputChange('securityAnswer1', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                validationErrors.securityAnswer1 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Enter your answer"
              disabled={authState.isLoading || !formData.securityQuestion1}
            />
            {validationErrors.securityQuestion1 && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {validationErrors.securityQuestion1}
              </p>
            )}
            {validationErrors.securityAnswer1 && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {validationErrors.securityAnswer1}
              </p>
            )}
          </div>

          {/* Security Question 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Security Question 2 *
            </label>
            <div className="relative mb-3">
              <select
                value={formData.securityQuestion2}
                onChange={(e) => handleInputChange('securityQuestion2', e.target.value)}
                className={`w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 appearance-none ${
                  validationErrors.securityQuestion2 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={authState.isLoading}
              >
                <option value="">Select a security question</option>
                {securityQuestions
                  .filter(q => q !== formData.securityQuestion1)
                  .map(question => (
                    <option key={question} value={question}>{question}</option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            <input
              type="text"
              value={formData.securityAnswer2}
              onChange={(e) => handleInputChange('securityAnswer2', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                validationErrors.securityAnswer2 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Enter your answer"
              disabled={authState.isLoading || !formData.securityQuestion2}
            />
            {validationErrors.securityQuestion2 && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {validationErrors.securityQuestion2}
              </p>
            )}
            {validationErrors.securityAnswer2 && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {validationErrors.securityAnswer2}
              </p>
            )}
          </div>
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
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                validationErrors.password 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Create a strong password"
              autoComplete="new-password"
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
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Password strength</span>
                <span className={`text-xs font-medium ${
                  passwordStrength.score <= 2 ? 'text-red-600' : 
                  passwordStrength.score <= 3 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {getPasswordStrengthText()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              {passwordStrength.feedback.length > 0 && (
                <div className="mt-1">
                  <p className="text-xs text-gray-600">Missing:</p>
                  <ul className="text-xs text-gray-500 list-disc list-inside">
                    {passwordStrength.feedback.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {validationErrors.password && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validationErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 ${
                validationErrors.confirmPassword 
                  ? 'border-red-300 bg-red-50' 
                  : formData.confirmPassword && formData.password === formData.confirmPassword
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={authState.isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              disabled={authState.isLoading}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {formData.confirmPassword && formData.password === formData.confirmPassword && !validationErrors.confirmPassword && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Passwords match
            </p>
          )}
          {validationErrors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validationErrors.confirmPassword}
            </p>
          )}
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
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </button>

        {/* Switch to Login */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-gray-900 hover:text-gray-700 font-medium transition-colors duration-200"
              disabled={authState.isLoading}
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};