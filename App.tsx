
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_CLIENTS } from './constants.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { StatCard } from './components/StatCard.tsx';
import { CampaignDetails } from './components/CampaignDetails.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { DateRangePicker, DatePreset } from './components/DateRangePicker.tsx';
import { Login } from './components/Login.tsx';
import { Client, Campaign } from './types.ts';
import { Search, Filter, Calendar, BarChart2, DollarSign, MousePointer, ShoppingBag, Eye, Target, RefreshCw, AlertTriangle, Menu, TrendingUp, Loader2, LogOut } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { syncMetaAdsData, MetaAccountInfo } from './services/metaService.ts';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>(MOCK_CLIENTS[0].id);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    const savedAuth = localStorage.getItem('ads_manager_auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(true);
      setUserEmail(authData.email);
    }
    setIsAuthChecking(false);
  }, []);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    localStorage.setItem('ads_manager_auth', JSON.stringify({ email, timestamp: Date.now() }));
  };

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair do sistema?')) {
      setIsAuthenticated(false);
      setUserEmail(null);
      localStorage.removeItem('ads_manager_auth');
    }
  };

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const clientMetrics = useMemo(() => {
    if (!selectedClient) return { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 };
    return selectedClient.campaigns.reduce((acc, curr) => {
      acc.spend += curr.metrics.spend;
      acc.impressions += curr.metrics.impressions;
      acc.clicks += curr.metrics.clicks;
      acc.conversions += curr.metrics.conversions;
      acc.revenue += curr.metrics.conversionValue;
      return acc;
    }, { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 });
  }, [selectedClient]);

  const roas = clientMetrics.spend > 0 ? (clientMetrics.revenue / clientMetrics.spend).toFixed(2) : '0.00';
  const ctr = clientMetrics.impressions > 0 ? ((clientMetrics.clicks / clientMetrics.impressions) * 100).toFixed(2) : '0.00';

  const chartData = useMemo(() => {
    const isMax = datePreset === 'maximum';
    const multiplier = isMax ? 2.5 : 1;
    return [
      { name: 'S1', spend: (clientMetrics.spend * 0.1) * multiplier, revenue: (clientMetrics.revenue * 0.08) * multiplier },
      { name: 'S2', spend: (clientMetrics.spend * 0.3) * multiplier, revenue: (clientMetrics.revenue * 0.25) * multiplier },
      { name: 'S3', spend: (clientMetrics.spend * 0.6) * multiplier, revenue: (clientMetrics.revenue * 0.55) * multiplier },
      { name: 'S4', spend: (clientMetrics.spend * 1.0) * multiplier, revenue: (clientMetrics.revenue * 1.0) * multiplier },
    ];
  }, [clientMetrics, datePreset]);

  const handleSyncData = async (presetOverride?: DatePreset) => {
    if (!isAuthenticated) return;
    setIsSyncing(true);
    setSyncError(null);
    
    const targetPreset = presetOverride || datePreset;

    try {
      if (selectedClient.adAccountId && selectedClient.accessToken) {
        const updatedClient = await syncMetaAdsData(selectedClient, targetPreset);
        setClients(prevClients => 
          prevClients.map(c => c.id === updatedClient.id ? updatedClient : c)
        );
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (targetPreset === 'maximum') {
          setClients(prevClients => prevClients.map(c => {
            if (c.id !== selectedClientId) return c;
            return {
              ...c,
              lastSync: `Máximo (${new Date().toLocaleTimeString()})`,
              campaigns: c.campaigns.map(camp => ({
                ...camp,
                metrics: {
                  ...camp.metrics,
                  spend: camp.metrics.spend * 2.5,
                  conversions: Math.floor(camp.metrics.conversions * 2.2),
                  conversionValue: camp.metrics.conversionValue * 2.8,
                  clicks: Math.floor(camp.metrics.clicks * 2.1),
                  impressions: Math.floor(camp.metrics.impressions * 2.4)
                }
              }))
            };
          }));
        } else {
          setClients([...MOCK_CLIENTS]);
        }
      }
    } catch (error: any) {
      setSyncError(error.message);
      setTimeout(() => setSyncError(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      handleSyncData(datePreset);
    }
  }, [datePreset, selectedClientId, isAuthenticated]);

  const handleSaveAccount = (data: { adAccountId: string; accessToken: string; accountInfo: MetaAccountInfo }) => {
    const { accessToken, accountInfo } = data;
    const officialId = accountInfo.id;
    
    setClients(prevClients => {
      const existingClientIndex = prevClients.findIndex(c => 
        (c.adAccountId && c.adAccountId === officialId) ||
        (editingClient && c.id === editingClient.id)
      );

      if (existingClientIndex >= 0) {
        const updatedClients = [...prevClients];
        updatedClients[existingClientIndex] = {
          ...updatedClients[existingClientIndex],
          name: accountInfo.name,
          adAccountId: officialId,
          accessToken: accessToken,
          lastSync: 'Atualizado'
        };
        setSelectedClientId(updatedClients[existingClientIndex].id);
        return updatedClients;
      } else {
        const newClient: Client = {
          id: `c_${Date.now()}`,
          name: accountInfo.name,
          industry: 'Geral',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(accountInfo.name)}&background=random`,
          adAccountId: officialId,
          accessToken: accessToken,
          lastSync: 'Conectado',
          campaigns: []
        };
        setSelectedClientId(newClient.id);
        return [...prevClients, newClient];
      }
    });
  };

  const handleDeleteClient = (id: string) => {
    setClients(prevClients => {
      const filtered = prevClients.filter(c => c.id !== id);
      if (selectedClientId === id && filtered.length > 0) {
        setSelectedClientId(filtered[0].id);
      }
      return filtered;
    });
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar 
        clients={clients} 
        selectedClientId={selectedClientId} 
        onSelectClient={setSelectedClientId} 
        onOpenSettings={() => {
          setEditingClient(null);
          setIsSettingsOpen(true);
        }}
        onDeleteClient={handleDeleteClient}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full lg:ml-64 transition-all duration-300 overflow-x-hidden relative">
        {isSyncing && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4 animate-fade-in">
               <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
               <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Atualizando Dados...</p>
            </div>
          </div>
        )}

        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg">
             <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex flex-col items-center">
             <h4 className="text-xs font-black text-indigo-600 truncate max-w-[150px]">{selectedClient.name}</h4>
          </div>
          <button onClick={handleLogout} className="p-2 text-rose-500">
             <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-8 space-y-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Painel de Tráfego</h1>
              </div>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
                Cliente: <span className="font-bold text-indigo-600">{selectedClient.name}</span> • <span className="text-slate-400">{selectedClient.lastSync}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button 
                onClick={() => handleSyncData()}
                disabled={isSyncing}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow-lg shadow-indigo-100 active:scale-95 transition-all disabled:bg-slate-400"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync
              </button>
              <DateRangePicker 
                selected={datePreset} 
                onSelect={setDatePreset} 
              />
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard label="Investimento" value={`R$ ${clientMetrics.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} trend={datePreset === 'maximum' ? 145 : 12} icon={<DollarSign />} />
            <StatCard label="ROAS" value={`${roas}x`} trend={datePreset === 'maximum' ? 15 : -2} icon={<BarChart2 />} />
            <StatCard label="Conversões" value={clientMetrics.conversions.toString()} trend={datePreset === 'maximum' ? 210 : 8} icon={<ShoppingBag />} />
            <StatCard label="CTR Médio" value={`${ctr}%`} neutral icon={<MousePointer />} />
          </div>

          <div className="bg-white p-4 md:p-8 rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Performance ({datePreset})
              </h3>
            </div>
            <div className="h-[250px] md:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <YAxis hide />
                  <CartesianGrid vertical={false} stroke="#f8fafc" />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={4} animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Campanhas</h2>
              <div className="relative w-full md:w-72">
                 <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                 />
                 <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {selectedClient.campaigns.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-slate-100 border-dashed">
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhuma campanha encontrada.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                {selectedClient.campaigns.map((campaign) => (
                  <div 
                    key={campaign.id} 
                    onClick={() => setSelectedCampaign(campaign)}
                    className="bg-white rounded-[28px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all cursor-pointer group flex flex-col sm:flex-row overflow-hidden animate-fade-in"
                  >
                    <div className="w-full sm:w-44 h-44 sm:h-auto bg-slate-100 flex-shrink-0 relative overflow-hidden">
                      <img src={campaign.creative.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <span className="absolute top-3 left-3 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">{campaign.platform}</span>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h3 className="font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">{campaign.name}</h3>
                          <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase flex-shrink-0 ${campaign.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 mb-4">
                          <Target className="w-3 h-3 text-indigo-500" /> {campaign.objective}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
                          <div>
                            <p className="text-[8px] text-slate-400 uppercase font-black">Gasto</p>
                            <p className="font-black text-slate-900 text-xs">R$ {campaign.metrics.spend.toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-slate-400 uppercase font-black">ROAS</p>
                            <p className="font-black text-indigo-600 text-xs">{(campaign.metrics.conversionValue / (campaign.metrics.spend || 1)).toFixed(1)}x</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-slate-400 uppercase font-black">CTR</p>
                            <p className="font-black text-slate-900 text-xs">{((campaign.metrics.clicks / (campaign.metrics.impressions || 1)) * 100).toFixed(1)}%</p>
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
      </main>

      {selectedCampaign && (
        <CampaignDetails 
          campaign={selectedCampaign} 
          onClose={() => setSelectedCampaign(null)} 
        />
      )}

      <SettingsModal
        initialClient={editingClient}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveAccount}
      />
    </div>
  );
}

export default App;
