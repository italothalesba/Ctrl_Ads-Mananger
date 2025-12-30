
import React, { useState, useMemo } from 'react';
import { Campaign, AdSet, Ad, DemographicData } from '../types';
import { X, Target, MousePointer, DollarSign, Award, Activity, Sparkles, Loader2, Users, Eye, BarChart3, TrendingUp, Calendar, CreditCard, Layers, LayoutGrid, ListFilter, Play, Timer, Percent, BarChart, MapPin, Search, UserCheck, UserPlus, Users2, AlertCircle } from 'lucide-react';
import { analyzeCampaignPerformance } from '../services/geminiService';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend } from 'recharts';

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
  
  const costPerResult = metrics.messages && metrics.messages > 0 ? (metrics.spend / metrics.messages).toFixed(2) : (metrics.conversions > 0 ? (metrics.spend / metrics.conversions).toFixed(2) : '0.00');

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
      if (t.targeting_id) items.push({ icon: <UserCheck className="w-3 h-3"/>, label: "Público Salvo", value: `ID: ${t.targeting_id}` });
      if (t.custom_audiences) {
        t.custom_audiences.forEach((ca: any) => {
          items.push({ icon: <UserPlus className="w-3 h-3 text-purple-500"/>, label: "Personalizado", value: ca.name || `ID: ${ca.id}` });
        });
      }
      const geo = t.geo_locations?.countries?.join(', ') || 'Brasil';
      items.push({ icon: <MapPin className="w-3 h-3"/>, label: "Local", value: geo });
      items.push({ icon: <Users2 className="w-3 h-3"/>, label: "Idade", value: `${t.age_min || 18} - ${t.age_max || '65+'}` });

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-xl">
               <span className="text-slate-400">{item.icon}</span>
               <span className="text-[10px] font-black text-slate-400 uppercase">{item.label}:</span>
               <span className="text-[11px] font-bold text-slate-700 truncate flex-1">{item.value}</span>
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
        
        {/* Responsive Header */}
        <div className="p-4 md:p-6 bg-white border-b border-slate-200 shadow-sm flex-shrink-0 z-30">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 md:p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                 <Layers className="w-5 h-5 md:w-6 h-6" />
              </div>
              <div className="max-w-[200px] md:max-w-md">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-2 h-2 rounded-full ${campaign.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 font-black truncate">{campaign.platform} • {campaign.objective}</span>
                </div>
                <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight truncate">{campaign.name}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-fit overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('overview')} className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-black transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <Activity className="w-4 h-4" /> Visão Geral
            </button>
            <button onClick={() => setActiveTab('adsets')} className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-black transition-all whitespace-nowrap ${activeTab === 'adsets' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <Users className="w-4 h-4" /> Conjuntos
            </button>
            <button onClick={() => setActiveTab('ads')} className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-black transition-all whitespace-nowrap ${activeTab === 'ads' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <LayoutGrid className="w-4 h-4" /> Anúncios
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 pb-32">
          
          {activeTab === 'overview' && (
            <div className="space-y-6 md:space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Total Gasto</p>
                  <p className="text-2xl md:text-3xl font-black text-slate-900">R$ {metrics.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-indigo-600 p-5 md:p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
                  <p className="text-[9px] font-black text-indigo-200 uppercase mb-2">Resultados</p>
                  <p className="text-2xl md:text-3xl font-black">{metrics.messages || metrics.conversions || 0}</p>
                </div>
                <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Custo p/ Resultado</p>
                  <p className="text-2xl md:text-3xl font-black text-slate-900">R$ {parseFloat(costPerResult).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* DEMOGRAPHIC CHART */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="mb-6 md:mb-8 flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-slate-900 text-base md:text-lg uppercase tracking-tight">Distribuição de Gênero</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Meta Objetivo: {campaign.objective}</p>
                  </div>
                  {!demographicChartData && (
                     <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-lg uppercase">
                       <AlertCircle className="w-3 h-3" /> Sem Dados
                     </span>
                  )}
                </div>
                
                {demographicChartData ? (
                  <div className="h-[250px] md:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={demographicChartData}>
                        <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                        <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={5} />
                        <YAxis hide />
                        <ReTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)'}} />
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase'}} />
                        <Bar name="M" dataKey="Homens" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar name="F" dataKey="Mulheres" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={20} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] md:h-[300px] w-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                    <BarChart3 className="w-10 h-10 text-slate-200 mb-2" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Informações demográficas indisponíveis</p>
                  </div>
                )}
              </div>

              <section className="bg-slate-900 rounded-[32px] md:rounded-[40px] p-1 shadow-2xl">
                <div className="bg-white rounded-[30px] md:rounded-[38px] p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-600 p-2 rounded-xl">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">IA Strategic Insight</h3>
                    </div>
                    {!analysis && !loading && (
                      <button onClick={handleAnalyze} className="w-full md:w-auto bg-slate-900 text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase hover:bg-indigo-600 transition-all">Gerar Relatório</button>
                    )}
                  </div>
                  {loading ? (
                    <div className="flex flex-col items-center py-8 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Analisando segmentação e métricas...</p>
                    </div>
                  ) : analysis && (
                    <div className="bg-slate-50 p-5 md:p-8 rounded-3xl text-xs md:text-sm leading-relaxed text-slate-700 border border-slate-100 font-medium">
                      {analysis}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'adsets' && (
            <div className="space-y-6 animate-fade-in">
              {adSets?.map(adset => (
                <div key={adset.id} className="bg-white rounded-[28px] md:rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 md:p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${adset.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
                      <h4 className="font-black text-slate-900 text-sm md:text-base">{adset.name}</h4>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6">
                       <span className="text-[9px] font-black text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 uppercase">ROAS: {(adset.metrics.conversionValue / (adset.metrics.spend || 1)).toFixed(2)}x</span>
                       <div className="text-right">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Orçamento</p>
                          <p className="text-xs font-black text-slate-900">R$ {adset.budget?.toLocaleString('pt-BR')}</p>
                       </div>
                    </div>
                  </div>
                  
                  <div className="p-5 md:p-6">
                    <div className="mb-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-indigo-600" /> Público Alvo
                      </p>
                      {renderAudienceDetails(adset.audience)}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                       {[
                         { label: 'Gasto', val: `R$ ${adset.metrics.spend.toFixed(2)}` },
                         { label: 'Conv.', val: adset.metrics.messages || adset.metrics.conversions || 0 },
                         { label: 'CTR', val: `${((adset.metrics.clicks / (adset.metrics.impressions || 1)) * 100).toFixed(2)}%` },
                         { label: 'CPM', val: `R$ ${adset.metrics.cpm?.toFixed(2)}` }
                       ].map((stat, i) => (
                         <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{stat.label}</p>
                            <p className="text-xs md:text-sm font-black text-slate-800">{stat.val}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-6 md:space-y-8 animate-fade-in">
              {allAds.map(ad => {
                const adCtr = ad.metrics.impressions > 0 ? ((ad.metrics.clicks / ad.metrics.impressions) * 100).toFixed(2) : '0.00';
                const adCostPerRes = (ad.metrics.messages || ad.metrics.conversions || 0) > 0 
                  ? (ad.metrics.spend / (ad.metrics.messages || ad.metrics.conversions || 1)).toFixed(2) 
                  : '0.00';
                
                return (
                  <div key={ad.id} className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-200 overflow-hidden shadow-sm flex flex-col lg:flex-row hover:shadow-xl transition-all group border-l-4 border-l-indigo-600">
                    <div className="w-full lg:w-72 h-72 lg:h-auto bg-slate-100 relative overflow-hidden flex-shrink-0">
                      <img src={ad.creative.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg shadow-xl">AD: {ad.id}</div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex flex-col justify-end p-5">
                         <p className="text-white text-xs font-black leading-tight">{ad.creative.headline}</p>
                      </div>
                    </div>

                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                         <div>
                            <h5 className="font-black text-slate-900 text-base md:text-lg mb-1">{ad.name}</h5>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${ad.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entrega Ativa</p>
                            </div>
                         </div>
                         <div className="md:text-right">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">CPA Individual</p>
                            <p className="text-xl md:text-2xl font-black text-indigo-600">R$ {adCostPerRes}</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                        {[
                          { l: 'Gasto', v: `R$ ${ad.metrics.spend.toFixed(2)}` },
                          { l: 'Resultados', v: ad.metrics.messages || ad.metrics.conversions || 0 },
                          { l: 'CTR', v: `${adCtr}%` },
                          { l: 'CPM', v: `R$ ${ad.metrics.cpm?.toFixed(2)}` }
                        ].map((stat, i) => (
                          <div key={i} className="bg-slate-50 p-3 md:p-4 rounded-2xl border border-slate-100">
                             <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">{stat.l}</p>
                             <p className="text-[11px] md:text-xs font-black text-slate-800 truncate">{stat.v}</p>
                          </div>
                        ))}
                      </div>

                      {ad.metrics.video && (
                        <div className="bg-indigo-600 rounded-[28px] p-5 md:p-6 text-white">
                          <div className="flex items-center gap-2 mb-4">
                            <Play className="w-4 h-4" />
                            <h6 className="text-[9px] font-black uppercase tracking-widest">Video Metrics</h6>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                             <div>
                                <p className="text-[7px] font-black text-indigo-200 uppercase mb-0.5">Tempo Médio</p>
                                <p className="text-[11px] font-black">{formatVideoTime(ad.metrics.video.avgTime)}</p>
                             </div>
                             <div>
                                <p className="text-[7px] font-black text-indigo-200 uppercase mb-0.5">Retenção 50%</p>
                                <p className="text-[11px] font-black">{((ad.metrics.video.retention50 / ad.metrics.video.plays) * 100).toFixed(1)}%</p>
                             </div>
                             <div>
                                <p className="text-[7px] font-black text-indigo-200 uppercase mb-0.5">VTR 100%</p>
                                <p className="text-[11px] font-black text-emerald-300">{((ad.metrics.video.retention100 / ad.metrics.video.plays) * 100).toFixed(1)}%</p>
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
