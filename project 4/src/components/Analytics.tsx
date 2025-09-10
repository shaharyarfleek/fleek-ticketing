import React from 'react';
import { departments } from '../data/mockData';
import { AnalyticsData, TicketStatus, Priority } from '../types';
import { BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle2, Users, Zap, Target, Award, Activity, Timer } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export const Analytics: React.FC = () => {
  const { tickets } = useData();
  const analyticsData: AnalyticsData = React.useMemo(() => {
    const mockTickets = tickets || [];
    const totalTickets = mockTickets.length;
    const openTickets = mockTickets.filter(t => ['new', 'assigned', 'in_progress', 'awaiting_response'].includes(t.status)).length;
    const resolvedTickets = mockTickets.filter(t => t.status === 'resolved').length;
    
    const resolvedTicketsWithTimes = mockTickets.filter(t => t.status === 'resolved');
    const avgResolutionTime = resolvedTicketsWithTimes.length > 0 
      ? resolvedTicketsWithTimes.reduce((acc, ticket) => {
          const resolutionTime = new Date(ticket.updatedAt).getTime() - new Date(ticket.createdAt).getTime();
          return acc + resolutionTime;
        }, 0) / resolvedTicketsWithTimes.length / (1000 * 60 * 60) // in hours
      : 0;

    const slaBreaches = mockTickets.filter(t => 
      t.dueDate && new Date() > t.dueDate && !['resolved', 'closed'].includes(t.status)
    ).length;
    
    const avgSlaHours = mockTickets.reduce((acc, ticket) => {
      return acc + (ticket.slaHours || ticket.department.slaHours);
    }, 0) / mockTickets.length;

    const ticketsByStatus = mockTickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<TicketStatus, number>);

    const ticketsByDepartment = mockTickets.reduce((acc, ticket) => {
      acc[ticket.department.name] = (acc[ticket.department.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ticketsByPriority = mockTickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);

    // Department resolution time analysis
    const departmentResolutionTimes = departments.reduce((acc, dept) => {
      const deptTickets = mockTickets.filter(t => 
        t.department.id === dept.id && 
        t.status === 'resolved' && 
        t.resolutionTime
      );
      
      if (deptTickets.length > 0) {
        const times = deptTickets.map(t => t.resolutionTime!).sort((a, b) => a - b);
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const p90Index = Math.floor(times.length * 0.9);
        const p90Time = times[p90Index] || times[times.length - 1];
        
        acc[dept.name] = {
          avgResolutionTime: avgTime / 60, // Convert to hours
          p90ResolutionTime: p90Time / 60, // Convert to hours
          ticketCount: deptTickets.length,
          color: dept.color
        };
      }
      
      return acc;
    }, {} as Record<string, {
      avgResolutionTime: number;
      p90ResolutionTime: number;
      ticketCount: number;
      color: string;
    }>);

    // Overall P90 resolution time
    const allResolutionTimes = mockTickets
      .filter(t => t.status === 'resolved' && t.resolutionTime)
      .map(t => t.resolutionTime!)
      .sort((a, b) => a - b);
    const overallP90 = allResolutionTimes.length > 0 
      ? allResolutionTimes[Math.floor(allResolutionTimes.length * 0.9)] / 60 
      : 0;

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      avgResolutionTime,
      slaBreaches,
      avgSlaHours,
      ticketsByStatus,
      ticketsByDepartment,
      ticketsByPriority,
      departmentResolutionTimes,
      overallP90ResolutionTime: overallP90,
    };
  }, []);

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    trend?: string;
    color?: string;
    description?: string;
  }> = ({ title, value, icon, trend, color = 'slate', description }) => (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:border-slate-300/60">
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-gradient-to-br from-${color}-100 to-${color}-200 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
            <div className={`text-${color}-600`}>
              {icon}
            </div>
          </div>
          {trend && (
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-600 font-semibold">{trend}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900 mb-1 group-hover:text-slate-800 transition-colors duration-200">
            {value}
          </p>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  const ChartCard: React.FC<{
    title: string;
    data: Record<string, number>;
    total: number;
    icon: React.ReactNode;
    colorMap?: Record<string, string>;
  }> = ({ title, data, total, icon, colorMap }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl">
          <div className="text-slate-600">
            {icon}
          </div>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      
      <div className="space-y-4">
        {Object.entries(data).map(([key, count]) => {
          const percentage = (count / total) * 100;
          const color = colorMap?.[key] || 'slate';
          
          return (
            <div key={key} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-slate-700 capitalize">
                    {key.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600 font-semibold">{count}</span>
                  <span className="text-xs text-slate-500">{percentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`bg-${color}-500 h-2 rounded-full transition-all duration-500 group-hover:bg-${color}-600`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Activity className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <span className="text-xs font-medium text-emerald-700">Live Data</span>
        </div>
        <p className="text-slate-600">Track team performance and ticket metrics in real-time</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Tickets"
          value={analyticsData.totalTickets}
          icon={<BarChart3 className="w-5 h-5" />}
          trend="+12%"
          color="blue"
          description="All time tickets created"
        />
        <StatCard
          title="Active Tickets"
          value={analyticsData.openTickets}
          icon={<Zap className="w-5 h-5" />}
          color="orange"
          description="Currently being worked on"
        />
        <StatCard
          title="Resolved Tickets"
          value={analyticsData.resolvedTickets}
          icon={<CheckCircle2 className="w-5 h-5" />}
          trend="+8%"
          color="emerald"
          description="Successfully completed"
        />
        <StatCard
          title="Avg Resolution"
          value={`${Math.round(analyticsData.avgResolutionTime)}h`}
          icon={<Clock className="w-5 h-5" />}
          trend="-15%"
          color="purple"
          description="Time to resolve tickets"
        />
        <StatCard
          title="Avg SLA Time"
          value={`${Math.round(analyticsData.avgSlaHours)}h`}
          icon={<Target className="w-5 h-5" />}
          color="indigo"
          description="Service level agreement"
        />
        <StatCard
          title="P90 Resolution"
          value={`${Math.round(analyticsData.overallP90ResolutionTime)}h`}
          icon={<Timer className="w-5 h-5" />}
          trend="-8%"
          color="cyan"
          description="90th percentile resolution time"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartCard
          title="Tickets by Status"
          data={analyticsData.ticketsByStatus}
          total={analyticsData.totalTickets}
          icon={<BarChart3 className="w-5 h-5" />}
          colorMap={{
            'new': 'blue',
            'assigned': 'amber',
            'in_progress': 'orange',
            'awaiting_response': 'purple',
            'resolved': 'emerald',
            'closed': 'slate'
          }}
        />

        <ChartCard
          title="Tickets by Department"
          data={analyticsData.ticketsByDepartment}
          total={analyticsData.totalTickets}
          icon={<Users className="w-5 h-5" />}
          colorMap={{
            'Finance': 'blue',
            'Operations': 'emerald',
            'Supply': 'amber',
            'Tech': 'purple',
            'Growth': 'red',
            'CX': 'slate',
            'Engineers': 'teal',
            'Seller Support': 'rose'
          }}
        />
      </div>

      {/* Department Resolution Performance */}
      <div className="mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl">
              <Clock className="w-5 h-5 text-slate-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Department Resolution Performance</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analyticsData.departmentResolutionTimes).map(([deptName, data]) => (
              <div key={deptName} className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{deptName}</h3>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Avg Resolution:</span>
                    <span className="font-semibold text-slate-900">{data.avgResolutionTime.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">P90 Resolution:</span>
                    <span className="font-semibold text-orange-600">{data.p90ResolutionTime.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tickets:</span>
                    <span className="font-semibold text-slate-900">{data.ticketCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard
          title="Priority Distribution"
          data={analyticsData.ticketsByPriority}
          total={analyticsData.totalTickets}
          icon={<AlertTriangle className="w-5 h-5" />}
          colorMap={{
            'urgent': 'red',
            'high': 'orange',
            'medium': 'amber',
            'low': 'emerald'
          }}
        />

        {/* SLA Performance */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl">
              <Award className="w-5 h-5 text-slate-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">SLA Performance</h2>
          </div>
          
          <div className="space-y-6">
            <div className="group p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-900">SLA Breaches</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{analyticsData.slaBreaches}</span>
              </div>
              <p className="text-sm text-red-700 mt-2">Tickets exceeding SLA timeframes</p>
            </div>
            
            <div className="group p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-900">On-time Resolution</span>
                </div>
                <span className="text-2xl font-bold text-emerald-600">
                  {Math.round(((analyticsData.totalTickets - analyticsData.slaBreaches) / analyticsData.totalTickets) * 100)}%
                </span>
              </div>
              <p className="text-sm text-emerald-700 mt-2">Tickets resolved within SLA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};