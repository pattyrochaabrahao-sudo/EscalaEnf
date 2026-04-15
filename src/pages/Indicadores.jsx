import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Activity, BarChart4 } from 'lucide-react';
import { supabase } from '../supabase';

export default function Indicadores() {
  const [totalColabs, setTotalColabs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const { count, error } = await supabase
          .from('colaboradores')
          .select('*', { count: 'exact', head: true })
          .ilike('status', '%Ativo%');
        
        if (!error && count !== null) setTotalColabs(count);
      } catch (e) {
        console.error("Erro ao carregar indicadores:", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="text-indigo-600"/> Indicadores Gerenciais de RH</h2>
        <p className="text-sm font-medium text-slate-500">Métricas consolidadas de desempenho, ausências e remanejamentos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
          <div className="bg-blue-50 text-blue-600 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"><Users size={24}/></div>
          <p className="text-gray-500 text-sm font-medium">Total Colaboradores</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{loading ? '...' : totalColabs}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
          <div className="bg-rose-50 text-rose-600 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"><Activity size={24}/></div>
          <p className="text-gray-500 text-sm font-medium">Taxa de Absenteísmo (Mês)</p><p className="text-3xl font-bold text-gray-800 mt-2 text-rose-600">0.0%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
          <div className="bg-orange-50 text-orange-600 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"><TrendingUp size={24}/></div>
          <p className="text-gray-500 text-sm font-medium">Tx. de Remanejamento</p><p className="text-3xl font-bold text-gray-800 mt-2 text-orange-600">0.0%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
          <div className="bg-emerald-50 text-emerald-600 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"><BarChart4 size={24}/></div>
          <p className="text-gray-500 text-sm font-medium">Conformidade das Escalas</p><p className="text-3xl font-bold text-gray-800 mt-2 text-emerald-600">0%</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center h-[300px]">
         <BarChart4 size={48} className="text-indigo-200 mb-4" />
         <h3 className="font-bold text-slate-700 text-lg">Dados em Processamento</h3>
         <p className="text-slate-500 mt-2 max-w-md">Os indicadores avançados serão calculados automaticamente à medida que as escalas forem preenchidas no sistema real.</p>
      </div>

    </div>
  );
}

