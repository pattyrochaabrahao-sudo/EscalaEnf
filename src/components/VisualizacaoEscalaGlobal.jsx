import React, { useState, useMemo, useEffect } from 'react';
import { Eye, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { supabase } from '../supabase';

const TURNOS_CORES = {
  'M':   'bg-sky-100 text-sky-800 border-sky-200',
  'T':   'bg-amber-100 text-amber-800 border-amber-200',
  'N':   'bg-violet-100 text-violet-800 border-violet-200',
  'F':   'bg-emerald-100 text-emerald-800 border-emerald-200',
  'FO':  'bg-rose-100 text-rose-800 border-rose-200',
  'DSR': 'bg-slate-100 text-slate-600 border-slate-200',
  'FE':  'bg-orange-100 text-orange-700 border-orange-200',
  'AT':  'bg-red-100 text-red-700 border-red-200',
  '':    'bg-white text-slate-300 border-slate-100',
};

function calcularCoberturaDiaria(colabs, escalas, diasMes) {
  const cobertura = {};
  for (let d = 1; d <= diasMes; d++) {
    cobertura[d] = { M: 0, T: 0, N: 0, total: 0 };
  }
  
  colabs.forEach(c => {
    const matricula = String(c.Matricula || c.matricula);
    const escalaColab = escalas[matricula] || {};
    Object.entries(escalaColab).forEach(([dia, turno]) => {
      const d = parseInt(dia);
      if (d >= 1 && d <= diasMes) {
        if (['M', 'T', 'N', 'D'].includes(turno)) {
          const t = turno === 'D' ? 'M' : turno; // Simplificação para o gráfico consolidado
          if (cobertura[d][t] !== undefined) cobertura[d][t]++;
          cobertura[d].total++;
        }
      }
    });
  });
  return cobertura;
}

function EscalaSetorReadOnly({ colaboradores, escalas, diasMes, diasSemana }) {
  const colabsLimitados = colaboradores.slice(0, 20);

  return (
    <div className="overflow-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="border-collapse text-xs min-w-max w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-2 min-w-[140px] text-left text-[10px] font-bold text-slate-500 uppercase sticky left-0 bg-slate-50 z-10 border-r border-slate-200">Colaborador</th>
            {Array.from({ length: diasMes }, (_, i) => {
              const d = i + 1;
              const ds = diasSemana[i];
              const fds = ds === 'Sáb' || ds === 'Dom';
              return (
                <th key={d} className={`p-1.5 text-center font-bold border-r border-slate-100 min-w-[38px] ${fds ? 'bg-slate-100' : ''}`}>
                  <div className={`text-[9px] ${fds ? 'text-rose-500' : 'text-slate-400'}`}>{ds}</div>
                  <div className="text-slate-700">{d}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {colabsLimitados.map(c => {
            const matricula = String(c.Matricula || c.matricula);
            const escala = escalas[matricula] || {};
            return (
              <tr key={matricula} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                <td className="p-2 sticky left-0 bg-white border-r border-slate-200 z-10">
                  <div className="font-bold text-slate-700 truncate max-w-[130px]">{c.Nome_Completo || c.nome}</div>
                  <div className="text-[9px] text-slate-400">{c.Categoria_Profissional || c.cargo} · {c.Unidade_Alocacao || c.setor}</div>
                </td>
                {Array.from({ length: diasMes }, (_, i) => {
                  const d = i + 1;
                  const turno = escala[d] || '';
                  return (
                    <td key={d} className="p-1 text-center border-r border-slate-50">
                      <span className={`inline-block w-7 h-5 rounded text-[9px] font-bold border leading-5 select-none cursor-default ${TURNOS_CORES[turno] || TURNOS_CORES['']}`}>
                        {turno || '·'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {colaboradores.length > 20 && (
            <tr>
              <td colSpan={diasMes + 1} className="p-3 text-center text-xs text-slate-400 italic border-t border-dashed border-slate-200">
                <Eye size={12} className="inline mr-1" />
                Exibindo 20 de {colaboradores.length} colaboradores. Selecione um setor específico para ver todos.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function VisaoConsolidada({ colaboradores, escalas, diasMes, diasSemana }) {
  const cobertura = useMemo(() => calcularCoberturaDiaria(colaboradores, escalas, diasMes), [colaboradores, escalas, diasMes]);
  const enfs = colaboradores.filter(c => (c.Categoria_Profissional || c.cargo || '').includes('Enferme'));
  const tecs = colaboradores.filter(c => !(c.Categoria_Profissional || c.cargo || '').includes('Enferme'));
  const cobEnf = useMemo(() => calcularCoberturaDiaria(enfs, escalas, diasMes), [enfs, escalas, diasMes]);
  const cobTec = useMemo(() => calcularCoberturaDiaria(tecs, escalas, diasMes), [tecs, escalas, diasMes]);

  return (
    <div className="overflow-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="border-collapse text-xs min-w-max w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-2 min-w-[130px] text-left text-[10px] font-bold text-slate-500 uppercase sticky left-0 bg-slate-50 z-10 border-r border-slate-200">Métrica</th>
            {Array.from({ length: diasMes }, (_, i) => {
              const d = i + 1;
              const ds = diasSemana[i];
              const fds = ds === 'Sáb' || ds === 'Dom';
              return (
                <th key={d} className={`p-1.5 text-center font-bold border-r border-slate-100 min-w-[38px] ${fds ? 'bg-slate-100' : ''}`}>
                  <div className={`text-[9px] ${fds ? 'text-rose-500' : 'text-slate-400'}`}>{ds}</div>
                  <div className="text-slate-700">{d}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {[
            { label: 'Total Geral', cob: cobertura,  colorClass: 'font-black text-slate-800', bg: 'bg-slate-50' },
            { label: '↳ Manhã (M)', cob: cobertura,  chave: 'M', colorClass: 'text-sky-700',    bg: '' },
            { label: '↳ Tarde (T)', cob: cobertura,  chave: 'T', colorClass: 'text-amber-700',   bg: '' },
            { label: '↳ Noite (N)', cob: cobertura,  chave: 'N', colorClass: 'text-violet-700',  bg: '' },
            { label: 'Enfermeiros', cob: cobEnf,     colorClass: 'font-bold text-indigo-700',   bg: 'bg-indigo-50/30' },
            { label: 'Técnicos',    cob: cobTec,     colorClass: 'font-bold text-sky-700',      bg: 'bg-sky-50/30' },
          ].map(({ label, cob, chave, colorClass, bg }) => (
            <tr key={label} className={`border-b border-slate-100 ${bg}`}>
              <td className={`p-2 sticky left-0 border-r border-slate-200 font-medium text-slate-600 text-[11px] ${bg || 'bg-white'}`}>{label}</td>
              {Array.from({ length: diasMes }, (_, i) => {
                const d = i + 1;
                const val = chave ? (cob[d]?.[chave] ?? 0) : (cob[d]?.total ?? 0);
                const low  = val < 4;
                return (
                  <td key={d} className={`p-1 text-center border-r border-slate-50`}>
                    <span className={`text-xs font-bold ${colorClass} ${!chave && low ? 'text-rose-600' : ''}`}>{val}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function VisualizacaoEscalaGlobal({ mesIdx, ano }) {
  const [setorSelecionado, setSetorSelecionado] = useState('');
  const [setores, setSetores] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [escalas, setEscalas] = useState({});
  const [loading, setLoading] = useState(true);

  const diasMes = new Date(ano, mesIdx, 0).getDate();
  const diasSemana = Array.from({ length: diasMes }, (_, i) => {
    const dia = new Date(ano, mesIdx - 1, i + 1).getDay();
    return ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][dia];
  });

  useEffect(() => {
    async function carregarDadosGlobais() {
      setLoading(true);
      try {
        const { data: sData } = await supabase.from('setores_unidades').select('*').eq('status', 'ATIVO');
        if (sData) setSetores(sData);

        const { data: cData } = await supabase.from('colaboradores').select('*');
        if (cData) {
          const formatted = cData.map(c => ({
            ...c,
            matricula: c.Matricula || c.matricula,
            nome: c.Nome_Completo || c.nome_completo,
            cargo: c.Categoria_Profissional || c.categoria_profissional,
            setor: c.Unidade_Alocacao || c.unidade_alocacao,
            status: c.Status_Atual || c.Status || c.status_atual || c.status
          })).filter(c => (c.status || '').toLowerCase().includes('ativo'));
          setColaboradores(formatted);
        }

        const mesAnoStr = `${ano}-${String(mesIdx).padStart(2, '0')}`;
        const { data: eData } = await supabase.from('escalas_mensais').select('*').eq('mes_ano', mesAnoStr);
        
        if (eData) {
          const mapEscalas = {};
          eData.forEach(item => {
            mapEscalas[String(item.matricula_colaborador || item.matricula)] = item.grid1 || item.dias_escala || {};
          });
          setEscalas(mapEscalas);
        }
      } catch (err) {
        console.error("Erro ao carregar dados globais da escala:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarDadosGlobais();
  }, [mesIdx, ano]);

  const colaboradoresFiltrados = useMemo(() => {
    if (!setorSelecionado) return colaboradores;
    return colaboradores.filter(c => (c.Unidade_Alocacao || c.setor) === setorSelecionado);
  }, [setorSelecionado, colaboradores]);

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Carregando dados da escala global...</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Setor a Visualizar</label>
          <select value={setorSelecionado} onChange={e => setSetorSelecionado(e.target.value)}
            className="bg-white border border-slate-300 p-2 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-300 min-w-[200px]">
            <option value="">📊 Visão Consolidada (Todos)</option>
            {setores.map(s => {
              const nome = s.nome_oficial || s.Nome_Oficial || s.nome_setor || s.nome;
              return <option key={nome} value={nome}>{nome}</option>;
            })}
          </select>
        </div>
        <div className="flex items-center gap-2 ml-auto text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <Eye size={13} className="text-amber-600" />
          <span className="font-bold text-amber-700">Modo Somente Leitura</span> — alterações devem ser feitas pela Liderança do setor
        </div>
      </div>

      {setorSelecionado
        ? <EscalaSetorReadOnly colaboradores={colaboradoresFiltrados} escalas={escalas} diasMes={diasMes} diasSemana={diasSemana} />
        : <VisaoConsolidada colaboradores={colaboradores} escalas={escalas} diasMes={diasMes} diasSemana={diasSemana} />
      }
    </div>
  );
}
