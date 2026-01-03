
import React, { useState } from 'react';
import { Client } from '../types';
import { X, ShieldCheck, Key, Mail, Save, Loader2 } from 'lucide-react';

interface AccessManagementModalProps {
  clients: Client[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateAccess: (clientId: string, email: string, pass: string) => Promise<void>;
}

export const AccessManagementModal: React.FC<AccessManagementModalProps> = ({ clients, isOpen, onClose, onUpdateAccess }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleStartEdit = (client: Client) => {
    setEditingId(client.id);
    setEmail(client.loginEmail || '');
    setPass(client.loginPassword || '');
  };

  const handleSave = async (id: string) => {
    setIsSaving(true);
    try {
      await onUpdateAccess(id, email, pass);
      setEditingId(null);
    } catch (e) {
      alert("Erro ao salvar acesso.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Gerenciar Acessos Individuais
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Defina e-mail e senha para seus clientes acessarem o dashboard.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Nenhum cliente cadastrado.</p>
            </div>
          ) : (
            clients.map((client) => (
              <div key={client.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 group hover:border-indigo-200 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={client.avatar} className="w-10 h-10 rounded-full border border-white shadow-sm" alt={client.name} />
                    <div>
                      <p className="font-black text-slate-900 text-sm leading-none mb-1">{client.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{client.industry}</p>
                    </div>
                  </div>

                  {editingId === client.id ? (
                    <div className="flex flex-col md:flex-row gap-2 flex-1 max-w-md">
                      <div className="relative flex-1">
                        <input 
                          type="email" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)}
                          placeholder="E-mail"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          value={pass} 
                          onChange={e => setPass(e.target.value)}
                          placeholder="Senha"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                      <button 
                        onClick={() => handleSave(client.id)}
                        disabled={isSaving}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Acesso atual:</p>
                        <p className="text-xs font-bold text-slate-600">{client.loginEmail || 'Sem acesso'}</p>
                      </div>
                      <button 
                        onClick={() => handleStartEdit(client)}
                        className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all"
                      >
                        Configurar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
