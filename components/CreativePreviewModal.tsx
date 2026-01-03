
import React from 'react';
import { X, Maximize2, BarChart3, Target, Share2 } from 'lucide-react';
import { Campaign } from '../types';

interface CreativePreviewModalProps {
  campaign: Campaign;
  onClose: () => void;
  onOpenDetails: () => void;
}

export const CreativePreviewModal: React.FC<CreativePreviewModalProps> = ({ campaign, onClose, onOpenDetails }) => {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop com desfoque profundo */}
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      
      {/* Container do Modal - overflow-y-auto habilitado para mobile */}
      <div className="relative w-full max-w-5xl bg-white rounded-[32px] md:rounded-[40px] shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row animate-fade-in-up max-h-[95vh] md:max-h-[90vh]">
        
        {/* Área do Criativo (Esquerda/Topo) */}
        <div className="w-full md:flex-1 bg-slate-100 flex items-center justify-center relative group min-h-[250px] md:min-h-[400px]">
          <img 
            src={campaign.creative.url} 
            alt={campaign.name}
            className="w-full h-full object-contain max-h-[40vh] md:max-h-[70vh]"
          />
          <div className="absolute top-4 md:top-6 left-4 md:left-6 bg-slate-900/60 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10">
            {campaign.platform} • Preview
          </div>
          <button className="absolute bottom-4 md:bottom-6 right-4 md:right-6 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Informações Rápidas (Direita/Base) */}
        <div className="w-full md:w-80 p-6 md:p-8 flex flex-col border-t md:border-t-0 md:border-l border-slate-100 bg-white">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="bg-indigo-50 text-indigo-600 p-2 md:p-2.5 rounded-2xl">
                <Target className="w-5 h-5 md:w-6 h-6" />
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5 md:w-6 h-6" />
              </button>
            </div>

            <h2 className="text-lg md:text-xl font-black text-slate-900 leading-tight mb-2">
              {campaign.name}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 md:mb-6">
              {campaign.objective}
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Headline do Anúncio</p>
                <p className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed italic">
                  "{campaign.creative.headline}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Status</p>
                  <p className={`text-[9px] md:text-[10px] font-black uppercase mt-1 ${campaign.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {campaign.status === 'active' ? 'Ativo' : 'Pausado'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Mídia</p>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase mt-1">
                    {campaign.creative.type}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-8 space-y-3">
            <button 
              onClick={onOpenDetails}
              className="w-full bg-slate-900 text-white py-3.5 md:py-4 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg md:shadow-xl shadow-slate-200"
            >
              <BarChart3 className="w-4 h-4" />
              Ver Métricas e IA
            </button>
            <button className="w-full bg-white border border-slate-200 text-slate-500 py-3.5 md:py-4 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
