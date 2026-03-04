
import React from 'react';
import { Client } from '../types';
import { LayoutDashboard, Users, CreditCard, PlusCircle, PieChart, Trash2, X, LogOut, ShieldCheck, FileText, Settings } from 'lucide-react';

interface SidebarProps {
  clients: Client[];
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  onOpenSettings: () => void;
  onOpenAccessManagement: () => void;
  onDeleteClient: (id: string) => void;
  onEditClient: (client: Client) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  isAdmin: boolean;
  viewMode: 'dashboard' | 'reports';
  onViewChange: (view: 'dashboard' | 'reports') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  clients, 
  selectedClientId, 
  onSelectClient, 
  onOpenSettings, 
  onOpenAccessManagement,
  onDeleteClient,
  onEditClient,
  isOpen,
  onClose,
  onLogout,
  isAdmin,
  viewMode,
  onViewChange
}) => {
  return (
    <>
      {/* Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full bg-slate-900 text-white flex flex-col transition-transform duration-300 z-50 w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-lg">
               <PieChart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">AdsManager</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-slate-800 rounded">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="px-4 py-6 flex-1 overflow-y-auto space-y-8">
          {/* Navegação de Seção */}
          <div className="space-y-1">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-2">Menu Principal</h3>
            <button 
              onClick={() => onViewChange('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => onViewChange('reports')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'reports' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <FileText className="w-5 h-5" />
              <span>Relatórios</span>
            </button>
          </div>

          {isAdmin && (
            <div>
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-2">Clientes</h3>
              <div className="space-y-1">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className={`group w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-all cursor-pointer ${
                      selectedClientId === client.id && viewMode === 'dashboard'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                    onClick={() => {
                      onSelectClient(client.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img 
                        src={client.avatar} 
                        alt={client.name} 
                        className="w-7 h-7 rounded-full border border-slate-700 object-cover flex-shrink-0"
                      />
                      <div className="text-left overflow-hidden">
                        <p className="font-medium truncate w-24 text-xs">{client.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClient(client);
                        }}
                        className="p-1.5 rounded-md hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
                        title="Configurar Conexão"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if(window.confirm(`Tem certeza que deseja remover o cliente ${client.name}?`)) {
                            onDeleteClient(client.id);
                          }
                        }}
                        className="p-1.5 rounded-md hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                        title="Remover Cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!isAdmin && (
             <div className="px-2">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Sua Conta</p>
                   <div className="flex items-center gap-3">
                      <img src={clients.find(c => c.id === selectedClientId)?.avatar} className="w-10 h-10 rounded-full border border-white/20" />
                      <div>
                        <p className="font-bold text-white text-sm truncate w-28">{clients.find(c => c.id === selectedClientId)?.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase truncate w-28">{clients.find(c => c.id === selectedClientId)?.industry}</p>
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>

        <div className="px-4 py-6 border-t border-slate-800 space-y-4">
          {isAdmin && (
            <>
              <button 
                onClick={onOpenSettings}
                className="w-full flex items-center gap-3 px-3 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/30 transition-all active:scale-95"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Nova Conta</span>
              </button>

              <button 
                onClick={onOpenAccessManagement}
                className="w-full flex items-center gap-3 px-3 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-sm font-bold transition-all"
              >
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span>Gerenciar Acessos</span>
              </button>
            </>
          )}

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl text-sm font-bold transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
};
