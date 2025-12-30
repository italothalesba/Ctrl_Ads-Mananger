import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { X, Save, Lock, AlertCircle, CheckCircle, Wifi, Loader2, AlertTriangle, PlusCircle } from 'lucide-react';
import { validateMetaConnection, MetaAccountInfo } from '../services/metaService';

interface SettingsModalProps {
  initialClient: Client | null; // Null means adding a new account
  isOpen: boolean;
  onClose: () => void;
  // Alterado para retornar os dados validados
  onSave: (data: { adAccountId: string; accessToken: string; accountInfo: MetaAccountInfo }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ initialClient, isOpen, onClose, onSave }) => {
  const [adAccountId, setAdAccountId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string; info?: MetaAccountInfo} | null>(null);

  // Reset or Load data
  useEffect(() => {
    if (isOpen) {
      if (initialClient) {
        setAdAccountId(initialClient.adAccountId || '');
        setAccessToken(initialClient.accessToken || '');
      } else {
        setAdAccountId('');
        setAccessToken('');
      }
      setStatus('idle');
      setTestResult(null);
    }
  }, [initialClient, isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!adAccountId || !accessToken) {
      setTestResult({ success: false, message: "Preencha os campos antes de testar." });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const info = await validateMetaConnection(adAccountId, accessToken);
      setTestResult({ 
        success: true, 
        message: `Conta encontrada: ${info.name} (${info.currency})`,
        info: info
      });
    } catch (error: any) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setStatus('saving');
    setTestResult(null);

    try {
      // 1. Validar se ainda não foi testado
      const info = await validateMetaConnection(adAccountId, accessToken);
      
      // 2. Passar dados para o App
      onSave({ 
        adAccountId, 
        accessToken, 
        accountInfo: info 
      });
      
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1000);
    } catch (error: any) {
      setStatus('idle');
      setTestResult({ success: false, message: `Falha ao salvar: ${error.message}` });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">
              {initialClient ? `Editar ${initialClient.name}` : 'Conectar Nova Conta'}
            </h3>
            <p className="text-xs text-slate-500">
              {initialClient ? 'Atualize as credenciais' : 'Adicione uma conta de anúncios do Facebook'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!initialClient && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex gap-3 text-sm text-indigo-800">
              <PlusCircle className="w-5 h-5 flex-shrink-0 text-indigo-600" />
              <p>Ao salvar, se o ID da conta já existir, ela será atualizada. Se for novo, um novo cliente será criado.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ID da Conta de Anúncios (Ad Account ID)
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={adAccountId}
                onChange={(e) => setAdAccountId(e.target.value)}
                placeholder="act_123456789"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              <div className="absolute left-3 top-2.5 text-slate-400">
                <span className="text-xs font-bold">ID</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">Encontrado na URL do Gerenciador de Anúncios.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Token de Acesso (Access Token)
            </label>
            <div className="relative">
              <input 
                type="password" 
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAAB..."
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deve ter permissões <strong>ads_read</strong>.
            </p>
          </div>

          {/* Área de Feedback do Teste */}
          {testResult && (
            <div className={`p-3 rounded-lg text-sm border flex gap-2 items-start ${testResult.success ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
               {testResult.success ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
               <span>{testResult.message}</span>
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          
          <button 
            onClick={handleTestConnection}
            disabled={isTesting || status === 'saving'}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all"
          >
             {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
             Testar
          </button>

          <button 
            onClick={handleSave}
            disabled={status === 'saving' || status === 'success' || isTesting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${
              status === 'success' 
                ? 'bg-emerald-500' 
                : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed'
            }`}
          >
            {status === 'saving' ? (
              <>
                 <Loader2 className="w-4 h-4 animate-spin" />
                 Salvando...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                {initialClient ? 'Atualizado!' : 'Adicionado!'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {initialClient ? 'Salvar' : 'Adicionar Conta'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};