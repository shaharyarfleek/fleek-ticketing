import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Lock, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SecurityQuestion } from '../../types/auth';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

type Step = 'email' | 'security' | 'password' | 'success';

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin }) => {
  const { resetPassword, verifySecurityQuestions, resetPasswordWithSecurity } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<SecurityQuestion[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // In a real app, this would fetch the user's security questions
      // For demo, we'll simulate this
      const mockQuestions: SecurityQuestion[] = [
        { question: "What was the name of your first pet?", answer: "" },
        { question: "What city were you born in?", answer: "" }
      ];
      
      setSecurityQuestions(mockQuestions);
      setUserAnswers(mockQuestions.map(q => ({ question: q.question, answer: '' })));
      setCurrentStep('security');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to retrieve security questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate answers
    const hasEmptyAnswers = userAnswers.some(answer => !answer.answer.trim());
    if (hasEmptyAnswers) {
      setError('Please answer all security questions');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isValid = await verifySecurityQuestions(email, userAnswers);
      if (isValid) {
        setCurrentStep('password');
      } else {
        setError('Security question answers are incorrect. Please try again.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to verify security questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword) {
      setError('New password is required');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPasswordWithSecurity({
        email,
        securityQuestions: userAnswers,
        newPassword,
        confirmPassword
      });
      setCurrentStep('success');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (index: number, answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = { ...newAnswers[index], answer };
    setUserAnswers(newAnswers);
  };

  const renderEmailStep = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Reset password</h1>
        <p className="text-gray-600 mt-2">Enter your email to continue</p>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 hover:border-gray-300"
              placeholder="Enter your email address"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Checking email...</span>
            </>
          ) : (
            <span>Continue</span>
          )}
        </button>

        <button
          type="button"
          onClick={onSwitchToLogin}
          className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 py-2"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to sign in</span>
        </button>
      </form>
    </div>
  );

  const renderSecurityStep = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Security Questions</h1>
        <p className="text-gray-600 mt-2">Answer your security questions to continue</p>
        
        {/* Demo Answers Helper */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">Demo Security Answers</h3>
              <p className="text-sm text-blue-700 mt-1">
                <strong>For admin@fleek.com:</strong><br/>
                • First pet: <code className="bg-blue-100 px-1 rounded">fluffy</code><br/>
                • Birth city: <code className="bg-blue-100 px-1 rounded">new york</code><br/>
                <strong>For sarah@fleek.com:</strong><br/>
                • First pet: <code className="bg-blue-100 px-1 rounded">buddy</code><br/>
                • Birth city: <code className="bg-blue-100 px-1 rounded">chicago</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSecuritySubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {securityQuestions.map((question, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.question}
            </label>
            <input
              type="text"
              value={userAnswers[index]?.answer || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 hover:border-gray-300"
              placeholder="Enter your answer"
              disabled={isLoading}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying answers...</span>
            </>
          ) : (
            <span>Verify Answers</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep('email')}
          className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 py-2"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to email</span>
        </button>
      </form>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">New Password</h1>
        <p className="text-gray-600 mt-2">Create a new secure password</p>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError('');
              }}
              className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 hover:border-gray-300"
              placeholder="Enter new password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 hover:border-gray-300 ${
                confirmPassword && newPassword === confirmPassword
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200'
              }`}
              placeholder="Confirm new password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPassword && newPassword === confirmPassword && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Passwords match
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Resetting password...</span>
            </>
          ) : (
            <span>Reset Password</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep('security')}
          className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 py-2"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to security questions</span>
        </button>
      </form>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-4">Password Reset Successful</h1>
      <p className="text-gray-600 mb-8">
        Your password has been successfully reset. You can now sign in with your new password.
      </p>
      <button
        onClick={onSwitchToLogin}
        className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 transition-colors duration-200 font-medium"
      >
        Back to Sign In
      </button>
    </div>
  );

  switch (currentStep) {
    case 'email':
      return renderEmailStep();
    case 'security':
      return renderSecurityStep();
    case 'password':
      return renderPasswordStep();
    case 'success':
      return renderSuccessStep();
    default:
      return renderEmailStep();
  }
};