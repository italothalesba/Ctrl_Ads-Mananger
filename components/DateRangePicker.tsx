import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export type DatePreset = 
  | 'maximum' | 'today' | 'yesterday' | 'today_and_yesterday' 
  | 'last_7d' | 'last_14d' | 'last_28d' | 'last_30d' 
  | 'this_week' | 'last_week' | 'this_month' | 'last_month' 
  | 'custom';

interface DateRangePickerProps {
  selected: DatePreset;
  onSelect: (preset: DatePreset) => void;
}

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'maximum', label: 'Máximo' },
  { id: 'today', label: 'Hoje' },
  { id: 'yesterday', label: 'Ontem' },
  { id: 'today_and_yesterday', label: 'Hoje e ontem' },
  { id: 'last_7d', label: 'Últimos 7 dias' },
  { id: 'last_14d', label: 'Últimos 14 dias' },
  { id: 'last_28d', label: 'Últimos 28 dias' },
  { id: 'last_30d', label: 'Últimos 30 dias' },
  { id: 'this_week', label: 'Esta semana' },
  { id: 'last_week', label: 'Semana passada' },
  { id: 'this_month', label: 'Este mês' },
  { id: 'last_month', label: 'Mês passado' },
  { id: 'custom', label: 'Personalizado' },
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = PRESETS.find(p => p.id === selected)?.label || 'Período';

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow-sm hover:border-indigo-300 transition-all whitespace-nowrap"
      >
        <Calendar className="w-4 h-4 text-indigo-600" />
        {selectedLabel}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] py-4 animate-fade-in-up">
          <div className="px-6 pb-2 mb-2 border-b border-slate-100">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Usados recentemente</h4>
          </div>
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {PRESETS.map((preset) => (
              <label 
                key={preset.id}
                className="flex items-center px-6 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="relative flex items-center justify-center mr-3">
                  <input 
                    type="radio" 
                    name="date-preset"
                    className="appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-indigo-600 transition-all"
                    checked={selected === preset.id}
                    onChange={() => {
                      onSelect(preset.id);
                      setIsOpen(false);
                    }}
                  />
                  {selected === preset.id && (
                    <div className="absolute w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                  )}
                </div>
                <span className={`text-sm font-semibold transition-colors ${selected === preset.id ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                  {preset.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};