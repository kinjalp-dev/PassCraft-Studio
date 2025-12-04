import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface KPICardProps {
  title: string;
  value: string | number;
  delta?: number;
  data?: number[];
  color?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, delta, data }) => {
  const chartData = data?.map((v, i) => ({ i, v })) || [];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
      <div className="z-10 relative">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <div className="flex items-baseline gap-3 mt-1">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          {delta !== undefined && (
            <span className={clsx("flex items-center text-xs font-medium", delta >= 0 ? "text-green-600" : "text-red-600")}>
              {delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(delta)}%
            </span>
          )}
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <Area 
                type="monotone" 
                dataKey="v" 
                stroke="#0ea5e9" 
                fill="#0ea5e9" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
