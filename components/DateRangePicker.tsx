
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

export type DatePreset = 
  | 'maximum' | 'today' | 'yesterday' | 'today_and_yesterday' 
  | 'last_7d' | 'last_14d' | 'last_28d' | 'last_30d' 
  | 'this_week' | 'last_week' | 'this_month' | 'last_month' 
  | 'custom';

interface DateRangePickerProps {
  selected: DatePreset;
  onSelect: (preset: DatePreset, customRange?: { since: string; until: string }) => void;
  initialCustomRange?: { since: string; until: string };
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

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ selected, onSelect, initialCustomRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [since, setSince] = useState(initialCustomRange?.since || '');
  const [until, setUntil] = useState(initialCustomRange?.until || '');
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

  const handleApplyCustom = () => {
    if (since && until) {
      onSelect('custom', { since, until });
      setIsOpen(false);
    }
  };

  const selectedLabel = selected === 'custom' && initialCustomRange 
    ? `${initialCustomRange.since} a ${initialCustomRange.until}`
    : PRESETS.find(p => p.id === selected)?.label || 'Período';

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
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] py-4 animate-fade-in-up flex flex-col">
          <div className="px-6 pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Escolha o Período</h4>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {PRESETS.filter(p => p.id !== 'custom').map((preset) => (
              <button 
                key={preset.id}
                onClick={() => {
                  onSelect(preset.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-6 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between group ${selected === preset.id ? 'bg-indigo-50/50' : ''}`}
              >
                <span className={`text-sm font-semibold ${selected === preset.id ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
                  {preset.label}
                </span>
                {selected === preset.id && <Check className="w-4 h-4 text-indigo-600" />}
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 mt-2 rounded-b-2xl">
             <h5 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
               <Calendar className="w-3 h-3" /> Personalizado
             </h5>
             <div className="space-y-3">
               <div className="grid grid-cols-2 gap-2">
                 <div>
                   <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">Início</label>
                   <input 
                     type="date" 
                     value={since}
                     onChange={(e) => setSince(e.target.value)}
                     className="w-full text-[10px] p-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                   />
                 </div>
                 <div>
                   <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">Fim</label>
                   <input 
                     type="date" 
                     value={until}
                     onChange={(e) => setUntil(e.target.value)}
                     className="w-full text-[10px] p-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                   />
                 </div>
               </div>
               <button 
                onClick={handleApplyCustom}
                disabled={!since || !until}
                className="w-full bg-slate-900 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
               >
                 Aplicar Período
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
