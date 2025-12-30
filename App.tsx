
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { StatCard } from './components/StatCard.tsx';
import { CampaignDetails } from './components/CampaignDetails.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { DateRangePicker, DatePreset } from './components/DateRangePicker.tsx';
import { Login } from './components/Login.tsx';
import { Client, Campaign } from './types.ts';
import { Search, BarChart2, DollarSign, MousePointer, ShoppingBag, RefreshCw, TrendingUp, Loader2, PlusCircle, Database, AlertCircle, WifiOff } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { syncMetaAdsData, MetaAccountInfo } from './services/metaService.ts';
import { db } from './firebase.ts';
import { collection, onSnapshot, setDoc, doc, deleteDoc, query } from 'firebase/firestore';

// Função utilitária para remover campos undefined (Firestore não aceita undefined)
const sanitizeData = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeData);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, sanitizeData(v)])
    );
  }
  return obj;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const isFirebaseAvailable = !!db;

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('ads_manager_auth');
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        setIsAuthenticated(true);
        setUserEmail(authData.email);
      }
    } catch (e) {
      console.error("Erro ao ler auth local:", e);
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isFirebaseAvailable) return;

    try {
      const q = query(collection(db, "clients"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const clientsData: Client[] = [];
        querySnapshot.forEach((doc) => {
          clientsData.push(doc.data() as Client);
        });
        setClients(clientsData);
        if (clientsData.length > 0 && !selectedClientId) {
          setSelectedClientId(clientsData[0].id);
        }
      }, (error) => {
        console.error("Erro no Firestore Snapshot:", error);
        setSyncError("Conexão instável com o banco de dados.");
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Erro ao iniciar snapshot:", err);
      setSyncError("Erro crítico de inicialização.");
    }
  }, [isAuthenticated, isFirebaseAvailable]);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    localStorage.setItem('ads_manager_auth', JSON.stringify({ email, timestamp: Date.now() }));
  };

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      setIsAuthenticated(false);
      setUserEmail(null);
      localStorage.removeItem('ads_manager_auth');
    }
  };

  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  const clientMetrics = useMemo(() => {
    if (!selectedClient || !selectedClient.campaigns) return { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 };
    return selectedClient.campaigns.reduce((acc, curr) => {
      acc.spend += curr.metrics.spend || 0;
      acc.impressions += curr.metrics.impressions || 0;
      acc.clicks += curr.metrics.clicks || 0;
      acc.conversions += curr.metrics.conversions || 0;
      acc.revenue += curr.metrics.conversionValue || 0;
      return acc;
    }, { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 });
  }, [selectedClient]);

  const roas = clientMetrics.spend > 0 ? (clientMetrics.revenue / clientMetrics.spend).toFixed(2) : '0.00';

  const chartData = useMemo(() => {
    return [
      { name: 'Jan', spend: (clientMetrics.spend * 0.2), revenue: (clientMetrics.revenue * 0.15) },
      { name: 'Fev', spend: (clientMetrics.spend * 0.5), revenue: (clientMetrics.revenue * 0.45) },
      { name: 'Mar', spend: (clientMetrics.spend * 1.0), revenue: (clientMetrics.revenue * 1.0) },
    ];
  }, [clientMetrics]);

  const handleSyncData = async (presetOverride?: DatePreset) => {
    if (!isAuthenticated || !selectedClient) return;
    setIsSyncing(true);
    setSyncError(null);
    const targetPreset = presetOverride || datePreset;

    try {
      if (selectedClient.adAccountId && selectedClient.accessToken) {
        const updatedClientData = await syncMetaAdsData(selectedClient, targetPreset);
        if (isFirebaseAvailable) {
          const sanitized = sanitizeData(updatedClientData);
          await setDoc(doc(db, "clients", sanitized.id), sanitized, { merge: true });
        }
      }
    } catch (error: any) {
      setSyncError(`Falha na sincronização: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveAccount = async (data: { adAccountId: string; accessToken: string; accountInfo: MetaAccountInfo }) => {
    const { adAccountId, accessToken, accountInfo } = data;
    const clientId = `c_${accountInfo.id}`;
    const existingClient = clients.find(c => c.id === clientId);

    const newClient: Client = {
      id: clientId,
      name: accountInfo.name,
      industry: 'Geral',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(accountInfo.name)}&background=random`,
      adAccountId: accountInfo.id,
      accessToken: accessToken,
      lastSync: 'Conectado agora',
      campaigns: existingClient?.campaigns || []
    };

    try {
      if (isFirebaseAvailable) {
        const sanitized = sanitizeData(newClient);
        await setDoc(doc(db, "clients", sanitized.id), sanitized, { merge: true });
        setSelectedClientId(clientId);
        setIsSettingsOpen(false);
        setTimeout(() => handleSyncData(), 500);
      }
    } catch (e: any) {
      alert("Erro ao salvar no banco de dados.");
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm('Excluir este cliente e todos os dados salvos?')) return;
    try {
      if (isFirebaseAvailable) await deleteDoc(doc(db, "clients", id));
      if (selectedClientId === id) setSelectedClientId('');
    } catch (e) {
      console.error("Erro ao deletar:", e);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  if (!isFirebaseAvailable && isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-200 text-center max-w-md">
          <WifiOff className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 mb-4">Banco de Dados Offline</h2>
          <p className="text-slate-500 mb-8 font-medium">Não foi possível conectar ao Firebase. Verifique sua conexão ou se as chaves de API estão corretas.</p>
          <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar 
        clients={clients} 
        selectedClientId={selectedClientId} 
        onSelectClient={setSelectedClientId} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onDeleteClient={handleDeleteClient}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full lg:ml-64 transition-all duration-300 overflow-x-hidden relative">
        {syncError && (
          <div className="bg-rose-50 border-b border-rose-200 px-8 py-3 flex items-center gap-3 text-rose-700 text-xs font-bold animate-fade-in">
            <AlertCircle className="w-4 h-4" />
            {syncError}
            <button onClick={() => setSyncError(null)} className="ml-auto text-rose-400 hover:text-rose-600 font-black">X</button>
          </div>
        )}

        {!selectedClient && clients.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10 p-8">
            <div className="text-center max-w-sm">
              <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <PlusCircle className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Início do Dashboard</h2>
              <p className="text-slate-500 text-sm font-medium mb-8">Conecte sua primeira conta do Meta Ads para centralizar os dados.</p>
              <button onClick={() => setIsSettingsOpen(true)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100">
                Conectar Conta
              </button>
            </div>
          </div>
        )}

        {selectedClient && (
          <div className="p-4 md:p-8 space-y-8 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3">
                   <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{selectedClient.name}</h1>
                   <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase flex items-center gap-1">
                     <Database className="w-3 h-3" /> Firestore Online
                   </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
                  ID: <span className="text-slate-900 font-bold">{selectedClient.adAccountId}</span> • Sync: <span className="text-indigo-600 font-bold">{selectedClient.lastSync}</span>
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <button 
                  onClick={() => handleSyncData()}
                  disabled={isSyncing}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all shadow-lg active:scale-95 ${
                    isSyncing 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Dados'}
                </button>
                <DateRangePicker selected={datePreset} onSelect={setDatePreset} />
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard label="Total Gasto" value={`R$ ${clientMetrics.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} trend={12} icon={<DollarSign />} />
              <StatCard label="ROAS Médio" value={`${roas}x`} trend={8} icon={<BarChart2 />} />
              <StatCard label="Conversões" value={clientMetrics.conversions.toString()} trend={15} icon={<ShoppingBag />} />
              <StatCard label="Cliques Únicos" value={clientMetrics.clicks.toLocaleString('pt-BR')} icon={<MousePointer />} />
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> Histórico de Resultados
                </h3>
              </div>
              {/* min-w-0 e h-[300px] ajudam o ResponsiveContainer a calcular as dimensões iniciais */}
              <div className="h-[300px] w-full min-w-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="spend" stroke="#4f46e5" fill="url(#colorSpend)" strokeWidth={4} name="Investimento" />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRev)" strokeWidth={4} name="Receita" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase text-[12px] tracking-widest">Campanhas</h2>
                <div className="relative">
                   <input type="text" placeholder="Filtrar..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
                   <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {selectedClient.campaigns.length === 0 ? (
                <div className="bg-white rounded-[32px] p-16 text-center border-2 border-slate-100 border-dashed">
                  <Database className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Aguardando dados da Meta Ads...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {selectedClient.campaigns.map((campaign) => (
                    <div 
                      key={campaign.id} 
                      onClick={() => setSelectedCampaign(campaign)}
                      className="bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all cursor-pointer group flex flex-col sm:flex-row overflow-hidden"
                    >
                      <div className="w-full sm:w-48 h-48 sm:h-auto bg-slate-100 flex-shrink-0 relative overflow-hidden">
                        <img src={campaign.creative.url || 'https://via.placeholder.com/300'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                        <div className="absolute top-4 left-4 bg-slate-900/90 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg tracking-widest">{campaign.platform}</div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">{campaign.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${campaign.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                              {campaign.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mt-6">
                            <div>
                              <p className="text-[8px] text-slate-400 uppercase font-black mb-1">Gasto</p>
                              <p className="font-black text-slate-900 text-xs">R$ {campaign.metrics.spend.toLocaleString('pt-BR')}</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-slate-400 uppercase font-black mb-1">ROAS</p>
                              <p className="font-black text-indigo-600 text-xs">{(campaign.metrics.conversionValue / (campaign.metrics.spend || 1)).toFixed(2)}x</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-slate-400 uppercase font-black mb-1">CPA</p>
                              <p className="font-black text-slate-900 text-xs">R$ {(campaign.metrics.spend / (campaign.metrics.conversions || 1)).toFixed(2)}</p>
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
        )}
      </main>

      {selectedCampaign && (
        <CampaignDetails campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}

      <SettingsModal
        initialClient={null}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveAccount}
      />
    </div>
  );
}

export default App;
