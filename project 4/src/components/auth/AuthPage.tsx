import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { TicketIcon, Sparkles, Shield, Zap, Users, BarChart3, Clock } from 'lucide-react';
import { Logo, LogoText } from '../../config/logo';

type AuthView = 'login' | 'signup' | 'forgot-password';

export const AuthPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const renderForm = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm
            onSwitchToSignup={() => setCurrentView('signup')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
          />
        );
      case 'signup':
        return (
          <SignupForm
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Premium Branding */}
          <div className="hidden lg:block">
            <div className="max-w-lg">
              {/* Premium Logo */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden">
                    <Logo className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-tight">
                    {LogoText.full}
                  </h1>
                  <p className="text-slate-500 font-medium">Internal Ticketing System</p>
                </div>
              </div>
              
              <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-6">
                Streamline your internal operations
              </h2>
              
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Manage tickets, track performance, and streamline internal workflows 
                with our comprehensive internal ticketing system.
              </p>
              
              {/* Premium Features */}
              <div className="space-y-4">
                {[
                  { icon: <Zap className="w-5 h-5" />, text: 'Real-time collaboration and mentions', color: 'text-blue-600' },
                  { icon: <BarChart3 className="w-5 h-5" />, text: 'Advanced analytics and reporting', color: 'text-emerald-600' },
                  { icon: <Users className="w-5 h-5" />, text: 'Multi-department workflow management', color: 'text-purple-600' },
                  { icon: <Shield className="w-5 h-5" />, text: 'Auto-assignment and SLA tracking', color: 'text-orange-600' },
                  { icon: <Clock className="w-5 h-5" />, text: 'File attachments and order tracking', color: 'text-red-600' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4 group">
                    <div className={`p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl group-hover:scale-110 transition-transform duration-300 ${feature.color}`}>
                      {feature.icon}
                    </div>
                    <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors duration-200">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Decorative Elements */}
              <div className="mt-12 relative">
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>

          {/* Right Side - Premium Auth Form */}
          <div className="w-full">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 p-8 lg:p-12 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50 rounded-3xl"></div>
              
              {/* Mobile Branding */}
              <div className="lg:hidden text-center mb-8 relative z-10">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                      <TicketIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent tracking-tight">
                      F.I.T.S
                    </h1>
                    <p className="text-slate-500 text-sm">Internal System</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                {renderForm()}
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 opacity-20">
                <Sparkles className="w-6 h-6 text-slate-400" />
              </div>
              <div className="absolute bottom-4 left-4 opacity-20">
                <Shield className="w-6 h-6 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};