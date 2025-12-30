
import React, { useState, useMemo } from 'react';
import { Campaign, AdSet, Ad } from '../types.ts';
import { X, Target, Activity, Sparkles, Loader2, Users, BarChart3, Layers, LayoutGrid, Play, MapPin, UserCheck, UserPlus, Users2, AlertCircle } from 'lucide-react';
import { analyzeCampaignPerformance } from '../services/geminiService.ts';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend } from 'recharts';
import ReactMarkdown from 'react-markdown';

interface CampaignDetailsProps {
  campaign: Campaign;
  onClose: () => void;
}

type Tab = 'overview' | 'adsets' | 'ads';

export const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaign, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { metrics, adSets } = campaign;
  
  const costPerResult = metrics.messages && metrics.messages > 0 
    ? (metrics.spend / metrics.messages).toFixed(2) 
    : (metrics.conversions > 0 ? (metrics.spend / metrics.conversions).toFixed(2) : '0.00');

  const demographicChartData = useMemo(() => {
    const ageGroups = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
    const hasData = metrics.demographics && metrics.demographics.length > 0;
    
    if (!hasData) return null;

    return ageGroups.map(age => {
      const male = metrics.demographics?.find(d => d.age === age && d.gender === 'male')?.results || 0;
      const female = metrics.demographics?.find(d => d.age === age && d.gender === 'female')?.results || 0;
      return { age, Homens: male, Mulheres: female };
    });
  }, [metrics.demographics]);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeCampaignPerformance(campaign);
    setAnalysis(result);
    setLoading(false);
  };

  const allAds: Ad[] = adSets?.flatMap(as => as.ads) || [];

  const formatVideoTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const renderAudienceDetails = (audienceStr: string) => {
    try {
      const t = JSON.parse(audienceStr);
      const items = [];
      if (t.targeting_id) items.push({ icon: <UserCheck className="w-3 h-3"/>, label: "Público", value: t.targeting_id });
      if (t.custom_audiences) items.push({ icon: <UserPlus className="w-3 h-3"/>, label: "Personalizado", value: "Sim" });
      const geo = t.geo_locations?.countries?.join(', ') || 'Global';
      items.push({ icon: <MapPin className="w-3 h-3"/>, label: "Local", value: geo });

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-xl">
               <span className="text-slate-400">{item.icon}</span>
               <span className="text-[10px] font-black text-slate-400 uppercase">{item.label}:</span>
               <span className="text-[11px] font-bold text-slate-700 truncate">{item.value}</span>
            </div>
          ))}
        </div>
      );
    } catch {
      return <p className="text-xs text-slate-500 mt-2 italic font-medium">{audienceStr}</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex justify-end">
      <div className="w-full sm:max-w-5xl bg-slate-50 h-full shadow-2xl overflow-hidden animate-slide-in-right border-l border-slate-200 flex flex-col">
        
        <div className="p-4 md:p-6 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                 <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">{campaign.platform} • {campaign.objective}</span>
                <h2 className="text-lg md:text-xl font-black text-slate-900 truncate">{campaign.name}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Visão Geral</button>
            <button onClick={() => setActiveTab('adsets')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'adsets' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Conjuntos</button>
            <button onClick={() => setActiveTab('ads')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'ads' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Anúncios</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 pb-32">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Investimento</p>
                  <p className="text-2xl font-black text-slate-900">R$ {metrics.spend.toLocaleString('pt-BR')}</p>
                </div>
                <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
                  <p className="text-[9px] font-black text-indigo-200 uppercase mb-2">Resultados</p>
                  <p className="text-2xl font-black">{metrics.conversions || metrics.messages || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Custo Resultado</p>
                  <p className="text-2xl font-black text-slate-900">R$ {costPerResult}</p>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <h3 className="font-black text-slate-900 text-base uppercase tracking-tight mb-8">Público por Gênero e Idade</h3>
                {demographicChartData ? (
                  <div className="h-[300px] w-full min-w-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={demographicChartData}>
                        <CartesianGrid vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                        <YAxis hide />
                        <ReTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Legend verticalAlign="bottom" iconType="circle" />
                        <Bar name="Homens" dataKey="Homens" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar name="Mulheres" dataKey="Mulheres" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                    <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-[10px] font-black text-slate-300 uppercase">Sem dados demográficos</p>
                  </div>
                )}
              </div>

              <section className="bg-slate-900 rounded-[32px] p-6 md:p-8 text-white">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest">Análise Estratégica IA</h3>
                  </div>
                  {!analysis && !loading && (
                    <button onClick={handleAnalyze} className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-lg uppercase hover:bg-indigo-500 transition-all">Gerar Análise</button>
                  )}
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  </div>
                ) : analysis && (
                  <div className="prose prose-sm prose-invert max-w-none text-slate-300">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'adsets' && (
            <div className="space-y-6 animate-fade-in">
              {adSets?.map(adset => (
                <div key={adset.id} className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${adset.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <h4 className="font-black text-slate-900 text-sm">{adset.name}</h4>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase">Budget: R$ {adset.budget}</span>
                  </div>
                  <div className="p-5">
                    {renderAudienceDetails(adset.audience)}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">Investido</p>
                          <p className="text-xs font-black text-slate-800">R$ {adset.metrics.spend}</p>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">Conv.</p>
                          <p className="text-xs font-black text-slate-800">{adset.metrics.conversions || 0}</p>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">ROAS</p>
                          <p className="text-xs font-black text-indigo-600">{(adset.metrics.conversionValue / (adset.metrics.spend || 1)).toFixed(2)}x</p>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-6 animate-fade-in">
              {allAds.map(ad => (
                <div key={ad.id} className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row group">
                  <div className="w-full md:w-64 h-64 md:h-auto bg-slate-100 flex-shrink-0 relative overflow-hidden">
                    <img src={ad.creative.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg">ID: {ad.id}</div>
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <h5 className="font-black text-slate-900 text-base mb-1">{ad.name}</h5>
                      <p className="text-[10px] text-slate-400 font-bold mb-4">{ad.creative.headline}</p>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">Gasto</p>
                          <p className="text-xs font-black text-slate-800">R$ {ad.metrics.spend}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">Cliques</p>
                          <p className="text-xs font-black text-slate-800">{ad.metrics.clicks}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">CTR</p>
                          <p className="text-xs font-black text-slate-800">{((ad.metrics.clicks / (ad.metrics.impressions || 1)) * 100).toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">CPM</p>
                          <p className="text-xs font-black text-slate-800">R$ {ad.metrics.cpm?.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
