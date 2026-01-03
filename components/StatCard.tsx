
import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  trend?: number; // percentage
  trendLabel?: string;
  icon?: React.ReactNode;
  neutral?: boolean;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendLabel, icon, neutral = false, description }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
            {description && (
              <div className="relative">
                <button 
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="text-slate-300 hover:text-indigo-500 transition-colors"
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] p-3 rounded-xl shadow-xl z-50 animate-fade-in pointer-events-none font-medium leading-relaxed">
                    <div className="absolute border-8 border-transparent border-t-slate-900 -bottom-3.5 left-1/2 -translate-x-1/2"></div>
                    {description}
                  </div>
                )}
              </div>
            )}
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        </div>
        {icon && <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>}
      </div>
      
      {(trend !== undefined || neutral) && (
        <div className="flex items-center text-[11px] font-bold">
          {neutral ? (
            <span className="flex items-center text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
              <Minus className="w-3 h-3 mr-1" />
              0%
            </span>
          ) : isPositive ? (
            <span className="flex items-center text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {trend}%
            </span>
          ) : (
            <span className="flex items-center text-rose-700 bg-rose-100 px-2 py-0.5 rounded-lg">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              {Math.abs(trend || 0)}%
            </span>
          )}
          <span className="text-slate-400 ml-2 font-medium">{trendLabel || 'vs. anterior'}</span>
        </div>
      )}
    </div>
  );
};
