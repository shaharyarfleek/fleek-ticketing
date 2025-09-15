import React from 'react';

export const TicketSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-6 bg-slate-200 rounded-lg w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-6 bg-slate-200 rounded-full w-16"></div>
              <div className="h-6 bg-slate-100 rounded-full w-12"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
              <div className="h-4 bg-slate-100 rounded w-24"></div>
            </div>
            <div className="h-4 bg-slate-100 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};