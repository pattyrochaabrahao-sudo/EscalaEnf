import React, { useState, useEffect, Fragment } from "react";
import {
  CalendarDays, UserMinus, Building, UserPlus, ArrowRightLeft,
  ChevronLeft, ChevronRight, Edit2, Save, AlertTriangle, Trash2, X, Plus, ThumbsUp, ThumbsDown, Search, TrendingUp,
  Home, Clock, Calendar, Users, Eye, ShieldCheck, Ruler, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import RelatorioGerencial from '../components/RelatorioGerencial';
import { supabase } from '../supabase';

// ── Mínimo de cobertura por turno / dia (mock configurável) ──────────────────
const MINIMO_DIA = 4;

// ── Definição completa de códigos ─────────────────────────────────────────────
const TIPOS_PLANTAO = [
  { code: 'D',   hours: 12, label: 'Diurno (12h)',   color: 'bg-indigo-100 text-indigo-800',   row: 1 },
  { code: 'N',   hours: 12, label: 'Noturno (12h)',  color: 'bg-sky-100 text-sky-800',         row: 1 },
  { code: 'M',   hours: 6,  label: 'Manhã (6h)',     color: 'bg-blue-50 text-blue-700',        row: 1 },
  { code: 'T',   hours: 6,  label: 'Tarde (6h)',     color: 'bg-cyan-50 text-cyan-700',        row: 1 },
  { code: 'F',   hours: 0,  label: 'Folga',          color: 'bg-emerald-50 text-emerald-600',  row: 1 },
  { code: 'DSR', hours: 0,  label: 'DSR',            color: 'bg-emerald-100 text-emerald-700', row: 1 },
  { code: '-',   hours: 0,  label: 'Descanso', color: 'bg-slate-100 text-slate-500',      row: 1 },
  { code: 'PRD', hours: 0,  label: 'PR Diurno',            color: 'bg-indigo-200 text-indigo-900',    row: 2 },
  { code: 'PRN', hours: 0,  label: 'PR Noturno',            color: 'bg-sky-200 text-sky-900',         row: 2 },
  { code: 'FE',  hours: 0,  label: 'Férias',         color: 'bg-amber-100 text-amber-700',      row: 0 },
  { code: 'Att', hours: 0,  label: 'Atestado',       color: 'bg-rose-100 text-rose-700',        row: 0 },
  { code: 'Lic', hours: 0,  label: 'Licença',        color: 'bg-purple-100 text-purple-700',    row: 0 },
  { code: 'TR-F',hours: 0,  label: 'Troca/Folga',    color: 'bg-pink-100 text-pink-800',        row: 0 },
  { code: 'TR-E',hours: 0,  label: 'Troca/Extra',    color: 'bg-teal-100 text-teal-800',        row: 2 },
  { code: '',    hours: 0,  label: 'Apagar',         color: 'bg-white text-slate-400 border border-slate-300', row: 'all' },
];

const TIPOS_L1 = TIPOS_PLANTAO.filter(t => t.row === 1 || t.row === 'all');
const TIPOS_L2 = TIPOS_PLANTAO.filter(t => t.row === 2 || t.row === 'all');

function shiftColor(code) {
  return TIPOS_PLANTAO.find(t => t.code === code)?.color || 'bg-white text-slate-300';
}

// ─────────────────────────────────────────────────────────────────────────────
// FazerEscala (Double-row, coverage totals, alerts)
// ─────────────────────────────────────────────────────────────────────────────
function FazerEscala({ colaboradores, setColaboradores, escalaNominal, setEscalaNominal, ausencias, unidadeLogada }) {
  const { user, pedidosFolga, setPedidosFolga } = useAuth();
  const nomeMeses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const dataAtual = new Date();
  const mesAtual  = dataAtual.getMonth();
  const anoAtual  = dataAtual.getFullYear();
  const nomesTurnos = { 'M': 'Manhã', 'T': 'Tarde', 'N': 'Noturno', 'D': 'Diurno 12h', 'SN': 'Plantão Noturno' };

  const [mesSelecionado,     setMesSelecionado]     = useState(mesAtual);
  const [anoSelecionado,     setAnoSelecionado]     = useState(anoAtual);
  const [filtroTurnoEscala,  setFiltroTurnoEscala]  = useState("Todos");
  const [filtroCategoria,    setFiltroCategoria]    = useState("Todas");
  const [ferramentaL1,       setFerramentaL1]       = useState('D');
  const [ferramentaL2,       setFerramentaL2]       = useState('PRD');
  const [showSaveModal,      setShowSaveModal]      = useState(false);
  const [saveConformity,     setSaveConformity]     = useState(true);
  const [inconformes,        setInconformes]        = useState([]);
  const [ultimaAlteracaoEscala, setUltimaAlteracaoEscala] = useState(localStorage.getItem('ultimaAlteracaoEscala') || null);
  const [historicoEscalas,   setHistoricoEscalas]   = useState(() => JSON.parse(localStorage.getItem('historicoEscalas')) || []);
  const [modalTroca,         setModalTroca]         = useState(false);
  const [trocaForm,          setTrocaForm]          = useState({ matricula: '', diaOrigem: '', diaDestino: '', motivo: '' });
  const [modalFerias,        setModalFerias]        = useState(false);
  const [feriasForm,         setFeriasForm]         = useState({ matricula: '', dataInicio: '', dias: '' });
  const [chConfig, setChConfig] = useState(() => JSON.parse(localStorage.getItem('chConfig')) || { HC30_PAR: 144, HC30_IMPAR: 132, HC35_PAR: 168, HC35_IMPAR: 168, HC40_PAR: 192, HC40_IMPAR: 192, FFM40_PAR: 192, FFM40_IMPAR: 192 });
  const [regraMesGlob, setRegraMesGlob] = useState("PAR");
  const [showChPanel, setShowChPanel] = useState(false);
  const [folgaActionModal, setFolgaActionModal] = useState(null);
  const [modalLimparEscala, setModalLimparEscala] = useState(false);
  const [matriculaLimpar, setMatriculaLimpar] = useState("");

  const diasNoMes = new Date(anoSelecionado, mesSelecionado + 1, 0).getDate();
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);
  const dow = d => new Date(anoSelecionado, mesSelecionado, d).getDay();
  const dowAbrev = ["D","S","T","Q","Q","S","S"];
  const [versaoTabela, setVersaoTabela] = useState(0);
  // Linha 1: base schedule  |  Linha 2: extras / absences
  const [gridL1, setGridL1] = useState({});
  const [gridL2, setGridL2] = useState({});

  // Load grids from Supabase when month/year/sector changes
  useEffect(() => {
    if (!unidadeLogada) return;
    const mes_ano = `${anoSelecionado}-${String(mesSelecionado + 1).padStart(2, '0')}`;
    async function carregarEscala() {
      try {
        const { data, error } = await supabase
          .from('escalas_mensais')
          .select('*')
          .eq('mes_ano', mes_ano)
          .eq('setor', unidadeLogada);

        if (error) { console.error('Erro ao carregar escala:', error); return; }
        if (data && data.length > 0) {
          const novoGridL1 = {};
          const novoGridL2 = {};
          data.forEach(row => {
            const key = String(row.matricula_colaborador || row.matricula);
            novoGridL1[key] = row.grid1 || row.dias_escala || {};
            novoGridL2[key] = row.grid2 || {};
          });
          setGridL1(novoGridL1);
          setGridL2(novoGridL2);
        } else {
          setGridL1({});
          setGridL2({});
        }
      } catch (err) {
        console.error('Exceção ao carregar escala:', err);
      }
    }
    carregarEscala();
  }, [mesSelecionado, anoSelecionado, unidadeLogada]);

  const historicoFiltrado = historicoEscalas.filter(h => h.mes === mesSelecionado && h.ano === anoSelecionado && h.setor === unidadeLogada);
  const escalaOficial = historicoFiltrado.length > 0 ? historicoFiltrado[historicoFiltrado.length - 1] : null;

  // L2 Auto Injection for Afastamentos
  useEffect(() => {
    setGridL2(prev => {
      let changed = false;
      const novagrid = { ...prev };
      
      colaboradores.forEach(c => {
        const mat = String(c.matricula);
        if (c.motivoAfastamento && c.dataInicioAfastamento) {
          if (!novagrid[mat]) novagrid[mat] = {};
          
          const [y, m, day] = c.dataInicioAfastamento.split('-');
          const parseIntY = parseInt(y, 10), parseIntM = parseInt(m, 10), parseIntD = parseInt(day, 10);
          const code = c.motivoAfastamento.split('-')[0];
          const qtdDias = parseInt(c.quantidadeDiasAfastamento, 10) || 1;

          const inicioAfast = new Date(parseIntY, parseIntM - 1, parseIntD);
          const fimAfast = new Date(parseIntY, parseIntM - 1, parseIntD + qtdDias - 1);

          dias.forEach(d => {
            const diaAtual = new Date(anoSelecionado, mesSelecionado, d);
            if (diaAtual >= inicioAfast && diaAtual <= fimAfast) {
              if (novagrid[mat][d] !== code) {
                novagrid[mat][d] = code;
                changed = true;
              }
            }
          });
        }
      });
      return changed ? novagrid : prev;
    });
  }, [colaboradores, mesSelecionado, anoSelecionado, diasNoMes]);

  let colabsFiltrados = colaboradores; 

  if (filtroTurnoEscala !== "Todos") {
    colabsFiltrados = colabsFiltrados.filter(c => {
      const t = (c.turno_padrao || '').toUpperCase();
      if (filtroTurnoEscala === "Manhã"   && (t === "M" || t === "D")) return true;
      if (filtroTurnoEscala === "Tarde"   && (t === "T" || t === "D")) return true;
      if (filtroTurnoEscala === "Noturno" && (t === "N" || t === "SN")) return true;
      return false;
    });
  }

  if (filtroCategoria !== "Todas") {
    colabsFiltrados = colabsFiltrados.filter(c => {
      const cat = c.categoria_profissional || c.cargo || '';
      return cat === filtroCategoria;
    });
  }
  colabsFiltrados.sort((a, b) => {
    const cargoA = a.categoria_profissional || a.cargo || '';
    const cargoB = b.categoria_profissional || b.cargo || '';
    const eA = cargoA.includes("Enferm"), eB = cargoB.includes("Enferm");
    if (eA && !eB) return -1; if (!eA && eB) return 1;
    const nomeA = a.nome_completo || a.nome || '';
    const nomeB = b.nome_completo || b.nome || '';
    return nomeA.localeCompare(nomeB);
  });

  function isDateInLeave(d, m, y, startDateStr, days) {
    if (!startDateStr || !days) return false;
    const [sY, sM, sD] = startDateStr.split('-').map(Number);
    const start = new Date(sY, sM - 1, sD);
    const current = new Date(y, m, d);
    const end = new Date(sY, sM - 1, sD);
    end.setDate(end.getDate() + parseInt(days) - 1);
    return current >= start && current <= end;
  }

  // ── Cell click handlers ──────────────────────────────────────────────────
  function handleCellL1(colab, dia) {
    const matricula = String(colab.matricula);
    setGridL1(prev => {
      const ng = { ...prev }; 
      const colabGrid = { ...(ng[matricula] || {}) };
      
      const hasAny = Object.values(colabGrid).some(v => v !== null && v !== undefined && v !== '');
      colabGrid[dia] = ferramentaL1;

      if (!hasAny && ferramentaL1 && !['F','-','DSR',''].includes(ferramentaL1)) {
         const is12 = ferramentaL1 === 'D' || ferramentaL1 === 'N';
         dias.forEach(d => {
            if (d === dia) return;
            if (is12) {
               colabGrid[d] = (Math.abs(d - dia) % 2 === 0) ? ferramentaL1 : '-';
            } else {
               colabGrid[d] = (dow(d) === 0 || dow(d) === 6) ? 'F' : ferramentaL1;
            }
         });
      }
      
      ng[matricula] = colabGrid;
      return ng;
    });
  }

  function handleCellL2(colab, dia) {
    const matricula = String(colab.matricula);
    setGridL2(prev => {
      const ng = { ...prev };
      const colabGrid = { ...(ng[matricula] || {}) };
      colabGrid[dia] = ferramentaL2;
      ng[matricula] = colabGrid;
      return ng;
    });
  }

  // ── Stats calculation ────────────────────────────────────────────────────
  function getHours(code) {
    return TIPOS_PLANTAO.find(t => t.code === code)?.hours || 0;
  }

  function calcCH(matricula) {
    const m = String(matricula);
    const g1 = gridL1[m] || {};
    const g2 = gridL2[m] || {};
    let total = 0;
    dias.forEach(d => {
      const c1 = g1[d] || '';
      const c2 = g2[d] || '';
      if (c2 && c2 !== 'TR-E') {
        total += getHours(c2);
      } else {
        total += getHours(c1);
      }
      if (c2 === 'TR-E') total += 12; 
    });
    return total;
  }

  async function handleSave() {
    if (!unidadeLogada) return;
    const mes_ano = `${anoSelecionado}-${String(mesSelecionado + 1).padStart(2, '0')}`;
    
    try {
      const upserts = Object.keys(gridL1).map(mat => ({
        matricula_colaborador: mat,
        mes_ano,
        setor: unidadeLogada,
        grid1: gridL1[mat],
        grid2: gridL2[mat],
        updated_at: new Date()
      }));

      const { error } = await supabase.from('escalas_mensais').upsert(upserts, { onConflict: 'matricula_colaborador, mes_ano, setor' });
      if (error) throw error;

      const now = new Date().toLocaleString();
      localStorage.setItem('ultimaAlteracaoEscala', now);
      setUltimaAlteracaoEscala(now);
      
      const novoHistorico = [...historicoEscalas, { data: now, user: user.nome, mes: mesSelecionado, ano: anoSelecionado, setor: unidadeLogada }];
      setHistoricoEscalas(novoHistorico);
      localStorage.setItem('historicoEscalas', JSON.stringify(novoHistorico));

      alert("Escala salva com sucesso no Supabase!");
    } catch (err) {
      console.error("Erro ao salvar escala:", err);
      alert("Erro ao salvar escala. Verifique o console.");
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-in">
       <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><CalendarDays size={24}/></div>
             <div>
                <h2 className="text-xl font-bold text-slate-800">Fazer Escala Nominal</h2>
                <p className="text-xs text-slate-400 font-medium">Gestão mensal de turnos e coberturas</p>
             </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
             <button onClick={() => { if(mesSelecionado === 0){ setMesSelecionado(11); setAnoSelecionado(anoSelecionado-1); } else { setMesSelecionado(mesSelecionado-1); }}} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"><ChevronLeft size={18}/></button>
             <span className="px-4 font-bold text-slate-700 min-w-[140px] text-center">{nomeMeses[mesSelecionado]} {anoSelecionado}</span>
             <button onClick={() => { if(mesSelecionado === 11){ setMesSelecionado(0); setAnoSelecionado(anoSelecionado+1); } else { setMesSelecionado(mesSelecionado+1); }}} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"><ChevronRight size={18}/></button>
          </div>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex flex-col gap-1.5">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ferramenta L1 (Base)</label>
             <div className="flex flex-wrap gap-1">
                {TIPOS_L1.map(t => (
                   <button key={t.code} onClick={() => setFerramentaL1(t.code)} 
                     className={`h-8 px-2.5 rounded-lg text-[11px] font-bold transition-all border ${ferramentaL1 === t.code ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}>
                     {t.code || 'Apagar'}
                   </button>
                ))}
             </div>
          </div>
          <div className="flex flex-col gap-1.5">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ferramenta L2 (Extras/Afast.)</label>
             <div className="flex flex-wrap gap-1">
                {TIPOS_L2.map(t => (
                   <button key={t.code} onClick={() => setFerramentaL2(t.code)} 
                     className={`h-8 px-2.5 rounded-lg text-[11px] font-bold transition-all border ${ferramentaL2 === t.code ? 'border-rose-600 bg-rose-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-rose-300'}`}>
                     {t.code || 'Apagar'}
                   </button>
                ))}
             </div>
          </div>
          <div className="flex flex-col gap-1.5">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtros de Exibição</label>
             <div className="flex gap-2">
                <select className="flex-1 h-9 bg-white border border-slate-200 rounded-lg text-xs font-bold px-2 outline-none focus:ring-2 focus:ring-indigo-400" value={filtroTurnoEscala} onChange={e => setFiltroTurnoEscala(e.target.value)}>
                   <option>Todos</option><option>Manhã</option><option>Tarde</option><option>Noturno</option>
                </select>
                <select className="flex-1 h-9 bg-white border border-slate-200 rounded-lg text-xs font-bold px-2 outline-none focus:ring-2 focus:ring-indigo-400" value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
                   <option>Todas</option>
                   {Array.from(new Set(colaboradores.map(c => c.categoria_profissional || c.cargo))).filter(Boolean).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
             </div>
          </div>
          <div className="flex items-end justify-end gap-2">
             <button onClick={handleSave} className="h-10 px-6 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"><Save size={16}/> Salvar no Supabase</button>
          </div>
       </div>

       <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-inner bg-slate-100 p-1">
          <table className="w-full border-collapse bg-white rounded-xl overflow-hidden">
             <thead>
                <tr className="bg-slate-800 text-white">
                   <th className="p-3 text-left min-w-[200px] sticky left-0 bg-slate-800 z-10 border-r border-slate-700">Colaborador / Cargo</th>
                   <th className="p-2 text-center text-[10px] border-r border-slate-700">CH</th>
                   {dias.map(d => (
                      <th key={d} className={`p-1 text-center min-w-[32px] border-r border-slate-700 ${dow(d) === 0 || dow(d) === 6 ? 'bg-slate-700' : ''}`}>
                         <div className="text-[9px] opacity-60 uppercase">{dowAbrev[dow(d)]}</div>
                         <div className="text-xs font-bold">{d}</div>
                      </th>
                   ))}
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {colabsFiltrados.map(c => {
                   const mat = String(c.matricula);
                   const ch = calcCH(mat);
                   return (
                      <Fragment key={mat}>
                         <tr className="group hover:bg-slate-50 transition-colors">
                            <td className="p-3 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                               <div className="font-bold text-slate-800 text-xs truncate">{c.nome_completo || c.nome}</div>
                               <div className="text-[10px] text-slate-400 font-medium">{c.categoria_profissional || c.cargo}</div>
                            </td>
                            <td className="p-2 text-center border-r border-slate-100">
                               <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ch > 180 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{ch}h</span>
                            </td>
                            {dias.map(d => {
                               const code1 = gridL1[mat]?.[d] || '';
                               const code2 = gridL2[mat]?.[d] || '';
                               return (
                                  <td key={d} className={`p-0.5 border-r border-slate-100 text-center align-middle ${dow(d) === 0 || dow(d) === 6 ? 'bg-slate-50/50' : ''}`}>
                                     <div className="flex flex-col gap-0.5">
                                        <button onClick={() => handleCellL1(c, d)} className={`h-5 w-full rounded text-[9px] font-bold transition-all ${shiftColor(code1)} hover:scale-110 hover:z-20`}>{code1}</button>
                                        <button onClick={() => handleCellL2(c, d)} className={`h-5 w-full rounded text-[9px] font-bold transition-all ${shiftColor(code2)} border border-dashed border-slate-200 hover:scale-110 hover:z-20`}>{code2}</button>
                                     </div>
                                  </td>
                               );
                            })}
                         </tr>
                      </Fragment>
                   );
                })}
             </tbody>
          </table>
       </div>
    </div>
  );
}

// ── Outras páginas (Mocks para estrutura) ───────────────────────────────────
function PlanejamentoQuantPage() { return <div className="p-10 text-center bg-white rounded-2xl border border-slate-200"><CalendarDays className="mx-auto text-slate-300 mb-4" size={48}/><h2 className="text-xl font-bold text-slate-800">Planejamento Mensal</h2><p className="text-slate-500">Visualização consolidada da escala do mês.</p></div>; }
function AusenciasPage() { return <div className="p-10 text-center bg-white rounded-2xl border border-slate-200"><UserMinus className="mx-auto text-slate-300 mb-4" size={48}/><h2 className="text-xl font-bold text-slate-800">Gestão de Ausências</h2><p className="text-slate-500">Registro de faltas, atestados e suspensões.</p></div>; }
function SetoresConfigPage() { return <div className="p-10 text-center bg-white rounded-2xl border border-slate-200"><Building className="mx-auto text-slate-300 mb-4" size={48}/><h2 className="text-xl font-bold text-slate-800">Configuração de Setores</h2><p className="text-slate-500">Gestão de unidades e metas de cobertura.</p></div>; }
function GestaoColabPage() { return <div className="p-10 text-center bg-white rounded-2xl border border-slate-200"><Users className="mx-auto text-slate-300 mb-4" size={48}/><h2 className="text-xl font-bold text-slate-800">Gestão de Colaboradores</h2><p className="text-slate-500">Cadastro e movimentação de pessoal do RH.</p></div>; }
function RemanejamentoTab() { return <div className="p-10 text-center bg-white rounded-2xl border border-slate-200"><ArrowRightLeft className="mx-auto text-slate-300 mb-4" size={48}/><h2 className="text-xl font-bold text-slate-800">Remanejamento</h2><p className="text-slate-500">Trocas de setor e coberturas temporárias.</p></div>; }

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────
export default function Planejamento() {
  const { user, filtroGlobalSetor } = useAuth();
  const unidadeLogada = user?.unidadeLogada || "";
  
  // Normalização agressiva dos perfis do usuário
  const userRoles = [user?.role, user?.perfil_secundario]
    .filter(Boolean)
    .map(r => String(r).trim().toLowerCase());

  const perfisGlobais = ['Diretor', 'Supervisão', 'Supervisão Plantonista', 'Secretaria', 'Administrador']
    .map(p => p.toLowerCase());

  const [setores,        setSetores]       = useState([]);
  const [colaboradores,  setColaboradores] = useState([]);
  const [escalaNominal,  setEscalaNominal] = useState([]);
  const [ausencias,      setAusencias]     = useState([]);

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingDados, setLoadingDados] = useState(true);

  useEffect(() => {
    if (userRoles.length > 0 || user === null) {
      setLoadingAuth(false);
    }
  }, [userRoles.length, user]);

  useEffect(() => {
    if (loadingAuth || !user) return;

    const isGlobal = userRoles.some(role => perfisGlobais.includes(role));
    const isLocalOnly = !isGlobal;

    async function carregarDados() {
      setLoadingDados(true);
      try {
        const { data: sData } = await supabase.from('setores_unidades').select('*');
        if (sData) setSetores(sData);

        const { data, error } = await supabase.from('colaboradores').select('*');
        if (data) {
          const colaboradoresFormatados = data.map(c => ({
            matricula: c.matricula,
            nome_completo: c.nome_completo,
            cargo: c.cargo,
            unidade_alocacao: c.unidade_alocacao,
            status: c.status || 'Ativo',
            turno_padrao: c.turno_padrao
          }));

          let listaFinal = colaboradoresFormatados.filter(c => (c.status || '').toLowerCase().includes('ativo'));
          if (isLocalOnly) {
            listaFinal = listaFinal.filter(c => (c.unidade_alocacao || '').toUpperCase() === (unidadeLogada || '').toUpperCase());
          } else if (isGlobal && filtroGlobalSetor && filtroGlobalSetor !== 'Todos') {
            listaFinal = listaFinal.filter(c => (c.unidade_alocacao || '').toUpperCase() === (filtroGlobalSetor || '').toUpperCase());
          }
          setColaboradores(listaFinal);
        }
      } catch (err) {
        console.error('Exceção ao carregar dados:', err);
      } finally {
        setLoadingDados(false);
      }
    }
    carregarDados();
  }, [unidadeLogada, JSON.stringify(userRoles), filtroGlobalSetor, loadingAuth]);

  const [pagina, setPagina] = useState("meu_painel");

  const TODOS_MODULOS = [
    { id: "meu_painel",           label: "Meu Painel",           icon: <Home size={16}/>,             allowedRoles: ['all'] },
    { id: "plantao_diario",       label: "Plantão Diário",       icon: <Clock size={16}/>,            allowedRoles: ['plantão assistencial', 'liderança 2', 'liderança 1', 'diretor'] },
    { id: "planejamento_diario",  label: "Planejamento Diário",  icon: <Calendar size={16}/>,         allowedRoles: ['plantão assistencial', 'liderança 2', 'liderança 1', 'diretor', 'supervisão', 'supervisão plantonista'] },
    { id: "escala_nominal",       label: "Fazer Escala",         icon: <CalendarDays size={16}/>,     allowedRoles: ['liderança 2', 'liderança 1', 'diretor'] },
    { id: "escala",               label: "Planejamento Mensal",  icon: <CalendarDays size={16}/>,     allowedRoles: ['liderança 2', 'liderança 1', 'diretor'] },
    { id: "ausencias",            label: "Ausências",            icon: <UserMinus size={16}/>,        allowedRoles: ['liderança 2', 'liderança 1', 'diretor'] },
    { id: "setores",              label: "Setores Config.",      icon: <Building size={16}/>,         allowedRoles: ['liderança 2', 'liderança 1', 'diretor'] },
    { id: "remanejamento",        label: "Remanejamento",        icon: <ArrowRightLeft size={16}/>,   allowedRoles: ['liderança 2', 'liderança 1', 'diretor'] },
    { id: "gestao_colab",         label: "Gestão de Colab.",     icon: <Users size={16}/>,            allowedRoles: ['liderança 1', 'secretaria'] },
    { id: "relatorio",            label: "Relatório Gerencial",  icon: <TrendingUp size={16}/>,       allowedRoles: ['liderança 1'] },
    { id: "visao_estrategica",    label: "Visão Estratégica",    icon: <Eye size={16}/>,              allowedRoles: ['diretor'] },
    { id: "auditoria_escalas",    label: "Auditoria de Escalas", icon: <ShieldCheck size={16}/>,      allowedRoles: ['diretor'] },
    { id: "config_dimensionamento", label: "Config. Dimensionamento", icon: <Ruler size={16}/>,      allowedRoles: ['diretor'] },
    { id: "dashboard_global",     label: "Dashboard Global",     icon: <LayoutDashboard size={16}/>,  allowedRoles: ['supervisão', 'supervisão plantonista'] },
  ];

  const botoes = TODOS_MODULOS.filter(modulo => {
    if (userRoles.includes('administrador')) return true;
    if (modulo.allowedRoles.includes('all')) return true;
    return userRoles.some(role => modulo.allowedRoles.includes(role));
  });

  if (loadingAuth || loadingDados) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-slate-500 font-medium">Sincronizando EscalaEnf...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {botoes.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center">
          <AlertTriangle className="mx-auto text-amber-500 mb-2" size={32}/>
          <h3 className="font-bold text-amber-800">Nenhum módulo liberado</h3>
          <p className="text-amber-700 text-sm">O seu perfil (<strong>{user?.role}</strong>) não possui permissões configuradas na matriz de acessos.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
          {botoes.map(btn => (
            <button key={btn.id} onClick={() => setPagina(btn.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                pagina === btn.id ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-transparent text-slate-600 hover:bg-slate-100"
              }`}>
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>
      )}

      <div className="min-h-[600px]">
        {pagina === "meu_painel" && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Bem-vindo ao Meu Painel</h2>
            <p className="text-slate-500">Módulo central para visualização de escalas pessoais e avisos.</p>
          </div>
        )}
        
        {pagina === "escala_nominal" && (
          <FazerEscala
            colaboradores={colaboradores} setColaboradores={setColaboradores}
            escalaNominal={escalaNominal} setEscalaNominal={setEscalaNominal}
            ausencias={ausencias} unidadeLogada={unidadeLogada}
          />
        )}

        {pagina === "plantao_diario" && (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
            <Clock className="mx-auto text-slate-300 mb-4" size={48}/>
            <h2 className="text-xl font-bold text-slate-800">Plantão Diário</h2>
            <p className="text-slate-500">Gestão das atividades e intercorrências do dia.</p>
          </div>
        )}

        {pagina === "planejamento_diario" && (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
            <Calendar className="mx-auto text-slate-300 mb-4" size={48}/>
            <h2 className="text-xl font-bold text-slate-800">Planejamento Diário</h2>
            <p className="text-slate-500">Alocação detalhada por turno e setor.</p>
          </div>
        )}

        {pagina === "escala" && <PlanejamentoQuantPage />}
        {pagina === "ausencias" && <AusenciasPage />}
        {pagina === "setores" && <SetoresConfigPage />}
        {pagina === "gestao_colab" && <GestaoColabPage />}
        {pagina === "remanejamento" && <RemanejamentoTab />}
        {pagina === "relatorio" && <RelatorioGerencial colaboradores={colaboradores} unidadeLogada={unidadeLogada} />}
        
        {pagina === "visao_estrategica" && (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
            <Eye className="mx-auto text-slate-300 mb-4" size={48}/>
            <h2 className="text-xl font-bold text-slate-800">Visão Estratégica</h2>
            <p className="text-slate-500">Análise de indicadores e metas de longo prazo.</p>
          </div>
        )}

        {pagina === "auditoria_escalas" && (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
            <ShieldCheck className="mx-auto text-slate-300 mb-4" size={48}/>
            <h2 className="text-xl font-bold text-slate-800">Auditoria de Escalas</h2>
            <p className="text-slate-500">Validação de conformidade e regras de escalas.</p>
          </div>
        )}

        {pagina === "config_dimensionamento" && (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
            <Ruler className="mx-auto text-slate-300 mb-4" size={48}/>
            <h2 className="text-xl font-bold text-slate-800">Config. Dimensionamento</h2>
            <p className="text-slate-500">Definição de parâmetros de pessoal por unidade.</p>
          </div>
        )}

        {pagina === "dashboard_global" && (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
            <LayoutDashboard className="mx-auto text-slate-300 mb-4" size={48}/>
            <h2 className="text-xl font-bold text-slate-800">Dashboard Global</h2>
            <p className="text-slate-500">Visão consolidada de todas as unidades do hospital.</p>
          </div>
        )}
      </div>
    </div>
  );
}
