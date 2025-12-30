import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  trend?: number; // percentage
  trendLabel?: string;
  icon?: React.ReactNode;
  neutral?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendLabel, icon, neutral = false }) => {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        {icon && <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">{icon}</div>}
      </div>
      
      {(trend !== undefined || neutral) && (
        <div className="flex items-center text-sm">
          {neutral ? (
            <span className="flex items-center text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
              <Minus className="w-3 h-3 mr-1" />
              0%
            </span>
          ) : isPositive ? (
            <span className="flex items-center text-emerald-700 font-medium bg-emerald-100 px-2 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {trend}%
            </span>
          ) : (
            <span className="flex items-center text-rose-700 font-medium bg-rose-100 px-2 py-0.5 rounded">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              {Math.abs(trend || 0)}%
            </span>
          )}
          <span className="text-slate-400 ml-2">{trendLabel || 'vs. mês anterior'}</span>
        </div>
      )}
    </div>
  );
};
