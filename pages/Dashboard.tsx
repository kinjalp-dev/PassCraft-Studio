import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { KPICard } from '../components/ui/KPICard';
import { Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['stats'], queryFn: api.getStats });

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-500" /></div>;
  }

  if (!data) return <div>Error loading stats</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Templates" 
          value={data.totalTemplates} 
          delta={12} 
        />
        <KPICard 
          title="Total Downloads" 
          value={data.totalDownloads.toLocaleString()} 
          delta={5.4} 
          data={data.downloadsTrend}
        />
        <KPICard 
          title="Active Users" 
          value={data.activeUsers} 
          delta={-2.1} 
        />
        <KPICard 
          title="Revenue (Est)" 
          value={`$${data.revenue}`} 
          delta={8.5} 
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
        <div className="text-sm text-slate-500">
          Activity feed feature coming soon...
        </div>
      </div>
    </div>
  );
};
