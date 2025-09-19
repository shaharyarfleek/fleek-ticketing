import React, { useState, useEffect } from 'react';
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
import { useData } from '../contexts/DataContext';
import { departments } from '../data/mockData';

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
  const authContext = useAuth();
  const { authState, updateProfile, updateUserProfile } = authContext;
  const { users: dataContextUsers } = useData();
  
  // Early return if authState is not ready
  if (!authState) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Settings...</h2>
          <p className="text-slate-600">Please wait while we load your settings</p>
        </div>
      </div>
    );
  }
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
  
  // User management state
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  });

  // Load users when component mounts or when activeTab changes to 'users'
  useEffect(() => {
    console.log('🔧 Settings v2.0: loadUsers effect triggered', {
      userRole: authState.user?.role,
      activeTab,
      isAdmin: authState.user?.role === 'admin',
      dataContextUsersCount: dataContextUsers.length,
      dataContextUsersPreview: dataContextUsers.slice(0, 2).map(u => ({ id: u.id, name: u.name, role: u.role }))
    });
    
    if (authState.user?.role === 'admin' && activeTab === 'users') {
      console.log('🔄 Settings: Loading users from DataContext...');
      setUsersLoading(true);
      
      // Convert DataContext users to AuthUser format
      const convertedUsers: AuthUser[] = dataContextUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as any, // Cast to handle role type mismatch
        department: user.department,
        isBlocked: user.isBlocked,
        blockedReason: undefined // User interface doesn't have this field
      }));
      
      setAllUsers(convertedUsers);
      setUsersLoading(false);
      console.log('✅ Settings: Users loaded from DataContext:', convertedUsers.length, convertedUsers);
    } else if (activeTab !== 'users') {
      setUsersLoading(false);
    } else {
      console.log('⚠️ Settings: Not loading users because conditions not met - UserRole:', authState.user?.role, 'ActiveTab:', activeTab);
      setUsersLoading(false);
    }
  }, [authState.user?.role, activeTab, dataContextUsers]);

  // Only show User Management tab for admin users
  const baseTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'workflow', label: 'Workflow', icon: Zap },
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'data', label: 'Data & Export', icon: Download },
  ];

  // Add User Management tab only for admin users
  const tabs = authState.user?.role === 'admin' 
    ? [...baseTabs, { id: 'users', label: 'User Management', icon: Users }]
    : baseTabs;

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

  // User management functions at component level
  const refreshUsers = () => {
    // Trigger a re-render by changing activeTab
    setActiveTab('profile');
    setTimeout(() => setActiveTab('users'), 100);
  };

  const handleBlockUser = async (user: AuthUser) => {
    if (!blockReason.trim()) return;
    
    setIsLoading(true);
    try {
      if (authContext.blockUser) {
        await authContext.blockUser(user.id, blockReason);
        // Refresh users list after blocking
        refreshUsers();
      }
      setShowBlockModal(false);
      setBlockReason('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to block user:', error);
      alert(`Failed to block user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblockUser = async (user: AuthUser) => {
    setIsLoading(true);
    try {
      if (authContext.unblockUser) {
        await authContext.unblockUser(user.id);
        // Refresh users list after unblocking
        refreshUsers();
      }
    } catch (error) {
      console.error('Failed to unblock user:', error);
      alert(`Failed to unblock user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (user: AuthUser) => {
    if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) return;
    
    setIsLoading(true);
    try {
      if (authContext.deleteUser) {
        await authContext.deleteUser(user.id);
        // Refresh users list after deletion
        refreshUsers();
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      department: user.department?.name || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEditUser = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const selectedDepartment = departments.find(d => d.name === editUserData.department);
      const updateData = {
        name: editUserData.name,
        email: editUserData.email,
        role: editUserData.role,
        department: selectedDepartment || null
      };
      
      if (updateUserProfile) {
        await updateUserProfile(selectedUser.id, updateData as Partial<AuthUser>);
        setShowEditModal(false);
        setSelectedUser(null);
        // Refresh users list after update
        refreshUsers();
      } else {
        throw new Error('Update function not available. Please ensure you are logged in as an admin.');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserManagement = () => {
    // User management debug info
    console.log('🔧 User Management Debug:', {
      userRole: authState.user?.role,
      usersCount: allUsers.length,
      dataContextUsersCount: dataContextUsers.length,
      updateUserProfileAvailable: !!updateUserProfile
    });

    // Check if current user is admin (allow access for debugging)
    const isAdmin = authState.user?.role === 'admin' || authState.user?.role === 'super_admin';

    if (!isAdmin) {
      return (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Access Restricted</h3>
              <p className="text-slate-500 mb-4">
                Only administrators can manage user accounts.
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
                  <p className="text-sm text-blue-700">
                    <strong>Current User:</strong><br/>
                    Name: {authState.user?.name || 'Unknown'}<br/>
                    Role: {authState.user?.role || 'Unknown'}<br/>
                    Email: {authState.user?.email || 'Unknown'}
                  </p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-left">
                  <p className="text-sm text-amber-700">
                    <strong>Admin Login:</strong><br/>
                    Username: <code className="bg-amber-100 px-1 rounded">admin</code><br/>
                    Password: <code className="bg-amber-100 px-1 rounded">admin123</code>
                  </p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-left">
                  <p className="text-sm text-green-700">
                    <strong>Users in system:</strong> {dataContextUsers.length} users found
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 flex items-center">
              <Users className="w-5 h-5 mr-3" />
              User Management
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-500">
                {allUsers.length} users found
              </span>
              <button
                onClick={refreshUsers}
                disabled={usersLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                <span>{usersLoading ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {usersLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Users...</h3>
                <p className="text-slate-500">Fetching user data from the database</p>
              </div>
            ) : allUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Users Found</h3>
                <p className="text-slate-500 mb-4">No users found in the system database.</p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Troubleshooting:</strong><br/>
                    1. Make sure users are registered in the Supabase database<br/>
                    2. Check browser console for any errors<br/>
                    3. Try refreshing the page<br/>
                    4. Verify Supabase connection is working<br/>
                    5. Check that you're logged in as an admin user
                  </p>
                </div>
              </div>
            ) : (
              allUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-slate-900">{user.name || 'Unknown Name'}</span>
                      {user.role === 'super_admin' && (
                        <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 text-xs rounded-full font-medium">
                          Super Admin
                        </span>
                      )}
                      {user.role === 'admin' && (
                        <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs rounded-full font-medium">
                          Admin
                        </span>
                      )}
                      {user.isBlocked && (
                        <span className="px-2 py-1 bg-gradient-to-r from-red-100 to-red-200 text-red-800 text-xs rounded-full font-medium">
                          Blocked
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      {user.email || 'No Email'} • {user.role || 'No Role'} • {user.department?.name || 'No Department'}
                    </div>
                    {user.isBlocked && user.blockedReason && (
                      <div className="text-xs text-red-600 mt-1">
                        Blocked: {user.blockedReason}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Edit button for all users except current user */}
                    {user.id !== authState.user?.id && (
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        disabled={isLoading}
                        title="Edit user"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Block/Unblock buttons for non-admin users */}
                    {user.role !== 'super_admin' && user.role !== 'admin' && (
                      <>
                        {user.isBlocked ? (
                          <button
                            onClick={() => handleUnblockUser(user)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            disabled={isLoading}
                            title="Unblock user"
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
                            title="Block user"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                    
                    {/* Delete button for all users except current user */}
                    {user.id !== authState.user?.id && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        disabled={isLoading}
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
        // Double-check admin access before rendering user management
        return authState.user?.role === 'admin' ? renderUserManagement() : null;
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
        <p className="text-slate-600">Manage your account, preferences, and system configuration (v2.1 - DataContext)</p>
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
      
      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-500 bg-opacity-75" onClick={() => setShowEditModal(false)} />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Edit3 className="w-5 h-5 mr-2" />
                  Edit User
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editUserData.name}
                    onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <select
                    value={editUserData.role}
                    onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                  >
                    <option value="agent">Agent</option>
                    <option value="senior_agent">Senior Agent</option>
                    <option value="team_lead">Team Lead</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <select
                    value={editUserData.department}
                    onChange={(e) => setEditUserData({...editUserData, department: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                {selectedUser.isBlocked && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-700">
                      <strong>User Status:</strong> This user is currently blocked.
                      {selectedUser.blockedReason && (
                        <><br /><strong>Reason:</strong> {selectedUser.blockedReason}</>
                      )}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditUser}
                  disabled={isLoading || !editUserData.name.trim() || !editUserData.email.trim()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      )}
      
      {/* Block User Modal */}
      {showBlockModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-500 bg-opacity-75" onClick={() => setShowBlockModal(false)} />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-orange-600" />
                  Block User
                </h3>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-4">
                  You are about to block <strong>{selectedUser.name}</strong>. Please provide a reason:
                </p>
                
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Enter reason for blocking this user..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-200 h-24 resize-none"
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBlockUser(selectedUser)}
                  disabled={isLoading || !blockReason.trim()}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-2 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Blocking...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Block User</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};