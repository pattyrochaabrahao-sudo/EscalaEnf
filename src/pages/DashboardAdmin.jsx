import React, { useState, useMemo, useEffect } from 'react';
import {
  Users, Building2, TrendingUp, HeartHandshake,
  BarChart2, Clock, UserCheck, UserMinus, Activity,
  ShieldCheck, Filter, ArrowDownUp, ChevronLeft, ChevronRight,
  TrendingDown, ArrowRightLeft, AlertTriangle, Info, CheckCircle2,
  FileText, Table, CalendarDays, Settings, User as UserIcon
} from 'lucide-react';
import { supabase } from '../supabase';
import VisualizacaoEscalaGlobal from '../components/VisualizacaoEscalaGlobal';
import MeuPainel from './MeuPainel';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// ────────────────────────────────────────────────────────────────────────────
// Utilitários de visualização
// ────────────────────────────────────────────────────────────────────────────
function BarraHorizontal({ label, value, maxValue, colorClass }) {
  const pct = Math.round((value / Math.max(maxValue, 1)) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
        <span>{label}</span>
        <span className="font-black text-slate-800">{value}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5">
        <div className={`${colorClass} h-2.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function GraficoRosca({ dados }) {
  const total = dados.reduce((s, d) => s + d.total, 0);
  if (total === 0) return <div className="text-center p-4 text-slate-400 text-xs italic">Nenhum dado disponível</div>;
  
  let cum = 0;
  const r = 60, circ = 2 * Math.PI * r, sz = 160, cx = sz / 2, cy = sz / 2;
  const fatias = dados.map(d => {
    const pct = d.total / total;
    const offset = circ * (1 - cum);
    const da = circ * pct;
    cum += pct;
    return { ...d, pct, offset, da };
  });
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg width={sz} height={sz} className="flex-shrink-0 text-slate-100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="24" />
        {fatias.map((f, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={f.color} strokeWidth="24"
            strokeDasharray={`${f.da} ${circ - f.da}`} strokeDashoffset={f.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
        ))}
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#475569" fontSize="11" fontWeight="500">Total</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#1e293b" fontSize="18" fontWeight="800">{total}</text>
      </svg>
      <div className="flex flex-col gap-2 flex-1">
        {fatias.map((f, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${f.bg}`} />
              <span className="text-xs font-medium text-slate-600">{f.label}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-black text-slate-800">{f.total}</span>
              <span className="text-slate-400">({Math.round(f.pct * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GraficoBarrasAgrupadas({ dados }) {
  if (!dados || dados.length === 0) return <div className="text-center p-10 text-slate-400 text-xs italic">Aguardando dados institucionais...</div>;
  
  const maxVal = Math.max(...dados.flatMap(d => [d.admissoes, d.demissoes]), 1);
  const H = 160, BAR_W = 10, GAP = 4, GROUP_W = BAR_W * 2 + GAP + 12;
  const totalW = dados.length * GROUP_W + 20;

  return (
    <div className="overflow-x-auto pb-2">
      <svg width={totalW} height={H + 30} className="min-w-full">
        {[0,25,50,75,100].map(pct => {
          const y = H - (H * pct / 100);
          return <line key={pct} x1="10" x2={totalW} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />;
        })}
        {dados.map((d, i) => {
          const x = 10 + i * GROUP_W;
          const hAdm = (d.admissoes / maxVal) * H;
          const hDem = (d.demissoes / maxVal) * H;
          return (
            <g key={i}>
              <rect x={x} y={H - hAdm} width={BAR_W} height={hAdm} rx="2" fill="#6366f1" opacity="0.85" />
              {d.admissoes > 0 && <text x={x + BAR_W / 2} y={H - hAdm - 3} textAnchor="middle" fontSize="8" fill="#6366f1" fontWeight="700">{d.admissoes}</text>}
              <rect x={x + BAR_W + GAP} y={H - hDem} width={BAR_W} height={hDem} rx="2" fill="#f43f5e" opacity="0.85" />
              {d.demissoes > 0 && <text x={x + BAR_W + GAP + BAR_W / 2} y={H - hDem - 3} textAnchor="middle" fontSize="8" fill="#f43f5e" fontWeight="700">{d.demissoes}</text>}
              <text x={x + BAR_W + GAP / 2} y={H + 14} textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="600">{d.mes}</text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-5 mt-2 text-[10px] font-bold text-slate-600 uppercase">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> Admissões</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-rose-400 inline-block" /> Demissões</span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Barra de Filtros Global
// ────────────────────────────────────────────────────────────────────────────
function BarraFiltros({ filtros, setFiltros, setores }) {
  const anos = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-end gap-4 shadow-sm">
      <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mr-2">
        <Filter size={15} /> Filtros
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mês</label>
        <select value={filtros.mes} onChange={e => setFiltros(f => ({...f, mes: e.target.value}))}
          className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Todos</option>
          {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ano</label>
        <select value={filtros.ano} onChange={e => setFiltros(f => ({...f, ano: e.target.value}))}
          className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-300">
          {anos.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Setor</label>
        <select value={filtros.setor} onChange={e => setFiltros(f => ({...f, setor: e.target.value}))}
          className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-300 min-w-[160px]">
          <option value="">Global</option>
          {setores.map(s => {
            const nome = s.nome_oficial || s.Nome_Oficial || s.nome_setor || s.nome;
            return <option key={nome} value={nome}>{nome}</option>;
          })}
        </select>
      </div>
      {(filtros.mes || filtros.setor) && (
        <button onClick={() => setFiltros(f => ({...f, mes:'', setor:''}))}
          className="ml-auto text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-2 rounded-xl transition-all">
          Limpar
        </button>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Aba 1: Visão Estratégica
// ────────────────────────────────────────────────────────────────────────────
function VisaoEstrategica({ colaboradores, filtros }) {
  const colabsFiltrados = useMemo(() => {
    let list = colaboradores;
    if (filtros.setor) list = list.filter(c => (c.Unidade_Alocacao || c.setor) === filtros.setor);
    return list;
  }, [colaboradores, filtros.setor]);

  const totalColabs = colabsFiltrados.length;
  const afastados = colabsFiltrados.filter(c => {
    const motivo = c.motivo_afastamento || c.motivoAfastamento;
    return motivo && motivo !== '';
  }).length;
  const enfermeiros = colabsFiltrados.filter(c => (c.Categoria_Profissional || c.cargo || '').includes('Enferme')).length;
  const tecnicos = colabsFiltrados.filter(c => (c.Categoria_Profissional || c.cargo || '').includes('Técnico')).length;

  const kpis = [
    { label: 'Efetivo Total', value: totalColabs, icon: Users, color: 'indigo' },
    { label: 'Em Afastamento', value: afastados, icon: UserMinus, color: 'rose' },
    { label: 'Enf. / Tec.', value: `${enfermeiros}/${tecnicos}`, icon: UserCheck, color: 'teal' },
    { label: 'Taxa Turnover', value: '0.0%', icon: ArrowRightLeft, color: 'sky' },
  ];

  const colorMap = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-200',
    teal: 'text-teal-600 bg-teal-50 border-teal-200',
    sky: 'text-sky-600 bg-sky-50 border-sky-200',
  };

  const categoriaData = [
    { label: 'Enfermeiro(a)', total: enfermeiros,  color: '#6366f1', bg: 'bg-indigo-500' },
    { label: 'Técnico(a)',    total: tecnicos, color: '#0ea5e9', bg: 'bg-sky-500'    },
    { label: 'Outros',        total: totalColabs - enfermeiros - tecnicos,  color: '#a855f7', bg: 'bg-purple-500' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl border ${colorMap[k.color]}`}><Icon size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{k.label}</p>
                <p className="text-2xl font-black text-slate-800 leading-tight">{k.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-700 text-sm mb-4 border-b pb-2 flex items-center gap-2">
            <BarChart2 size={16} className="text-indigo-600"/> Pirâmide Etária
          </h3>
          <div className="text-center p-4 text-slate-400 text-xs italic">Aguardando dados demográficos...</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-700 text-sm mb-4 border-b pb-2 flex items-center gap-2">
            <Clock size={16} className="text-teal-600"/> Tempo de Casa
          </h3>
          <div className="text-center p-4 text-slate-400 text-xs italic">Aguardando dados contratuais...</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-700 text-sm mb-4 border-b pb-2 flex items-center gap-2">
            <HeartHandshake size={16} className="text-sky-600"/> Categoria Profissional
          </h3>
          <GraficoRosca dados={categoriaData} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <h3 className="font-bold text-slate-700 text-sm mb-1 flex items-center gap-2">
          <TrendingUp size={16} className="text-indigo-600"/> Evolução de Movimentações
        </h3>
        <p className="text-[11px] text-slate-400 mb-4 uppercase font-bold tracking-wider">Histórico de 12 meses — Geral da Instituição</p>
        <GraficoBarrasAgrupadas dados={[]} />
      </div>
    </div>
  );
}

function AuditoriaEscalas() {
  const now = new Date();
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" /> Torre de Controle de Auditoria
          </h3>
        </div>
        <div className="text-center p-10 text-slate-400 text-xs italic">Nenhum alerta crítico detectado no momento.</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <h3 className="font-bold text-slate-700 text-sm mb-4 border-b pb-3 flex items-center gap-2">
          <CalendarDays size={16} className="text-indigo-600" /> Grade de Escala Institucional (Audit)
        </h3>
        <VisualizacaoEscalaGlobal mesIdx={now.getMonth() + 1} ano={now.getFullYear()} />
      </div>
    </div>
  );
}

function ConfiguracoesDimensionamento({ setores }) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <Building2 size={16} className="text-indigo-600" /> Configuração de Leitos por Setor
            </h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="text-slate-500 font-bold uppercase text-[9px] border-b">
                <tr>
                  <th className="py-2 px-1">Setor</th>
                  <th className="py-2 px-1 text-center">Capacidade</th>
                  <th className="py-2 px-1 text-center font-bold text-emerald-600">Ativos</th>
                  <th className="py-2 px-1 text-center font-bold text-rose-500">Bloqueados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {setores.map((s, index) => {
                   const nome = s.nome_oficial || s.Nome_Oficial || s.nome_setor || s.nome;
                   return (
                    <tr key={nome + index} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-1 font-bold text-slate-700">{nome}</td>
                      <td className="py-2.5 px-1 text-center font-black text-slate-400">{s.Leitos_Operacionais || s.leitos_operacionais || 0}</td>
                      <td className="py-2.5 px-1 text-center text-emerald-700 font-bold">
                        <input type="number" defaultValue={s.Leitos_Operacionais || s.leitos_operacionais || 0} className="w-10 text-center bg-emerald-50 border border-emerald-100 rounded p-1 outline-none focus:ring-1 focus:ring-emerald-400" />
                      </td>
                      <td className="py-2.5 px-1 text-center text-rose-700 font-bold">
                        <input type="number" defaultValue={0} className="w-10 text-center bg-rose-50 border border-rose-100 rounded p-1 outline-none focus:ring-1 focus:ring-rose-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col h-full">
           <div className="flex items-center justify-between mb-4 border-b pb-3">
            <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" /> Quadro Mínimo de Profissionais
            </h3>
          </div>
          <div className="text-center p-10 text-slate-400 text-xs italic">Aguardando parametrização de quadro mínimo...</div>
        </div>
      </div>
    </div>
  );
}

const anoAtual = new Date().getFullYear();

const ABAS = [
  { id: 'estrategica',      label: 'Visão Estratégica',      icon: BarChart2     },
  { id: 'auditoria',        label: 'Auditoria de Escalas',    icon: Activity      },
  { id: 'dimensionamento',  label: 'Config. Dimensionamento', icon: Settings      },
  { id: 'meu_painel',       label: 'Meu Painel',             icon: UserIcon      },
];

export default function DashboardAdmin() {
  const [abaAtiva, setAbaAtiva] = useState('estrategica');
  const [filtros, setFiltros] = useState({ mes: '', ano: anoAtual, setor: '' });
  const [colaboradores, setColaboradores] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const { data: cData } = await supabase.from('colaboradores').select('*').ilike('Status', '%Ativo%');
        if (cData) setColaboradores(cData);
        
        const { data: sData } = await supabase.from('setores_unidades').select('*').eq('status', 'ATIVO');
        if (sData) setSetores(sData);
      } catch (err) {
        console.error("Erro no Dashboard Admin:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Carregando painel administrativo...</div>;

  return (
    <div className="flex flex-col gap-4 max-w-[1600px] mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" size={26} />
              Painel Responsável Técnica
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Gestão Estratégica e Auditoria Institucional</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 pt-3 border-t border-slate-100">
          {ABAS.map(aba => {
            const Icon = aba.icon;
            const ativo = abaAtiva === aba.id;
            return (
              <button key={aba.id} onClick={() => setAbaAtiva(aba.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  ativo ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}>
                <Icon size={16} />
                {aba.label}
              </button>
            );
          })}
        </div>
      </div>

      {abaAtiva === 'estrategica' && <BarraFiltros filtros={filtros} setFiltros={setFiltros} setores={setores} />}

      <div className="min-h-[500px]">
        {abaAtiva === 'estrategica'     && <VisaoEstrategica colaboradores={colaboradores} filtros={filtros} />}
        {abaAtiva === 'auditoria'       && <AuditoriaEscalas />}
        {abaAtiva === 'dimensionamento' && <ConfiguracoesDimensionamento setores={setores} />}
        {abaAtiva === 'meu_painel'      && <MeuPainel />}
      </div>
    </div>
  );
}
