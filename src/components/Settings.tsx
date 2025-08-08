import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Clock, 
  Users, 
  Building, 
  Zap,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit3,
  X,
  Check,
  AlertTriangle,
  Globe,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  CheckCircle2,
  Loader2,
  Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { departments, users } from '../data/mockData';

interface SettingsProps {}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: { name: string };
  isBlocked?: boolean;
  blockedReason?: string;
}

export const Settings: React.FC<SettingsProps> = () => {
  const { authState, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    slack: false,
    sms: false,
    desktop: true,
    sound: true
  });
  const [workingHours, setWorkingHours] = useState({
    start: '09:00',
    end: '17:00',
    timezone: 'UTC',
    workingDays: [1, 2, 3, 4, 5]
  });
  const [autoAssignment, setAutoAssignment] = useState({
    enabled: true,
    maxTickets: 10,
    skillBased: true,
    roundRobin: false
  });
  const [slaSettings, setSlaSettings] = useState({
    defaultSla: 24,
    escalationEnabled: true,
    escalationHours: 48,
    weekendSla: false
  });
  const [customFields, setCustomFields] = useState([
    { id: '1', name: 'Customer Tier', type: 'select', options: ['Free', 'Pro', 'Enterprise'], required: false },
    { id: '2', name: 'Urgency Level', type: 'number', required: true }
  ]);
  const [newField, setNewField] = useState({ name: '', type: 'text', required: false });
  const [showAddField, setShowAddField] = useState(false);
  
  // User management state (moved from renderUserManagement to fix hooks order)
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'workflow', label: 'Workflow', icon: Zap },
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'data', label: 'Data & Export', icon: Download },
    { id: 'users', label: 'User Management', icon: Users },
  ];

  const handleSaveProfile = async () => {
    try {
      // Implementation would save profile changes
      console.log('Profile saved');
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleExportData = (format: 'csv' | 'json' | 'pdf') => {
    console.log(`Exporting data as ${format}`);
    // Implementation would trigger data export
  };

  const handleAddCustomField = () => {
    if (newField.name.trim()) {
      const field = {
        id: Date.now().toString(),
        ...newField,
        options: newField.type === 'select' ? [] : undefined
      };
      setCustomFields([...customFields, field]);
      setNewField({ name: '', type: 'text', required: false });
      setShowAddField(false);
    }
  };

  const handleDeleteCustomField = (fieldId: string) => {
    setCustomFields(customFields.filter(f => f.id !== fieldId));
  };

  const renderProfileSettings = () => (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
          <User className="w-5 h-5 mr-3" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue={authState.user?.name}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue={authState.user?.email}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
            <select className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200">
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
            <select className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200">
              <option value="agent">Agent</option>
              <option value="senior_agent">Senior Agent</option>
              <option value="team_lead">Team Lead</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Working Hours</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Start Time</label>
              <input
                type="time"
                value={workingHours.start}
                onChange={(e) => setWorkingHours({...workingHours, start: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">End Time</label>
              <input
                type="time"
                value={workingHours.end}
                onChange={(e) => setWorkingHours({...workingHours, end: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={handleSaveProfile}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
          <Bell className="w-5 h-5 mr-3" />
          Notification Preferences
        </h3>
        
        <div className="space-y-6">
          {[
            { key: 'email', label: 'Email Notifications', icon: Mail, description: 'Receive notifications via email' },
            { key: 'push', label: 'Push Notifications', icon: Smartphone, description: 'Browser push notifications' },
            { key: 'desktop', label: 'Desktop Notifications', icon: Monitor, description: 'System desktop notifications' },
            { key: 'sound', label: 'Sound Alerts', icon: Volume2, description: 'Audio notifications for urgent tickets' }
          ].map(({ key, label, icon: Icon, description }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">{label}</div>
                  <div className="text-sm text-slate-500">{description}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[key as keyof typeof notifications]}
                  onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
          <Palette className="w-5 h-5 mr-3" />
          Appearance & Theme
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                {isDarkMode ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-slate-600" />}
              </div>
              <div>
                <div className="font-medium text-slate-900">Dark Mode</div>
                <div className="text-sm text-slate-500">Switch between light and dark themes</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={(e) => setIsDarkMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Density</label>
            <div className="grid grid-cols-3 gap-3">
              {['Compact', 'Comfortable', 'Spacious'].map((density) => (
                <button
                  key={density}
                  className="p-3 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors duration-200"
                >
                  {density}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWorkflowSettings = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
          <Zap className="w-5 h-5 mr-3" />
          Workflow & Automation
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-4">Auto-Assignment Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-medium text-slate-900">Enable Auto-Assignment</div>
                  <div className="text-sm text-slate-500">Automatically assign tickets based on rules</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAssignment.enabled}
                    onChange={(e) => setAutoAssignment({...autoAssignment, enabled: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Concurrent Tickets</label>
                  <input
                    type="number"
                    value={autoAssignment.maxTickets}
                    onChange={(e) => setAutoAssignment({...autoAssignment, maxTickets: parseInt(e.target.value)})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Assignment Method</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200">
                    <option value="skill">Skill-based</option>
                    <option value="round_robin">Round Robin</option>
                    <option value="workload">Workload-based</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-4">SLA Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Default SLA (hours)</label>
                <input
                  type="number"
                  value={slaSettings.defaultSla}
                  onChange={(e) => setSlaSettings({...slaSettings, defaultSla: parseInt(e.target.value)})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Escalation After (hours)</label>
                <input
                  type="number"
                  value={slaSettings.escalationHours}
                  onChange={(e) => setSlaSettings({...slaSettings, escalationHours: parseInt(e.target.value)})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomFields = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900 flex items-center">
            <Edit3 className="w-5 h-5 mr-3" />
            Custom Fields
          </h3>
          <button
            onClick={() => setShowAddField(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Field</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {customFields.map((field) => (
            <div key={field.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="font-medium text-slate-900">{field.name}</div>
                <div className="text-sm text-slate-500 capitalize">{field.type} field {field.required && '(Required)'}</div>
              </div>
              <button
                onClick={() => handleDeleteCustomField(field.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {showAddField && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-medium text-slate-900 mb-4">Add Custom Field</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Field Name</label>
                <input
                  type="text"
                  value={newField.name}
                  onChange={(e) => setNewField({...newField, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                  placeholder="Enter field name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Field Type</label>
                <select
                  value={newField.type}
                  onChange={(e) => setNewField({...newField, type: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="select">Select</option>
                  <option value="date">Date</option>
                  <option value="boolean">Yes/No</option>
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newField.required}
                    onChange={(e) => setNewField({...newField, required: e.target.checked})}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Required</span>
                </label>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4">
              <button
                onClick={handleAddCustomField}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Add Field</span>
              </button>
              <button
                onClick={() => setShowAddField(false)}
                className="text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDataExport = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
          <Download className="w-5 h-5 mr-3" />
          Data Export & Backup
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-4">Export Options</h4>
            <div className="grid grid-cols-3 gap-4">
              {[
                { format: 'csv', label: 'CSV Export', description: 'Spreadsheet compatible format' },
                { format: 'json', label: 'JSON Export', description: 'Raw data format' },
                { format: 'pdf', label: 'PDF Report', description: 'Formatted report' }
              ].map(({ format, label, description }) => (
                <button
                  key={format}
                  onClick={() => handleExportData(format as 'csv' | 'json' | 'pdf')}
                  className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200 text-left"
                >
                  <div className="font-medium text-slate-900">{label}</div>
                  <div className="text-sm text-slate-500 mt-1">{description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-4">Automated Reports</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-medium text-slate-900">Daily Summary</div>
                  <div className="text-sm text-slate-500">Email daily ticket summary at 6 PM</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-medium text-slate-900">Weekly Report</div>
                  <div className="text-sm text-slate-500">Comprehensive weekly performance report</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => {
    console.log('Current user:', authState.user);
    console.log('User role:', authState.user?.role);
    console.log('Is admin?', authState.user?.role === 'admin');
    
    if (authState.user?.role !== 'admin') {
      return (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Access Restricted</h3>
              <p className="text-slate-500">
                Only administrators can manage user accounts.
              </p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Debug Info:</strong><br/>
                  Name: {authState.user?.name}<br/>
                  Role: {authState.user?.role}<br/>
                  ID: {authState.user?.id}
                </p>
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  <strong>Super Admin Login:</strong> Username: <code className="bg-amber-100 px-1 rounded">admin</code> • 
                  Password: <code className="bg-amber-100 px-1 rounded">admin123</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const handleBlockUser = async (user: AuthUser) => {
      if (!blockReason.trim()) return;
      
      setIsLoading(true);
      try {
        // Implementation would block user
        console.log('Blocking user:', user.id, blockReason);
        setShowBlockModal(false);
        setBlockReason('');
        setSelectedUser(null);
      } catch (error) {
        console.error('Failed to block user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleUnblockUser = async (user: AuthUser) => {
      setIsLoading(true);
      try {
        // Implementation would unblock user
        console.log('Unblocking user:', user.id);
      } catch (error) {
        console.error('Failed to unblock user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleDeleteUser = async (user: AuthUser) => {
      if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) return;
      
      setIsLoading(true);
      try {
        // Implementation would delete user
        console.log('Deleting user:', user.id);
      } catch (error) {
        console.error('Failed to delete user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleEditUser = (user: AuthUser) => {
      setSelectedUser(user);
      setEditUserData({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department?.id || ''
      });
      setShowEditModal(true);
    };

    const handleSaveUserEdit = async () => {
      if (!selectedUser) return;
      
      setIsLoading(true);
      try {
        // Implementation would save user changes
        console.log('Saving user changes:', selectedUser.id, editUserData);
        setShowEditModal(false);
        setSelectedUser(null);
      } catch (error) {
        console.error('Failed to save user changes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    return (
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-3" />
            User Management
          </h3>
          
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-slate-900">{user.name}</span>
                      {user.role === 'super_admin' && (
                        <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 text-xs rounded-full font-medium">
                          Super Admin
                        </span>
                      )}
                      {user.isBlocked && (
                        <span className="px-2 py-1 bg-gradient-to-r from-red-100 to-red-200 text-red-800 text-xs rounded-full font-medium">
                          Blocked
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      {user.email} • {user.role} • {user.department?.name || 'No Department'}
                    </div>
                    {user.isBlocked && user.blockedReason && (
                      <div className="text-xs text-red-600 mt-1">
                        Blocked: {user.blockedReason}
                      </div>
                    )}
                  </div>
                </div>
                
                {user.role !== 'super_admin' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        handleEditUser(user);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      disabled={isLoading}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    {user.isBlocked ? (
                      <button
                        onClick={() => handleUnblockUser(user)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        disabled={isLoading}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowBlockModal(true);
                        }}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                        disabled={isLoading}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Edit User: {selectedUser.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editUserData.name}
                    onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={editUserData.role}
                    onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                  >
                    <option value="agent">Agent</option>
                    <option value="senior_agent">Senior Agent</option>
                    <option value="team_lead">Team Lead</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department
                  </label>
                  <select
                    value={editUserData.department}
                    onChange={(e) => setEditUserData({...editUserData, department: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                  >
                    <option value="">No Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUserEdit}
                  disabled={!editUserData.name.trim() || !editUserData.email.trim() || isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Block User Modal */}
        {showBlockModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Block User: {selectedUser.name}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for blocking *
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 transition-all duration-200"
                  placeholder="Enter reason for blocking this user..."
                />
              </div>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setBlockReason('');
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBlockUser(selectedUser)}
                  disabled={!blockReason.trim() || isLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Blocking...</span>
                    </>
                  ) : (
                    <span>Block User</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'workflow':
        return renderWorkflowSettings();
      case 'departments':
        return renderCustomFields();
      case 'data':
        return renderDataExport();
      case 'users':
        return renderUserManagement();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-tight mb-2">
          Settings
        </h1>
        <p className="text-slate-600">Manage your account, preferences, and system configuration</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-2">
            <nav className="space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                    activeTab === id
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};