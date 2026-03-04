
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase.ts';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Report, Client } from '../types.ts';
import { Calendar, FileText, ChevronRight, TrendingUp, DollarSign, Target, Loader2, Filter, Search, Clock, Award } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ReportsPageProps {
  client: Client;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ client }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "reports"),
      where("clientId", "==", client.id),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Report[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Report));
      setReports(data);
      if (data.length > 0 && !selectedReportId) setSelectedReportId(data[0].id);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [client.id]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => r.month === selectedMonth && r.year === selectedYear);
  }, [reports, selectedMonth, selectedYear]);

  const activeReport = useMemo(() => {
    return reports.find(r => r.id === selectedReportId) || null;
  }, [reports, selectedReportId]);

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            Central de Relatórios
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Snapshot de performance salvos automaticamente 2x ao dia.</p>
        </div>

        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent text-xs font-black uppercase outline-none px-2 py-1 text-slate-600"
          >
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <div className="w-px h-4 bg-slate-200 self-center"></div>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-xs font-black uppercase outline-none px-2 py-1 text-slate-600"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lista Lateral de Relatórios */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Arquivos de {months[selectedMonth - 1]}</h3>
          
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
              <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400">Nenhum relatório neste período.</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReportId(report.id)}
                className={`w-full text-left p-5 rounded-3xl border transition-all flex items-center justify-between group ${
                  selectedReportId === report.id 
                    ? 'bg-indigo-600 border-indigo-700 text-white shadow-xl shadow-indigo-100' 
                    : 'bg-white border-slate-200 text-slate-900 hover:border-indigo-300'
                }`}
              >
                <div>
                  <p className={`text-[10px] font-black uppercase mb-1 ${selectedReportId === report.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {new Date(report.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {new Date(report.timestamp).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="font-black text-sm">Snap de Performance</p>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform ${selectedReportId === report.id ? 'translate-x-1' : 'text-slate-300'}`} />
              </button>
            ))
          )}
        </div>

        {/* Visualizador de Relatório */}
        <div className="lg:col-span-8">
          {activeReport ? (
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
              <div className="p-8 md:p-10 bg-slate-900 text-white">
                <div className="flex justify-between items-start mb-10">
                   <div className="bg-indigo-500 p-3 rounded-2xl">
                      <Award className="w-8 h-8" />
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Snapshot de métricas</p>
                      <p className="text-sm font-bold text-slate-300">{new Date(activeReport.timestamp).toLocaleString('pt-BR')}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Investimento</p>
                      <p className="text-xl font-black">R$ {activeReport.metricsSnapshot.totalSpend.toLocaleString('pt-BR')}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Resultados</p>
                      <p className="text-xl font-black text-indigo-400">{activeReport.metricsSnapshot.totalConversions}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Retorno (ROAS)</p>
                      <p className="text-xl font-black text-emerald-400">{activeReport.metricsSnapshot.avgRoas.toFixed(2)}x</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Faturamento</p>
                      <p className="text-xl font-black text-slate-100">R$ {activeReport.metricsSnapshot.totalRevenue.toLocaleString('pt-BR')}</p>
                   </div>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{activeReport.summary}</ReactMarkdown>
                </div>
              </div>

              <div className="px-8 md:px-12 py-6 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <TrendingUp className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Leitura Automática IA</p>
                    <p className="text-[10px] text-slate-400 font-bold">Gerado via Gemini 1.5 Flash • Análise estratégica baseada nos dados reais da API.</p>
                 </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-[40px] p-20 flex flex-col items-center justify-center border-2 border-slate-200 border-dashed text-center">
              <FileText className="w-16 h-16 text-slate-300 mb-6" />
              <h3 className="text-xl font-black text-slate-900 mb-2">Selecione um Relatório</h3>
              <p className="text-slate-500 text-sm max-w-xs font-medium">Use a lista lateral para navegar pelos registros históricos deste cliente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
