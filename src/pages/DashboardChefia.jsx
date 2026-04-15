import React, { useState } from 'react';
import { ClipboardCheck, CalendarDays } from 'lucide-react';

// Como este ficheiro está na mesma pasta (src/pages), importamos assim:
import PlantaoDiario from './PlantaoDiario'; 
import PlanejamentoDiario from './PlanejamentoDiario';

export default function DashboardChefia() {
  // Estado que controla qual aba aparece. Começa no 'plantao'
  const [abaAtiva, setAbaAtiva] = useState('plantao');

  return (
    <div className="flex flex-col h-full">
      {/* ── MENU DE ABAS ── */}
      <div className="bg-white border-b border-slate-200 mb-6 rounded-t-2xl px-6">
        <div className="flex gap-6">
          <button
            onClick={() => setAbaAtiva('plantao')}
            className={`flex items-center gap-2 py-4 px-2 border-b-2 font-bold text-sm transition-colors ${
              abaAtiva === 'plantao' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <ClipboardCheck size={18} />
            Plantão Diário
          </button>

          <button
            onClick={() => setAbaAtiva('planejamento')}
            className={`flex items-center gap-2 py-4 px-2 border-b-2 font-bold text-sm transition-colors ${
              abaAtiva === 'planejamento' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <CalendarDays size={18} />
            Planejamento Diário
          </button>
        </div>
      </div>

      {/* ── CONTEÚDO DA ABA SELECIONADA ── */}
      <div className="flex-1">
        {abaAtiva === 'plantao' && <PlantaoDiario />}
        {abaAtiva === 'planejamento' && <PlanejamentoDiario />}
      </div>
    </div>
  );
}