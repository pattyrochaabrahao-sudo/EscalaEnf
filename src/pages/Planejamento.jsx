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
    setVersaoTabela(prev => prev + 1);
  }

  function handleCellL2(matriculaRaw, dia) {
    const matricula = String(matriculaRaw);
    setGridL2(prev => {
      const ng = { ...prev }; if (!ng[matricula]) ng[matricula] = {};
      const code = ferramentaL2;
      ng[matricula][dia] = code;

      if (code === 'PRD' || code === 'PRN') {
        setGridL1(prevL1 => {
          const nl1 = { ...prevL1 };
          if (!nl1[matricula]) nl1[matricula] = {};
          if (['D', 'M', 'T', 'N'].includes(nl1[matricula][dia])) {
            nl1[matricula][dia] = 'F';
          }
          return nl1;
        });
      }

      return ng;
    });
    setVersaoTabela(prev => prev + 1);
  }

  function limparLinha(matricula) {
    setMatriculaLimpar(String(matricula));
    setModalLimparEscala(true);
  }

  // ── Hours calculation ────────────────────────────────────────────────────
  function calcHoras(matriculaRaw) {
    const matricula = String(matriculaRaw);
    const row = gridL1[matricula] || {}; let total = 0;
    Object.values(row).forEach(val => { const s = TIPOS_PLANTAO.find(t => t.code === val); if (s) total += s.hours; });
    return total;
  }

  // ── Daily coverage totals ────────────────────────────────────────────────
  function coberturaDaily(dia) {
    let manha = 0, tarde = 0, noite = 0;
    colabsFiltrados.forEach(c => {
      const mat = String(c.matricula);
      const v1 = gridL1[mat]?.[dia];
      const v2 = gridL2[mat]?.[dia];
      const ausente = v2 && !['PRD','PRN','TR-E'].includes(v2);
      if (!ausente) {
        if (v1 === 'M' || v1 === 'D' || v1 === 'PRD' || v2 === 'PRD' || v2 === 'TR-E') manha++;
        if (v1 === 'T' || v1 === 'D' || v1 === 'PRD' || v2 === 'PRD' || v2 === 'TR-E') tarde++;
        if (v1 === 'N' || v1 === 'PRN' || v2 === 'PRN') noite++;
      }
    });
    const efetiva = Math.max(manha, tarde, noite);
    return { manha, tarde, noite, efetiva };
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  function salvarEscala() {
    const ic = colabsFiltrados.map(c => {
      const feitas = calcHoras(c.matricula), meta = c.cargaHoraria || 0;
      return { ...c, feitas, meta, diff: feitas - meta };
    }).filter(c => c.diff !== 0);
    setSaveConformity(ic.length === 0);
    setInconformes(ic);
    setShowSaveModal(true);
  }

  async function efetivarSalvamento() {
    const timestamp = new Date().toLocaleString('pt-BR');
    const author = user?.nome || user?.role || 'Sistema';
    
    const mes_ano = `${anoSelecionado}-${String(mesSelecionado + 1).padStart(2, '0')}`;
    const listaUpsert = colabsFiltrados.map(c => {
       const mat = String(c.matricula);
       return {
         mes_ano,
         setor: unidadeLogada,
         matricula_colaborador: String(mat),
         dias_escala: gridL1[mat] || {},
         grid1: gridL1[mat] || {},
         grid2: gridL2[mat] || {},
         updated_at: timestamp,
         author: author
       };
    });

    try {
      const { error } = await supabase
        .from('escalas_mensais')
        .upsert(listaUpsert, { onConflict: 'mes_ano,setor,matricula_colaborador' });
        
      if (error) {
        console.error("Erro ao salvar escala no Supabase:", error);
        alert("Ocorreu um erro ao salvar a escala no banco de dados.");
        setShowSaveModal(false);
        return;
      }
      
      const novoSnapshot = {
        id: Date.now(),
        dataHora: timestamp,
        autor: author,
        mes: mesSelecionado,
        ano: anoSelecionado,
        setor: unidadeLogada,
        grid1: gridL1,
        grid2: gridL2
      };
      setHistoricoEscalas([...historicoEscalas, novoSnapshot]);
      setUltimaAlteracaoEscala(timestamp);
      alert(`✅ Escala de ${String(mesSelecionado + 1).padStart(2,'0')}/${anoSelecionado} salva com sucesso no banco de dados!`);
      
    } catch (err) {
       console.error("Exceção ao salvar:", err);
       alert("❌ Erro inesperado ao salvar: " + err.message);
    }

    setShowSaveModal(false);
    
    setTimeout(() => {
       if (window.confirm("Deseja imprimir a escala?")) {
          window.print();
       }
    }, 300);
  }

  function atualizaCargaHoraria(matriculaRaw, valor) {
    const mat = String(matriculaRaw);
    setColaboradores(prev => prev.map(c => String(c.matricula) === mat ? { ...c, cargaHoraria: parseInt(valor) || 0 } : c));
  }

  function handleSalvarTroca() {
    const { matricula, diaOrigem, diaDestino, motivo } = trocaForm;
    const matStr = String(matricula);
    const dO = parseInt(diaOrigem, 10);
    const dD = parseInt(diaDestino, 10);

    if (!matStr || !dO || !dD || !motivo) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    if (dO === dD) {
      alert('Os dias de origem e destino devem ser diferentes.');
      return;
    }
    if (dO < 1 || dO > diasNoMes || dD < 1 || dD > diasNoMes) {
      alert(`Os dias devem estar entre 1 e ${diasNoMes}.`);
      return;
    }

    setGridL1(prev => {
      const escalaColab = { ...(prev[matStr] || {}) };
      const turnoOrigem  = escalaColab[dO]  || '';
      const turnoDestino = escalaColab[dD] || '';
      return {
        ...prev,
        [matStr]: {
          ...escalaColab,
          [dO]:  turnoDestino,
          [dD]: turnoOrigem,
        }
      };
    });

    alert(`✅ Turno do dia ${dO} movido para o dia ${dD} (motivo: ${motivo}).`);
    setModalTroca(false);
    setTrocaForm({ matricula: '', diaOrigem: '', diaDestino: '', motivo: '' });
    setVersaoTabela(prev => prev + 1);
  }

  function handleSalvarFerias() {
    if (!feriasForm.matricula || !feriasForm.dataInicio || !feriasForm.dias) return;
    const matStr = String(feriasForm.matricula);
    const [y, mm, d] = feriasForm.dataInicio.split('-');
    const diasTotal = parseInt(feriasForm.dias, 10);
    const startObj = new Date(parseInt(y, 10), parseInt(mm, 10) - 1, parseInt(d, 10));
    
    setGridL2(prev => {
      const ng = { ...prev };
      if (!ng[matStr]) ng[matStr] = {};
      
      for(let i = 0; i < diasTotal; i++) {
        const dCursor = new Date(startObj);
        dCursor.setDate(dCursor.getDate() + i);
        if (dCursor.getMonth() === mesSelecionado && dCursor.getFullYear() === anoSelecionado) {
           ng[matStr][dCursor.getDate()] = 'FE';
        }
      }
      return ng;
    });

    setColaboradores(prev => prev.map(c => 
      String(c.matricula) === matStr ? { ...c, motivoAfastamento: 'FE', dataInicioAfastamento: feriasForm.dataInicio, quantidadeDiasAfastamento: diasTotal } : c
    ));

    alert(`Férias de ${diasTotal} dias projetadas com sucesso no rascunho. O funcionário assumiu a Tag (Afastado) com sucesso!`);
    setVersaoTabela(prev => prev + 1);
    setModalFerias(false);
    setFeriasForm({ matricula: '', dataInicio: '', dias: '' });
  }

  function aplicarCalculoChMensal() {
    localStorage.setItem('chConfig', JSON.stringify(chConfig));
    setColaboradores(prev => prev.map(c => {
      if (c.unidade_alocacao !== unidadeLogada && c.setor !== unidadeLogada) return c;
      let base = '';
      const contratoStr = c.tipo_contrato || c.contrato || '';
      if (contratoStr.includes('HC30')) base = 'HC30';
      else if (contratoStr.includes('HC35')) base = 'HC35';
      else if (contratoStr.includes('HC40')) base = 'HC40';
      else if (contratoStr.includes('FFM')) base = 'FFM40';

      if (base) {
        let regra = regraMesGlob;
        const turnoStr = c.turno_padrao || c.turno || '';
        if (turnoStr.includes('12')) {
           const mat = String(c.matricula);
           const d1 = gridL1[mat]?.[1];
           const d2 = gridL1[mat]?.[2];
           if (d1 && !['-','F','DSR'].includes(d1)) regra = 'IMPAR';
           else if (d2 && !['-','F','DSR'].includes(d2)) regra = 'PAR';
        }
        const novaCarga = chConfig[`${base}_${regra}`];
        if (novaCarga) return { ...c, cargaHoraria: novaCarga };
      }
      return c;
    }));
    alert("Carga Horária distribuída! (Grelhas de 12h foram analisadas automaticamente: plantão dia 1 = ÍMPAR).");
  }

  if (!unidadeLogada) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border text-center">
        <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Unidade não definida</h2>
        <p className="text-slate-500 mt-1">Efetue login selecionando a sua unidade para aceder à Escala Nominal.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 impressao-escala">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-5 gap-4 hide-on-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="text-indigo-600" /> Escala Nominal
            <span className="text-sm font-normal text-slate-400 ml-1">— {unidadeLogada}</span>
          </h2>
          {ultimaAlteracaoEscala && <p className="text-sm font-medium text-slate-500 mt-1">Última alteração: {ultimaAlteracaoEscala}</p>}
          {historicoFiltrado.length > 0 && (
            <select className="mt-2 text-[10px] bg-slate-100 border border-slate-200 rounded outline-none p-1 text-slate-600 font-bold max-w-xs" defaultValue="">
              <option value="" disabled>Ver Histórico de Versões Publicadas</option>
              {historicoFiltrado.slice().reverse().map((h, i) => (
                 <option key={h.id} value={h.id}>V{historicoFiltrado.length - i} — {h.dataHora} por {h.autor}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm">
          <button onClick={() => setShowChPanel(!showChPanel)} className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-100 flex items-center gap-2">⚙️ CH Mensal</button>
          <div className="flex items-center gap-2">
            <button onClick={() => setMesSelecionado(p => p === 0 ? 11 : p - 1)} className="p-1.5 border bg-white rounded-lg"><ChevronLeft size={15}/></button>
            <span className="text-center w-36 font-bold text-indigo-700 text-sm">{nomeMeses[mesSelecionado]} {anoSelecionado}</span>
            <button onClick={() => setMesSelecionado(p => p === 11 ? 0 : p + 1)} className="p-1.5 border bg-white rounded-lg"><ChevronRight size={15}/></button>
          </div>
          <div className="border-l border-slate-300 pl-3 flex flex-wrap items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase">Turno:</label>
            <select className="bg-white border border-slate-300 p-1.5 rounded-lg text-xs font-bold text-indigo-700 outline-none"
              value={filtroTurnoEscala} onChange={e => setFiltroTurnoEscala(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Noturno">Noturno</option>
            </select>
            <label className="text-xs font-bold text-slate-600 uppercase ml-2">Categoria:</label>
            <select className="bg-white border border-slate-300 p-1.5 rounded-lg text-xs font-bold text-indigo-700 outline-none"
              value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
              <option value="Todas">Todas</option>
              <option value="Enfermeiro">Enfermeiro</option>
              <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
              <option value="Auxiliar de Enfermagem">Auxiliar de Enfermagem</option>
            </select>
          </div>
        </div>
      </div>

      {showChPanel && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl mb-5 hide-on-print animate-fade-in">
          <div className="flex justify-between items-center border-b border-indigo-100 pb-2 mb-3">
             <h3 className="font-bold text-indigo-800 text-sm flex items-center gap-2">Configurar CH Alvo do Mês</h3>
             <div className="flex items-center gap-2 text-xs font-bold text-indigo-800">
               Regra Principal (Rotinas):
               <select className="p-1 border border-indigo-200 rounded outline-none" value={regraMesGlob} onChange={e => setRegraMesGlob(e.target.value)}>
                 <option value="PAR">Mês PAR</option>
                 <option value="IMPAR">Mês ÍMPAR</option>
               </select>
             </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {['HC30', 'HC35', 'HC40', 'FFM40'].map(cat => (
              <div key={cat} className="bg-white p-2 rounded-lg border border-indigo-100 shadow-sm flex flex-col gap-1 text-xs">
                 <span className="font-black text-slate-700 text-center">{cat}</span>
                 <div className="flex items-center justify-between"><label className="text-slate-500">Par:</label><input type="number" className="w-16 border rounded p-1 text-center font-bold outline-none focus:border-indigo-400" value={chConfig[`${cat}_PAR`]} onChange={e => setChConfig({...chConfig, [`${cat}_PAR`]: parseInt(e.target.value)||0})} /></div>
                 <div className="flex items-center justify-between"><label className="text-slate-500">Ímpar:</label><input type="number" className="w-16 border rounded p-1 text-center font-bold outline-none focus:border-indigo-400" value={chConfig[`${cat}_IMPAR`]} onChange={e => setChConfig({...chConfig, [`${cat}_IMPAR`]: parseInt(e.target.value)||0})} /></div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-indigo-600 mb-3 italic">Nota: Para plantões 12x36, o sistema lê automaticamente se o colaborador iniciou no dia 1 e sobrepõe a regra selecionada.</p>
          <button onClick={aplicarCalculoChMensal} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 active:scale-[0.99] transition-all">Calcular e Preencher CH na Tabela</button>
        </div>
      )}

      <div className="hidden print:block text-center mb-6">
         <h2 className="text-2xl font-black text-slate-900 border-b pb-2 mb-2">Escala Nominal de Enfermagem - {unidadeLogada}</h2>
         <p className="text-sm font-bold text-slate-600">{nomeMeses[mesSelecionado]} {anoSelecionado} | Base de Turno: {filtroTurnoEscala}</p>
         {ultimaAlteracaoEscala && <p className="text-xs text-slate-500 mt-1">Última alteração: {ultimaAlteracaoEscala}</p>}
      </div>

      <div className="flex flex-col gap-2 mb-4 hide-on-print">
        <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Edit2 size={12}/> Linha 1 — Base:
          </span>
          {TIPOS_L1.map(tp => (
            <button key={tp.code} onClick={() => setFerramentaL1(tp.code)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${ferramentaL1 === tp.code ? 'bg-indigo-600 text-white border-indigo-700 shadow scale-105' : `${tp.color} hover:opacity-80`}`}>
              {tp.code || '✕'} <span className="hidden md:inline">— {tp.label}</span>
            </button>
          ))}
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Edit2 size={12}/> Linha 2 — Extras:
          </span>
          {TIPOS_L2.map(tp => (
            <button key={tp.code} onClick={() => setFerramentaL2(tp.code)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${ferramentaL2 === tp.code ? 'bg-slate-700 text-white border-slate-800 shadow scale-105' : `${tp.color} hover:opacity-80`}`}>
              {tp.code || '✕'} <span className="hidden md:inline">— {tp.label}</span>
            </button>
          ))}
          <div className="ml-auto flex flex-nowrap items-center gap-2">
            <button onClick={() => setModalLimparEscala(true)} className="px-3 py-1 bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-200 hover:bg-rose-200 transition-colors flex items-center gap-1">🧹 Limpar Escala</button>
            <button onClick={() => setModalFerias(true)} className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-[11px] rounded-lg border border-amber-200 hover:bg-amber-200 transition-colors flex items-center gap-1">🏝️ Lançar Férias</button>
            <button onClick={() => setModalTroca(true)} className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg border border-indigo-200 hover:bg-indigo-200 transition-colors flex items-center gap-1">🔄 Registrar Troca</button>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 hide-on-print">
        <span className="text-xs text-slate-500 font-medium">Mínimo de cobertura por turno/dia:</span>
        <span className="bg-red-50 text-red-700 font-black text-xs px-2 py-0.5 rounded border border-red-200">{MINIMO_DIA} profissionais</span>
        <span className="text-[10px] text-slate-400 italic">— dias abaixo ficam marcados a vermelho</span>
      </div>

      <div className="overflow-auto max-h-[800px] rounded-xl border border-slate-300 bg-slate-50 shadow-inner">
        <table key={versaoTabela} className="w-full text-left border-collapse text-xs min-w-[max-content] table-fixed">
          <thead className="sticky top-0 z-40 bg-slate-100 outline outline-1 outline-slate-200">
            <tr className="text-slate-600 font-semibold h-11">
              <th className="p-2 w-[200px] min-w-[200px] sticky left-0 z-50 bg-slate-100 border-r border-slate-300">Colaborador</th>
              <th className="p-2 w-[60px] min-w-[60px] sticky left-[200px] z-50 bg-slate-100 border-r border-slate-300 text-center text-[10px] uppercase">CH<br/>Mensal</th>
              <th className="p-2 w-[60px] min-w-[60px] sticky left-[260px] z-50 bg-slate-100 border-r border-slate-300 text-center text-[10px] uppercase">Horas<br/>Feitas</th>
              <th className="p-2 w-[55px] min-w-[55px] sticky left-[320px] z-50 bg-slate-100 border-r border-slate-300 text-center text-[10px] uppercase">Total<br/>PR</th>
              {dias.map(d => {
                const fds = dow(d) === 0 || dow(d) === 6;
                return (
                  <th key={d} className={`p-1 w-[38px] min-w-[38px] text-center border-r border-slate-200 ${fds ? 'bg-rose-100 text-rose-800' : ''}`}>
                    <div className="font-bold text-[11px]">{d}</div>
                    <div className="text-[9px] uppercase">{dowAbrev[dow(d)]}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          
          <tbody className="bg-white">
            {colabsFiltrados.map((c, index) => {
              const mat = String(c.matricula);
              const horas  = calcHoras(mat);
              const meta   = c.cargaHoraria || 0;
              const excede = horas > meta;
              const base   = excede ? 'bg-yellow-50' : 'bg-white';
              const hover1 = excede ? 'hover:bg-yellow-100' : 'hover:bg-slate-50';

              return (
                <Fragment key={`colab-${mat}-${index}`}>
                  <tr className={`h-[42px] group transition-colors border-t border-slate-200 ${base} ${hover1}`}>
                    <td rowSpan={2} className={`p-2 sticky left-0 z-30 border-r border-slate-300 align-top ${base} border-b border-slate-200`}>
                      <div className="font-bold text-slate-800 text-[11px] truncate max-w-[185px]" title={c.nome_completo}>{c.nome_completo}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5 truncate mb-1.5">
                        {c.categoria_profissional} • {c.vinculo} • {c.turno_padrao && nomesTurnos[c.turno_padrao] ? nomesTurnos[c.turno_padrao] : c.turno_padrao}
                      </div>
                    </td>
                    <td rowSpan={2} className={`p-1 sticky left-[200px] z-30 border-r border-slate-300 text-center align-middle ${base} border-b border-slate-200`}>
                      <input type="number" className="w-11 text-center text-[11px] font-bold border rounded p-1 outline-none" value={meta} onChange={e => atualizaCargaHoraria(mat, e.target.value)} />
                    </td>
                    <td rowSpan={2} className={`p-1 sticky left-[260px] z-30 border-r border-slate-300 text-center align-middle ${base} border-b border-slate-200`}>
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${excede ? 'bg-rose-100 text-rose-700' : 'text-slate-600'}`}>{horas}h</span>
                    </td>
                    {(() => {
                      const totalPR = (Object.values(gridL1[mat] || {}).filter(v => v === 'PRD' || v === 'PRN').length) +
                                      (Object.values(gridL2[mat] || {}).filter(v => v === 'PRD' || v === 'PRN').length);
                      return (
                        <td rowSpan={2} className={`p-1 sticky left-[320px] z-30 border-r border-slate-300 text-center align-middle ${base} border-b border-slate-200`}>
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded text-slate-600">{totalPR}</span>
                        </td>
                      );
                    })()}

                    {dias.map(d => {
                      const val = gridL1[mat]?.[d];
                      const pendingPedido = pedidosFolga?.find(p => String(p.colabId) === mat && p.mes === mesSelecionado && p.ano === anoSelecionado && p.dia === d && p.status === 'Pendente');
                      const fds = dow(d) === 0 || dow(d) === 6;

                      let cls = fds ? 'bg-slate-100' : '';
                      let txt = val || '';
                      let txtCls = 'text-slate-300';
                      if (val) { cls = shiftColor(val); txtCls = 'font-black'; }

                      return (
                        <td key={`l1-${d}`} className={`p-0.5 border-r border-slate-200 cursor-pointer relative ${cls} hover:opacity-75 transition-opacity`}
                          onClick={() => {
                            if (pendingPedido) {
                               setFolgaActionModal({ c, d, req: pendingPedido });
                            } else {
                               handleCellL1(c, d);
                            }
                          }}>
                          <div className={`w-full h-[34px] flex items-center justify-center text-[11px] select-none ${txtCls}`}>
                             <span>{txt}</span>
                             <span className={`absolute top-1 right-1 h-2.5 w-2.5 ${pendingPedido ? 'flex' : 'hidden'}`}>
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" title="Pedido de Folga Pendente"></span>
                             </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  <tr className={`h-[30px] border-b border-slate-200 ${base}`}>
                    {dias.map(d => {
                      const val = gridL2[mat]?.[d];
                      let cls = '';
                      let txtCls = 'text-slate-200';
                      if (val) { cls = shiftColor(val); txtCls = 'font-black text-[10px]'; }
                      return (
                        <td key={`l2-${d}`} className={`p-0.5 border-r border-slate-200 cursor-pointer ${cls} hover:opacity-75 transition-opacity`}
                          onClick={() => handleCellL2(mat, d)}>
                          <div className={`w-full h-[22px] flex items-center justify-center text-[10px] select-none ${txtCls} italic`}>
                            {val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>

          {colabsFiltrados.length > 0 ? (
            <tfoot className="sticky bottom-0 z-40 outline outline-1 outline-slate-300 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
              <tr className="bg-blue-50/90 h-[32px] border-b border-blue-200">
                <td colSpan={4} className="p-2 text-right text-[10px] font-bold text-blue-800 sticky left-0 z-50 bg-blue-100/90 border-r border-blue-200">
                  Soma Manhã (M+D+PRD)
                </td>
                {dias.map(d => {
                  const sum = colabsFiltrados.reduce((acc, c) => {
                    const mat = String(c.matricula);
                    const v1 = gridL1[mat]?.[d], v2 = gridL2[mat]?.[d];
                    const ausente = v2 && !['PRD','PRN','TR-E'].includes(v2);
                    if (ausente) return acc;
                    return acc + (['M','D','PRD'].includes(v1) || v2 === 'PRD' || v2 === 'TR-E' ? 1 : 0);
                  }, 0);
                  return <td key={d} className="border-r border-blue-200 text-center font-black text-blue-800 text-[10px]">{sum > 0 ? sum : ''}</td>;
                })}
              </tr>
              <tr className="bg-cyan-50/90 h-[32px] border-b border-cyan-200">
                <td colSpan={4} className="p-2 text-right text-[10px] font-bold text-cyan-800 sticky left-0 z-50 bg-cyan-100/90 border-r border-cyan-200">
                  Soma Tarde (T+D+PRD)
                </td>
                {dias.map(d => {
                  const sum = colabsFiltrados.reduce((acc, c) => {
                    const mat = String(c.matricula);
                    const v1 = gridL1[mat]?.[d], v2 = gridL2[mat]?.[d];
                    const ausente = v2 && !['PRD','PRN','TR-E'].includes(v2);
                    if (ausente) return acc;
                    return acc + (['T','D','PRD'].includes(v1) || v2 === 'PRD' || v2 === 'TR-E' ? 1 : 0);
                  }, 0);
                  return <td key={d} className="border-r border-cyan-200 text-center font-black text-cyan-800 text-[10px]">{sum > 0 ? sum : ''}</td>;
                })}
              </tr>
              <tr className="bg-sky-50/90 h-[32px] border-b border-sky-200">
                <td colSpan={4} className="p-2 text-right text-[10px] font-bold text-sky-800 sticky left-0 z-50 bg-sky-100/90 border-r border-sky-200">
                  Soma Noite (N+PRN)
                </td>
                {dias.map(d => {
                  const sum = colabsFiltrados.reduce((acc, c) => {
                    const mat = String(c.matricula);
                    const v1 = gridL1[mat]?.[d], v2 = gridL2[mat]?.[d];
                    const ausente = v2 && !['PRD','PRN','TR-E'].includes(v2);
                    if (ausente) return acc;
                    return acc + (['N','PRN'].includes(v1) || v2 === 'PRN' ? 1 : 0);
                  }, 0);
                  return <td key={d} className="border-r border-sky-200 text-center font-black text-sky-800 text-[10px]">{sum > 0 ? sum : ''}</td>;
                })}
              </tr>
              <tr className="bg-slate-100 h-[36px]">
                <td colSpan={4} className="p-2 text-right text-[10px] font-black text-slate-700 sticky left-0 z-50 bg-slate-200 border-r border-slate-300">
                  ⚡ Força Efetiva (máx turno)
                </td>
                {dias.map(d => {
                  const cob = coberturaDaily(d);
                  const abaixo = cob.efetiva > 0 && cob.efetiva < MINIMO_DIA;
                  return (
                    <td key={d} className={`border-r border-slate-300 text-center text-[10px] font-black ${
                      abaixo ? 'bg-red-200 text-red-800' : cob.efetiva === 0 ? 'text-slate-300' : 'bg-emerald-50 text-emerald-800'
                    }`} title={abaixo ? `Abaixo do mínimo (${MINIMO_DIA})!` : ''}>
                      {cob.efetiva > 0 ? cob.efetiva : ''}
                      {abaixo && <span className="block text-[7px] leading-none">⚠</span>}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>

      <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-4 hide-on-print">
        <p className="text-xs text-slate-400 italic">Esses totais (em tempo real) ficarão oficiais para outras telas apenas após salvar.</p>
        <button onClick={salvarEscala} className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 shadow-md flex items-center gap-2 active:scale-[0.98] transition-all">
          <Save size={16} /> Salvar e Publicar/Imprimir
        </button>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold mb-4">{saveConformity ? "✅ Escala conforme!" : "⚠️ Inconformidades encontradas"}</h3>
            {!saveConformity && (
              <div className="mb-4 max-h-52 overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs border-collapse">
                  <thead><tr className="bg-slate-100 text-slate-500"><th className="p-2 text-left">Colaborador</th><th className="p-2 text-center">Meta</th><th className="p-2 text-center">Feitas</th><th className="p-2 text-center">Diff.</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {inconformes.map(c => (
                      <tr key={c.matricula}>
                        <td className="p-2 font-semibold">{c.nome}</td>
                        <td className="p-2 text-center">{c.meta}h</td>
                        <td className="p-2 text-center">{c.feitas}h</td>
                        <td className={`p-2 text-center font-bold ${c.diff > 0 ? 'text-rose-600' : 'text-amber-600'}`}>{c.diff > 0 ? `+${c.diff}h` : `${c.diff}h`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-sm text-slate-600 mb-5">
              {saveConformity ? "Todas as cargas horárias estão dentro do esperado. Deseja confirmar o salvamento?" : "Existem colaboradores com horas fora da meta. Deseja salvar mesmo assim?"}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold">Cancelar</button>
              <button onClick={efetivarSalvamento} className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-indigo-700">Confirmar e Salvar</button>
            </div>
          </div>
        </div>
      )}

      {modalTroca && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 hide-on-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-indigo-600 p-5 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2">🔄 Mover Turno de Dia</h3>
              <button onClick={() => setModalTroca(false)} className="hover:bg-indigo-700 p-1 rounded-full"><X size={20}/></button>
            </div>
            <div className="p-6">
              <p className="text-xs text-slate-500 mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                Selecione o colaborador e os dois dias. Os turnos de <strong>Origem</strong> e <strong>Destino</strong> serão <strong>trocados entre si</strong> na Linha 1 (Base).
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Colaborador <span className="text-rose-500">*</span></label>
                  <select
                    required
                    className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                    value={trocaForm.matricula}
                    onChange={e => setTrocaForm({...trocaForm, matricula: e.target.value})}
                  >
                    <option value="">Selecione o colaborador...</option>
                    {colabsFiltrados.map(c => (
                      <option key={c.matricula} value={c.matricula}>
                        {c.nome_completo || c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Dia de Origem <span className="text-rose-500">*</span></label>
                    <input
                      type="number" min={1} max={diasNoMes} required
                      placeholder={`1–${diasNoMes}`}
                      className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-center font-bold"
                      value={trocaForm.diaOrigem}
                      onChange={e => setTrocaForm({...trocaForm, diaOrigem: e.target.value})}
                    />
                    {trocaForm.matricula && trocaForm.diaOrigem && (
                      <p className="text-[10px] text-indigo-600 mt-1 font-bold">
                        Turno atual: {gridL1[String(trocaForm.matricula)]?.[parseInt(trocaForm.diaOrigem)] || '(vazio)'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Dia de Destino <span className="text-rose-500">*</span></label>
                    <input
                      type="number" min={1} max={diasNoMes} required
                      placeholder={`1–${diasNoMes}`}
                      className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-center font-bold"
                      value={trocaForm.diaDestino}
                      onChange={e => setTrocaForm({...trocaForm, diaDestino: e.target.value})}
                    />
                    {trocaForm.matricula && trocaForm.diaDestino && (
                      <p className="text-[10px] text-indigo-600 mt-1 font-bold">
                        Turno atual: {gridL1[String(trocaForm.matricula)]?.[parseInt(trocaForm.diaDestino)] || '(vazio)'}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Motivo <span className="text-rose-500">*</span></label>
                  <select
                    required
                    className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
                    value={trocaForm.motivo}
                    onChange={e => setTrocaForm({...trocaForm, motivo: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="Particular">Particular</option>
                    <option value="Necessidade Institucional">Necessidade Institucional</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-6 mt-4 border-t border-slate-100">
                <button onClick={() => setModalTroca(false)} className="text-slate-500 font-bold px-4 py-2 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button
                  onClick={handleSalvarTroca}
                  disabled={!trocaForm.matricula || !trocaForm.diaOrigem || !trocaForm.diaDestino || !trocaForm.motivo}
                  className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >Mover Turno</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalFerias && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 hide-on-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-amber-500 p-5 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2">🏝️ Gerenciamento de Férias</h3>
              <button onClick={() => setModalFerias(false)} className="hover:bg-amber-600 p-1 rounded-full"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Colaborador</label>
                  <select required className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-400" value={feriasForm.matricula} onChange={e => setFeriasForm({...feriasForm, matricula: e.target.value})}>
                    <option value="">Selecione...</option>
                    {colabsFiltrados.map(c => <option key={c.matricula} value={c.matricula}>{c.nome_completo || c.nome}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Data de Início</label>
                    <input type="date" required className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-400" value={feriasForm.dataInicio} onChange={e => setFeriasForm({...feriasForm, dataInicio: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Quantidade de Dias</label>
                    <input type="number" min="1" required className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-400" value={feriasForm.dias} onChange={e => setFeriasForm({...feriasForm, dias: e.target.value})} placeholder="Ex: 30" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-6 mt-4 border-t border-slate-100">
                <button onClick={() => setModalFerias(false)} className="text-slate-500 font-bold px-4 py-2 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button onClick={handleSalvarFerias} disabled={!feriasForm.matricula || !feriasForm.dataInicio || !feriasForm.dias} className="bg-amber-500 text-white font-bold px-6 py-2 rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-all">Automatizar Férias</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {folgaActionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 hide-on-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in">
             <div className="p-6 text-center">
                <div className="mx-auto w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4"><CalendarDays size={28}/></div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Pedido de Folga</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  O colaborador <b>{folgaActionModal.c.nome}</b> solicitou folga para o dia <b>{folgaActionModal.d}</b>. Como deseja proceder?
                </p>
                <div className="flex justify-center gap-3">
                   <button onClick={() => {
                      try {
                        const matStr = String(folgaActionModal.c.matricula);
                        setGridL1(p => { 
                           const ng = {...p}; 
                           const cb = {...(ng[matStr] || {})}; 
                           cb[folgaActionModal.d] = 'F'; 
                           ng[matStr] = cb; 
                           return ng; 
                        });
                        setPedidosFolga(prev => prev.map(x => x === folgaActionModal.req ? {...x, status: 'Aprovado'} : x));
                        setFolgaActionModal(null);
                        setVersaoTabela(prev => prev + 1);
                      } catch(e) { alert("ERRO Aprovar: " + e.message); }
                   }} className="bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 flex items-center gap-2 active:scale-95 transition-all shadow-md">
                      <ThumbsUp size={18}/> Aprovar
                   </button>
                   <button onClick={() => {
                      try {
                        setPedidosFolga(prev => prev.map(x => x === folgaActionModal.req ? {...x, status: 'Recusado'} : x));
                        setFolgaActionModal(null);
                        setVersaoTabela(prev => prev + 1);
                      } catch(e) { alert("ERRO Recusar: " + e.message); }
                   }} className="bg-rose-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-rose-600 flex items-center gap-2 active:scale-95 transition-all shadow-md">
                      <ThumbsDown size={18}/> Recusar
                   </button>
                </div>
                <button onClick={() => setFolgaActionModal(null)} className="mt-5 text-sm font-bold text-slate-400 hover:text-slate-600 outline-none">
                  Decidir depois
                </button>
             </div>
          </div>
        </div>
      )}

      {modalLimparEscala && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 hide-on-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="bg-rose-500 p-5 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2"><Trash2 size={20}/> Limpar Escala</h3>
              <button onClick={() => setModalLimparEscala(false)} className="hover:bg-rose-600 p-1 rounded-full"><X size={20}/></button>
            </div>
            <div className="p-6">
              <p className="text-slate-500 text-sm mb-4">Selecione o colaborador para apagar todos os seus plantões deste mês.</p>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 mb-1">Colaborador <span className="text-rose-500">*</span></label>
                <select
                  className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-rose-400"
                  value={matriculaLimpar}
                  onChange={e => setMatriculaLimpar(e.target.value)}
                >
                  <option value="">Selecione o colaborador...</option>
                  {colabsFiltrados.map(c => (
                    <option key={c.matricula} value={c.matricula}>
                      {c.nome_completo || c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button onClick={() => setModalLimparEscala(false)} className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-all">Cancelar</button>
                <button
                  disabled={!matriculaLimpar}
                  onClick={() => {
                    const matStr = String(matriculaLimpar);
                    setGridL1(p => ({ ...p, [matStr]: {} }));
                    setGridL2(p => ({ ...p, [matStr]: {} }));
                    setModalLimparEscala(false);
                    setMatriculaLimpar("");
                    setVersaoTabela(prev => prev + 1);
                  }}
                  className="px-6 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 disabled:opacity-50 transition-all shadow-md"
                >Confirmar Limpeza</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AusenciasPage
// ─────────────────────────────────────────────────────────────────────────────
function AusenciasPage({ colaboradores, ausencias, setAusencias, user, filtroGlobalSetor }) {
  const dataAtual = new Date();
  const dataHojeInput = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth()+1).padStart(2,'0')}-${String(dataAtual.getDate()).padStart(2,'0')}`;
  const [matBusca,     setMatBusca]     = useState("");
  const [motivo,       setMotivo]       = useState("Atestado");
  const [dataAusencia, setDataAusencia] = useState(dataHojeInput);
  const [turnoAus,     setTurnoAus]     = useState("Manhã");
  const colabEncontrado = colaboradores.find(c => String(c.matricula) === String(matBusca));

  function handleSalvar(e) {
    e.preventDefault();
    if (!colabEncontrado) return alert("Colaborador não encontrado. Verifique a matrícula.");
    const [anoStr, mesStr, diaStr] = dataAusencia.split('-');
    const dataFormatada = `${diaStr}/${mesStr}/${anoStr}`;
    setAusencias(prev => [{ id: Date.now(), colaborador: colabEncontrado.nome, matricula: colabEncontrado.matricula, setor: colabEncontrado.setor, motivo, data: dataFormatada, turno: turnoAus }, ...prev]);
    alert("Ausência registrada!"); setMatBusca("");
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Gestão de Ausências</h2>
      
      {user?.role !== "Supervisão" && (
         <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 mb-8 shadow-inner animate-fade-in">
           <h3 className="font-bold text-rose-800 mb-4 flex items-center gap-2"><UserMinus size={18}/> Registrar Ausência</h3>
        <form onSubmit={handleSalvar} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div><label className="block text-xs font-bold text-rose-900 mb-1">Matrícula</label><input type="text" className="w-full border border-rose-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-rose-400" value={matBusca} onChange={e => setMatBusca(e.target.value)} placeholder="Ex: 1001" required/></div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-rose-900 mb-1">Motivo</label><select className="w-full border border-rose-200 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-400" value={motivo} onChange={e => setMotivo(e.target.value)}><option>Atestado</option><option>Falta Injustificada</option><option>Licença/Folga Extra</option></select></div>
          <div><label className="block text-xs font-bold text-rose-900 mb-1">Data</label><input type="date" className="w-full border border-rose-200 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-400" value={dataAusencia} onChange={e => setDataAusencia(e.target.value)} required/></div>
          <div><label className="block text-xs font-bold text-rose-900 mb-1">Turno</label><select className="w-full border border-rose-200 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-400" value={turnoAus} onChange={e => setTurnoAus(e.target.value)}><option>Manhã</option><option>Tarde</option><option>Noite</option></select></div>
          <div className="md:col-span-5 flex justify-end"><button type="submit" className="bg-rose-600 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-rose-700 shadow-md">Registrar</button></div>
        </form>
      </div>
      )}

      <h3 className="font-bold text-slate-800 mb-4">Ausências Registradas</h3>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b"><tr><th className="p-4">Colaborador</th><th className="p-4">Matrícula</th><th className="p-4">Setor</th><th className="p-4">Data/Turno</th><th className="p-4">Motivo</th></tr></thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {(() => {
               let ausenciasVisiveis = ausencias;
               if (user?.role === "Supervisão" && filtroGlobalSetor) ausenciasVisiveis = ausenciasVisiveis.filter(a => a.setor === filtroGlobalSetor);
               if (ausenciasVisiveis.length === 0) return <tr><td colSpan="5" className="p-6 text-center text-slate-400 italic">Nenhuma ausência registrada.</td></tr>;
               return ausenciasVisiveis.map((a, i) => (
                 <tr key={a.id || i} className="hover:bg-slate-50">
                   <td className="p-4 font-bold text-slate-800">{a.colaborador}</td>
                   <td className="p-4 text-slate-500 font-mono">{a.matricula}</td>
                   <td className="p-4"><span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-bold text-slate-600">{a.setor}</span></td>
                   <td className="p-4 text-slate-600 font-medium">{a.data} • {a.turno}</td>
                   <td className="p-4"><span className="text-rose-700 font-bold text-[10px] uppercase bg-rose-50 border border-rose-100 px-2 py-1 rounded-md">{a.motivo}</span></td>
                 </tr>
               ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SetoresConfigPage
// ─────────────────────────────────────────────────────────────────────────────
function SetoresConfigPage({ setores, setSetores, unidadeLogada }) {
  const setoresVisiveis = unidadeLogada ? setores.filter(s => s.nome === unidadeLogada) : setores;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Setores e Parâmetros</h2>
      <p className="mb-6 text-slate-600 font-medium bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm">Apenas o perfil <span className="font-bold text-indigo-700">Administrativo</span> pode ajustar parâmetros de mínimos e leitos.</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-sm">
          <thead><tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200"><th className="p-4">Setor</th><th className="p-4">Grupo</th><th className="p-4 text-center">Leitos Op.</th><th className="p-4 text-center">Mín. Enf.</th><th className="p-4 text-center">Mín. Tec.</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {setoresVisiveis.map((s, idx) => {
              const ri = setores.findIndex(x => x === s);
              const upd = (field, val) => { const n = [...setores]; n[ri] = { ...n[ri], [field]: parseInt(val)||0 }; setSetores(n); };
              return (
                <tr key={`${s.nome}-${idx}`} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">{s.nome}</td>
                  <td className="p-4 text-sm text-slate-500">{s.grupo}</td>
                  <td className="p-4 text-center"><input type="number" disabled className="border border-slate-300 p-2 rounded-lg w-20 text-center bg-transparent border-transparent font-bold text-slate-700 outline-none" value={s.leitosOperacionais} onChange={e => upd('leitosOperacionais', e.target.value)}/></td>
                  <td className="p-4 text-center"><input type="number" disabled className="border border-slate-300 p-2 rounded-lg w-20 text-center bg-transparent border-transparent font-bold text-slate-700 outline-none" value={s.minEnf} onChange={e => upd('minEnf', e.target.value)}/></td>
                  <td className="p-4 text-center"><input type="number" disabled className="border border-slate-300 p-2 rounded-lg w-20 text-center bg-transparent border-transparent font-bold text-slate-700 outline-none" value={s.minTec} onChange={e => upd('minTec', e.target.value)}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GestaoColabPage
// ─────────────────────────────────────────────────────────────────────────────
const MOTIVOS_AFASTAMENTO = [
  "39-Alistamento Militar", "15-CAT", "26-Afastamento c/ vencimentos", "29-Afastamento s/ vencimentos", 
  "79-Compensação por decreto", "77-Convocação Eleitoral", "38-Convocação Judicial", "30-Doação de Sangue", 
  "19-Licença filho menor", "22-Falta Abonada", "06-Falta Injustificada", "20-Falta Justificada", 
  "87-Falta por greve transporte", "80-Folga de decreto", "77-Greve", "27-Licença Gala", 
  "18-Licença INSS irregular", "16-Licença Médica > 15 Dias", "17-Licença médica até 15 Dias", 
  "28-Licença Nojo", "11-Licença Paternidade", "05-Licença Prêmio", "14-Maternidade", 
  "81-Pagar horas greve", "31-Suspensão de contrato", "04-Suspensão Disciplinar"
];

function GestaoColabPage({ colaboradores, setColaboradores, unidadeLogada, user, filtroGlobalSetor }) {
  let lista = colaboradores; 
  const [colabEditando, setColabEditando] = useState(null);
  const [isNovo, setIsNovo] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");

  if (termoBusca) {
    const q = termoBusca.toLowerCase();
    lista = lista.filter(c => 
      ((c.nome_completo || c.nome || '').toLowerCase().includes(q)) || 
      (c.matricula && String(c.matricula).toLowerCase().includes(q)) || 
      ((c.categoria_profissional || c.cargo || '').toLowerCase().includes(q))
    );
  }

  const transferenciasPendentes = colaboradores.filter(c => c.setorDestino === unidadeLogada && c.statusTransferencia === 'Pendente');

  const aceitarTransferencia = async (colab) => {
    try {
      const matriculaStr = String(colab.matricula);
      const { error } = await supabase.from('colaboradores').update({
        unidade_alocacao: unidadeLogada,
        setorDestino: null,
        statusTransferencia: null
      }).eq('matricula', matriculaStr);

      if (error) throw error;

      setColaboradores(prev => prev.map(c => 
        String(c.matricula) === matriculaStr ? { ...c, unidade_alocacao: unidadeLogada, setor: unidadeLogada, setorDestino: null, statusTransferencia: null } : c
      ));
      alert(`${colab.nome || colab.nome_completo} foi integrado ao seu setor com sucesso no Supabase.`);
    } catch (error) {
      console.error("Erro ao aceitar transferência:", error);
      alert("Erro ao aceitar transferência. Verifique o console.");
    }
  };

  const recusarTransferencia = async (colab) => {
    try {
      const matriculaStr = String(colab.matricula);
      const { error } = await supabase.from('colaboradores').update({
        setorDestino: null,
        statusTransferencia: 'Recusada'
      }).eq('matricula', matriculaStr);

      if (error) throw error;

      setColaboradores(prev => prev.map(c => 
        String(c.matricula) === matriculaStr ? { ...c, setorDestino: null, statusTransferencia: 'Recusada' } : c
      ));
      alert(`Transferência de ${colab.nome || colab.nome_completo} foi recusada no banco de dados.`);
    } catch (error) {
      console.error("Erro ao recusar transferência:", error);
      alert("Erro ao recusar transferência.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if(!colabEditando.matricula) return alert("Matrícula é obrigatória!");
    
    // Prepara o pacote de dados mapeando "setor" para "unidade_alocacao" do Supabase
    const payload = {
      ...colabEditando,
      matricula: String(colabEditando.matricula),
      unidade_alocacao: colabEditando.setor,
      status: 'Ativo'
    };

    try {
      const { error } = await supabase
        .from('colaboradores')
        .upsert(payload, { onConflict: 'matricula' });

      if (error) throw error;

      // Atualiza a tela apenas se o Supabase confirmar o salvamento
      if (isNovo) {
        setColaboradores(prev => [...prev, payload]);
      } else {
        setColaboradores(prev => prev.map(c => String(c.matricula) === String(payload.matricula) ? payload : c));
      }
      
      setColabEditando(null);
      setIsNovo(false);
      alert("✅ Colaborador salvo com sucesso no banco de dados!");

    } catch (error) {
      console.error("Erro ao salvar no Supabase:", error);
      alert("Erro ao salvar no banco de dados: " + error.message);
    }
  };

  const handleDelete = async (colab) => {
    if (window.confirm(`Deseja excluir o colaborador "${colab.nome_completo || colab.nome}" (Mat. ${colab.matricula}) do banco de dados? Esta ação não pode ser desfeita.`)) {
      try {
        const { error } = await supabase
          .from('colaboradores')
          .delete()
          .eq('matricula', String(colab.matricula));

        if (error) throw error;

        setColaboradores(prev => prev.filter(c => String(c.matricula) !== String(colab.matricula)));
        alert("Colaborador excluído com sucesso.");
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao excluir do Supabase: " + error.message);
      }
    }
  };

  const openNew = () => {
    setColabEditando({
      matricula: "", nome: "", dataNascimento: "", cargo: "", contrato: "",
      dataAdmissao: "", turno: "", setor: unidadeLogada || "",
      horarioEspecial: "", motivoAfastamento: "", dataInicioAfastamento: "",
      quantidadeDiasAfastamento: 0, condicaoEspecial: "Nenhuma"
    });
    setIsNovo(true);
  };

  const openEdit = (c) => {
    setColabEditando({ ...c,
      setor: c.unidade_alocacao || c.setor, // Garante que o input recarregue o dado correto
      quantidadeDiasAfastamento: c.quantidadeDiasAfastamento ?? 0,
      condicaoEspecial: c.condicaoEspecial ?? 'Nenhuma'
    });
    setIsNovo(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
         <h2 className="text-2xl font-bold text-slate-800">Gestão de Colaboradores</h2>
         <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
           <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input type="text" placeholder="Buscar por Nome, Matrícula..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
           </div>
           {user?.role !== "Supervisão" && (
              <button onClick={openNew} className="w-full sm:w-auto whitespace-nowrap bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors text-sm shadow-sm flex items-center justify-center gap-2">
                 <Plus size={16}/> Cadastrar Colaborador
              </button>
           )}
         </div>
      </div>

      {transferenciasPendentes.length > 0 && (
        <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4 animate-fade-in shadow-sm">
          <h3 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2"><ArrowRightLeft size={16}/> Alertas de Transferência</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {transferenciasPendentes.map(t => (
              <div key={t.matricula} className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{t.nome_completo || t.nome}</p>
                  <p className="text-xs text-slate-500 mb-3 mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    Origem: <span className="font-bold text-indigo-700">{t.setor || t.unidade_alocacao}</span>
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => aceitarTransferencia(t)} className="flex-1 bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-emerald-600 transition-all shadow-sm">Aceitar</button>
                  <button onClick={() => recusarTransferencia(t)} className="flex-1 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold py-2 rounded-lg hover:bg-rose-100 transition-all shadow-sm">Recusar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200"><tr>{["Mat.","Nome","Cargo","Setor","Turno","Contrato","Status", "Ações"].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {lista.map(c => {
              const hoje = new Date();
              let badgeLabel = 'ATIVO';
              let badgeCls = 'bg-emerald-50 text-emerald-700 border-emerald-100';
              if (c.motivoAfastamento && c.dataInicioAfastamento && c.quantidadeDiasAfastamento) {
                const [sY, sM, sD] = c.dataInicioAfastamento.split('-').map(Number);
                const inicio = new Date(sY, sM - 1, sD);
                const fim = new Date(sY, sM - 1, sD + parseInt(c.quantidadeDiasAfastamento, 10) - 1);
                if (hoje >= inicio && hoje <= fim) {
                  badgeLabel = 'AFASTADO';
                  badgeCls = 'bg-amber-50 text-amber-700 border-amber-200';
                }
              }
              return (
                <tr key={c.matricula} className="hover:bg-slate-50">
                  <td className="p-4 font-mono text-slate-400">{c.matricula}</td>
                  <td className="p-4 font-bold text-slate-800">{c.nome_completo || c.nome}</td>
                  <td className="p-4 text-slate-600">{c.categoria_profissional || c.cargo}</td>
                  <td className="p-4 text-slate-600">{c.unidade_alocacao || c.setor}</td>
                  <td className="p-4 text-slate-600">{c.turno || c.turno_padrao}</td>
                  <td className="p-4"><span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded border border-indigo-100">{c.contrato || c.tipo_contrato}</span></td>
                  <td className="p-4"><span className={`text-xs font-bold px-2 py-0.5 rounded border ${badgeCls}`}>{badgeLabel}</span></td>
                  <td className="p-4">
                    {user?.role === "Supervisão" ? (
                      <span className="text-[10px] uppercase font-bold text-slate-400">Leitura</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} title="Editar" className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 rounded hover:bg-indigo-50"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(c)} title="Excluir" className="text-rose-500 hover:text-rose-700 transition-colors p-1 rounded hover:bg-rose-50"><Trash2 size={16}/></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {colabEditando && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden">
             <div className="bg-indigo-600 p-5 flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center gap-2">
                  {isNovo ? <Plus size={20}/> : <Edit2 size={20}/>}
                  {isNovo ? 'Cadastrar Colaborador' : 'Editar Colaborador'}
                </h3>
                <button onClick={() => { setColabEditando(null); setIsNovo(false); }} className="hover:bg-indigo-700 p-1.5 rounded-full transition-colors"><X size={20}/></button>
             </div>
             <form onSubmit={handleSave} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[85vh]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Matrícula</label>
                    <input required disabled={!isNovo} type="text" className={`w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:border-indigo-500 text-sm font-semibold text-slate-800 ${!isNovo ? 'bg-slate-100 text-slate-500' : ''}`} value={colabEditando.matricula || ''} onChange={e => setColabEditando({...colabEditando, matricula: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                    <input required type="text" className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:border-indigo-500 text-sm font-semibold text-slate-800" value={colabEditando.nome_completo || colabEditando.nome || ''} onChange={e => setColabEditando({...colabEditando, nome_completo: e.target.value, nome: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Nasc.</label>
                    <input required type="date" className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:border-indigo-500 text-sm font-semibold text-slate-800" value={colabEditando.dataNascimento || ''} onChange={e => setColabEditando({...colabEditando, dataNascimento: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Admissão</label>
                    <input required type="date" className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:border-indigo-500 text-sm font-semibold text-slate-800" value={colabEditando.dataAdmissao || ''} onChange={e => setColabEditando({...colabEditando, dataAdmissao: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Função (Cargo)</label>
                    <input required type="text" className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:border-indigo-500 text-sm font-semibold text-slate-800" value={colabEditando.cargo || colabEditando.categoria_profissional || ''} onChange={e => setColabEditando({...colabEditando, cargo: e.target.value, categoria_profissional: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contrato</label>
                    <select required className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-indigo-50/30 text-sm font-semibold text-slate-800" value={colabEditando.contrato || colabEditando.tipo_contrato || ''} onChange={e => setColabEditando({...colabEditando, contrato: e.target.value, tipo_contrato: e.target.value})}>
                      <option value="">Selecione...</option>
                      <option value="HC30">HC30</option>
                      <option value="HC35">HC35</option>
                      <option value="HC40">HC40</option>
                      <option value="FFM40">FFM40</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Turno de Trab.</label>
                    <select required className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-indigo-50/30 text-sm font-semibold text-slate-800" value={colabEditando.turno || colabEditando.turno_padrao || ''} onChange={e => setColabEditando({...colabEditando, turno: e.target.value, turno_padrao: e.target.value})}>
                      <option value="">Selecione...</option><option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Diurno 12x36">Diurno 12x36</option><option value="Noturno 12x36">Noturno 12x36</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Setor / Unidade</label>
                    <input required type="text" className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-indigo-50/30 text-sm font-semibold text-slate-800" value={colabEditando.setor || ''} onChange={e => setColabEditando({...colabEditando, setor: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Condição Especial de Trabalho</label>
                  <select className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-indigo-50/30 text-sm font-semibold text-slate-800" value={colabEditando.condicaoEspecial || 'Nenhuma'} onChange={e => setColabEditando({...colabEditando, condicaoEspecial: e.target.value})}>
                    <option value="Nenhuma">Nenhuma</option>
                    <option value="Restrição de Trabalho Compatível (RTC)">Restrição de Trabalho Compatível (RTC)</option>
                    <option value="Gestante">Gestante</option>
                    <option value="Lactante">Lactante</option>
                  </select>
                </div>

                {(colabEditando.turno === 'Manhã' || colabEditando.turno === 'Tarde') && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                       <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded cursor-pointer" checked={!!colabEditando.horarioEspecial} onChange={e => setColabEditando({...colabEditando, horarioEspecial: e.target.checked ? "07h as 13h" : ""})} />
                       Possui horário especial?
                    </label>
                    {!!colabEditando.horarioEspecial && (
                       <input type="text" className="w-full mt-3 border border-slate-300 p-2 rounded-lg text-sm font-medium outline-none focus:border-indigo-500" placeholder="Ex: 08h as 14h" value={colabEditando.horarioEspecial} onChange={e => setColabEditando({...colabEditando, horarioEspecial: e.target.value})} />
                    )}
                  </div>
                )}
                
                {!isNovo && (
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl mt-2 flex flex-col gap-3">
                    <h4 className="font-bold text-rose-800 text-sm">Incluir Afastamento</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Início</label>
                        <input type="date" className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:border-rose-500 text-sm font-semibold text-slate-800" value={colabEditando.dataInicioAfastamento || ''} onChange={e => setColabEditando({...colabEditando, dataInicioAfastamento: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motivo</label>
                        <select className="w-full border border-slate-300 p-2.5 rounded-xl outline-none focus:border-rose-500 text-sm font-semibold text-slate-800" value={colabEditando.motivoAfastamento || ''} onChange={e => {
                          const motivo = e.target.value;
                          const diasPadrao = { '14': 120, '27': 8, '28': 8, '11': 5 };
                          const codigo = motivo.split('-')[0];
                          const precisaDigitar = ['16', '17'].includes(codigo);
                          const qtdAuto = diasPadrao[codigo] || 1;
                          setColabEditando({
                            ...colabEditando,
                            motivoAfastamento: motivo,
                            quantidadeDiasAfastamento: precisaDigitar ? (colabEditando.quantidadeDiasAfastamento || '') : qtdAuto
                          });
                        }}>
                          <option value="">Nenhum...</option>
                          {MOTIVOS_AFASTAMENTO.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>
                    {colabEditando.motivoAfastamento && (() => {
                      const cod = colabEditando.motivoAfastamento.split('-')[0];
                      const precisaDigitar = ['16', '17'].includes(cod);
                      return (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Qtd. de Dias {precisaDigitar ? <span className="text-rose-600">*</span> : <span className="text-slate-400">(preenchido automaticamente)</span>}
                          </label>
                          <input
                            type="number" min="1"
                            required={precisaDigitar}
                            readOnly={!precisaDigitar}
                            className={`w-full border p-2.5 rounded-xl outline-none text-sm font-semibold text-slate-800 ${
                              precisaDigitar ? 'border-rose-400 focus:border-rose-600 bg-white' : 'border-slate-200 bg-slate-100 text-slate-500'
                            }`}
                            value={colabEditando.quantidadeDiasAfastamento || ''}
                            onChange={e => precisaDigitar && setColabEditando({...colabEditando, quantidadeDiasAfastamento: parseInt(e.target.value) || ''})}
                            placeholder={precisaDigitar ? 'Informe os dias...' : ''}
                          />
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-2">
                  <button type="button" onClick={() => { setColabEditando(null); setIsNovo(false); }} className="text-slate-500 font-bold px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors text-sm">Cancelar</button>
                  <button type="submit" className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors text-sm">{isNovo ? 'Cadastrar Colaborador' : 'Salvar Alterações'}</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PlanejamentoQuantPage (Mock Visualização)
// ─────────────────────────────────────────────────────────────────────────────
function PlanejamentoQuantPage() {
  const [mesAtual, setMesAtual] = useState(new Date());
  
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const nomeMes = `${meses[mesAtual.getMonth()]} ${mesAtual.getFullYear()}`;
  const diasMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();
  const primeiroDiaSemana = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).getDay();
  
  const cards = Array.from({length: diasMes}).map((_, i) => {
      const enfEsc = 4 + (i % 2);
      const enfAus = (i % 5 === 0) ? 1 : 0;
      const tecEsc = 10 + (i % 3);
      const tecAus = (i % 4 === 0) ? 2 : (i % 7 === 0) ? 1 : 0;
      
      return { 
        dia: i+1, 
        enf: { min: 4, esc: enfEsc, pres: enfEsc - enfAus, aus: enfAus, rem: 0 },
        tec: { min: 10, esc: tecEsc, pres: tecEsc - tecAus, aus: tecAus, rem: (i % 6 === 0) ? 1 : 0 }
      };
  });

  const prevMonth = () => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  const nextMonth = () => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 hover:text-indigo-600 transition-colors">Planejamento Quantitativo Mensal</h2>
          <p className="text-sm font-medium text-slate-500">Estimativas numéricas do mês agrupadas por categoria.</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1.5 rounded-xl shadow-sm hover:shadow transition-shadow">
           <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white hover:text-indigo-600 text-slate-500 transition-colors shadow-sm"><ChevronLeft size={20}/></button>
           <span className="font-black text-slate-700 text-sm capitalize w-36 text-center">{nomeMes}</span>
           <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white hover:text-indigo-600 text-slate-500 transition-colors shadow-sm"><ChevronRight size={20}/></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 py-1.5 rounded outline outline-1 outline-slate-200">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
         {Array.from({length: primeiroDiaSemana}).map((_, i) => (
            <div key={`blank-${i}`} className="p-2"></div>
         ))}
         {cards.map(c => {
            const hasShortage = c.enf.pres < c.enf.min || c.tec.pres < c.tec.min;
            const bgClass = hasShortage ? 'bg-yellow-100 border-yellow-300' : 'bg-green-100 border-green-300';
            const textClass = hasShortage ? 'text-yellow-800' : 'text-green-800';

            return (
            <div key={c.dia} className={`border rounded-xl p-2 shadow-sm flex flex-col hover:shadow-md transition-shadow hover:border-indigo-300 ${bgClass}`}>
              <div className={`font-bold pb-1 mb-1 border-b flex justify-between items-center transition-colors ${hasShortage ? 'border-yellow-200 text-yellow-900' : 'border-green-200 text-green-900'}`}>
                 <span className="text-xs">Dia {String(c.dia).padStart(2, '0')}</span>
                 {(c.enf.aus > 0 || c.tec.aus > 0) && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Ausência"></span>}
              </div>
              
              <div className="text-[9px] font-bold text-indigo-700 bg-indigo-50 py-0.5 px-1 text-center rounded border border-indigo-100 mb-0.5 tracking-wide">ENF</div>
              <div className="flex justify-between text-[8px] leading-tight px-0.5"><span className="text-slate-500">MÍN/ESC</span><span className="font-bold text-slate-700">{c.enf.min}/{c.enf.esc}</span></div>
              <div className="flex justify-between text-[8px] leading-tight px-0.5"><span className="text-slate-500">PRES/AUS</span><span className={`font-bold ${c.enf.aus > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{c.enf.pres}/{c.enf.aus}</span></div>

              <div className="text-[9px] font-bold text-teal-700 bg-teal-50 py-0.5 px-1 text-center rounded border border-teal-100 mt-1 mb-0.5 tracking-wide">TÉC</div>
              <div className="flex justify-between text-[8px] leading-tight px-0.5"><span className="text-slate-500">MÍN/ESC</span><span className="font-bold text-slate-700">{c.tec.min}/{c.tec.esc}</span></div>
              <div className="flex justify-between text-[8px] leading-tight px-0.5"><span className="opacity-70">PRES/AUS</span><span className={`font-bold ${c.tec.aus > 0 ? 'text-rose-600' : 'font-black'}`}>{c.tec.pres}/{c.tec.aus}</span></div>
            </div>
          );
         })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RemanejamentoTab
// ─────────────────────────────────────────────────────────────────────────────

function RemanejamentoTab({ colaboradores, user, filtroGlobalSetor, setores }) {
  const dataAtual = new Date();
  const dataHojeInput = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth()+1).padStart(2,'0')}-${String(dataAtual.getDate()).padStart(2,'0')}`;
  
  const [matColab, setMatColab] = useState("");
  const [destino, setDestino] = useState("");
  const [dataRem, setDataRem] = useState(dataHojeInput);
  const [turnoRem, setTurnoRem] = useState("Manhã");
  const [motivoRem, setMotivoRem] = useState("");
  const [remanejamentos, setRemanejamentos] = useState([]);

  const colabEncontrado = matColab ? colaboradores.find(c => String(c.matricula) === String(matColab)) : null;

  function handleSalvar(e) {
    e.preventDefault();
    if (!colabEncontrado) return alert("Selecione um colaborador válido.");
    if (!destino) return alert("Selecione o setor de destino.");
    
    const [anoStr, mesStr, diaStr] = dataRem.split('-');
    const diaF = parseInt(diaStr, 10);
    const mesF = parseInt(mesStr, 10) - 1;
    const anoF = parseInt(anoStr, 10);
    const dataFormatada = `${String(diaF).padStart(2, '0')}/${String(mesF + 1).padStart(2, '0')}/${anoF}`;

    setRemanejamentos(prev => [{
      id: Date.now(),
      colaborador: colabEncontrado.nome || colabEncontrado.nome_completo,
      matricula: colabEncontrado.matricula,
      origem: colabEncontrado.setor || colabEncontrado.unidade_alocacao,
      destino,
      data: dataFormatada,
      dia: diaF, mes: mesF, ano: anoF,
      turno: turnoRem,
      motivo: motivoRem || "Necessidade do Serviço"
    }, ...prev]);

    alert("Remanejamento registrado com sucesso!");
    setMatColab(""); setDestino(""); setMotivoRem("");
  }

  const [anoH, mesH, diaH] = dataHojeInput.split('-').map(Number);
  const remsHoje = remanejamentos.filter(r => r.dia === diaH && r.mes === (mesH - 1) && r.ano === anoH);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
       <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><ArrowRightLeft className="text-indigo-600" /> Remanejamento de Colaboradores</h2>
       
       {user?.role !== "Plantão Assistencial" && (
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8 shadow-inner animate-fade-in">
            <h3 className="font-bold text-indigo-800 mb-4">Registrar Novo Remanejamento</h3>
            <form onSubmit={handleSalvar} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-indigo-900 mb-1">Selecionar Colaborador</label>
                <select className="w-full border border-indigo-200 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400" value={matColab} onChange={e => setMatColab(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {colaboradores.filter(c => (c.condicao_especial || c.condicaoEspecial) !== "Inativo").map(c => <option key={c.matricula} value={c.matricula}>{c.nome_completo || c.nome} ({c.categoria_profissional || c.cargo})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Origem (Atual)</label>
                <input type="text" className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold outline-none" value={colabEncontrado ? (colabEncontrado.setor || colabEncontrado.unidade_alocacao) : ""} disabled />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-900 mb-1">Destino</label>
                <select className="w-full border border-indigo-200 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400" value={destino} onChange={e => setDestino(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {setores.filter(s => !colabEncontrado || s.nome !== (colabEncontrado.setor || colabEncontrado.unidade_alocacao)).map(s => <option key={s.nome} value={s.nome}>{s.nome}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <div className="flex gap-2 w-full">
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-indigo-900 mb-1">Data</label>
                     <input type="date" className="w-full border border-indigo-200 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400" value={dataRem} onChange={e => setDataRem(e.target.value)} required />
                   </div>
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-indigo-900 mb-1">Turno</label>
                     <select className="w-full border border-indigo-200 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400" value={turnoRem} onChange={e => setTurnoRem(e.target.value)} required>
                       <option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Noite">Noite</option>
                     </select>
                   </div>
                </div>
              </div>
              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-indigo-900 mb-1">Motivo (Opcional)</label>
                <input type="text" className="w-full border border-indigo-200 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400" value={motivoRem} onChange={e => setMotivoRem(e.target.value)} placeholder="Ex: Cobrir furo de escala, Alta demanda, etc." />
              </div>
              <div className="md:col-span-1 flex justify-end">
                <button type="submit" className="bg-indigo-600 text-white font-bold w-full py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md">Confirmar</button>
              </div>
            </form>
          </div>
       )}

       <h3 className="font-bold text-slate-800 mb-4">Remanejamentos Realizados (Hoje)</h3>
       <div className="overflow-x-auto rounded-xl border border-slate-200">
         <table className="w-full text-left border-collapse text-sm">
           <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
             <tr><th className="p-4">Colaborador</th><th className="p-4">De (Origem)</th><th className="p-4">Para (Destino)</th><th className="p-4">Data/Turno</th><th className="p-4">Motivo</th></tr>
           </thead>
           <tbody className="divide-y divide-slate-100 bg-white">
             {remsHoje.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-slate-500 italic">Nenhum remanejamento registrado para a data de hoje.</td></tr>}
             {remsHoje.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                   <td className="p-4 font-bold text-slate-800">{r.colaborador}</td>
                   <td className="p-4 text-slate-500"><span className="bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">{r.origem}</span></td>
                   <td className="p-4 text-emerald-600 font-bold"><span className="bg-emerald-50 px-2 py-1 rounded text-xs border border-emerald-200">{r.destino}</span></td>
                   <td className="p-4 text-slate-600 font-medium">{r.data} • {r.turno}</td>
                   <td className="p-4 text-xs italic text-slate-400">{r.motivo}</td>
                </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────
export default function Planejamento() {
  const { user, filtroGlobalSetor } = useAuth();
  const unidadeLogada = user?.unidadeLogada || "";
  
  const userRoles = [user?.role, user?.perfil_secundario].filter(Boolean);

  const perfisGlobais = ['Diretor', 'Supervisão', 'Supervisão Plantonista', 'Secretaria', 'Administrador'];
  const perfisLocais = ['Colaborador', 'Plantão Assistencial', 'Liderança 1', 'Liderança 2'];

  const dataAtual = new Date();
  const [setores,        setSetores]       = useState([]);
  const [colaboradores,  setColaboradores] = useState([]);
  const [escalaNominal,  setEscalaNominal] = useState([]);
  const [ausencias,      setAusencias]     = useState([]);

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingDados, setLoadingDados] = useState(true);

  useEffect(() => {
    if (userRoles.length > 0) {
      setLoadingAuth(false);
    }
  }, [userRoles.length]);

  useEffect(() => {
    if (loadingAuth || userRoles.length === 0) return;

    const isGlobal = userRoles.some(role => perfisGlobais.includes(role));
    const isLocalOnly = !isGlobal;

    if (isLocalOnly && !unidadeLogada) {
      setLoadingDados(false);
      return;
    }

    async function carregarDados() {
      setLoadingDados(true);
      try {
        const { data: sData } = await supabase.from('setores_unidades').select('*');
        if (sData) setSetores(sData);

        // Busca todos e formata no JS para garantir compatibilidade entre colunas maiúsculas/minúsculas
        const { data, error } = await supabase.from('colaboradores').select('*');

        if (error) {
          console.error('Erro do Supabase:', error);
        }

        if (data) {
          // Mapeamento para camelCase (usado no restante deste componente)
          const colaboradoresFormatados = data.map(c => ({
            matricula: c.Matricula || c.matricula,
            nome: c.Nome_Completo || c.nome_completo,
            nome_completo: c.Nome_Completo || c.nome_completo,
            categoria_profissional: c.Categoria_Profissional || c.categoria_profissional,
            cargo: c.Categoria_Profissional || c.categoria_profissional,
            unidade_alocacao: c.Unidade_Alocacao || c.unidade_alocacao,
            setor: c.Unidade_Alocacao || c.unidade_alocacao,
            vinculo: c.Vinculo || c.vinculo,
            turno_padrao: c.Turno_Padrao || c.turno_padrao,
            contrato: c.Vinculo || c.vinculo || c.Contrato || c.contrato,
            status: c.Status_Atual || c.Status || c.status_atual || c.status || 'Ativo',
            dataNascimento: c.Data_Nascimento || c.data_nascimento,
            dataAdmissao: c.Data_Admissao || c.data_admissao,
            cargaHoraria: c.Carga_Horaria_Mensal || c.carga_horaria_mensal || 0,
            motivoAfastamento: c.Motivo_Afastamento || c.motivoAfastamento,
            dataInicioAfastamento: c.Data_Inicio_Afastamento || c.dataInicioAfastamento,
            quantidadeDiasAfastamento: c.Quantidade_Dias_Afastamento || c.quantidadeDiasAfastamento || 0,
            condicaoEspecial: c.Condicao_Especial || c.condicaoEspecial || 'Nenhuma'
          }));

          // Filtrar apenas ativos
          let listaFinal = colaboradoresFormatados.filter(c => 
            (c.status || '').toLowerCase().includes('ativo')
          );

          // Filtrar por setor (Unidade de Alocação)
          if (isLocalOnly) {
            listaFinal = listaFinal.filter(c => (c.unidade_alocacao || '').toUpperCase() === (unidadeLogada || '').toUpperCase());
          } else if (isGlobal && filtroGlobalSetor && filtroGlobalSetor !== 'Todos') {
            listaFinal = listaFinal.filter(c => (c.unidade_alocacao || '').toUpperCase() === (filtroGlobalSetor || '').toUpperCase());
          }
          
          const isOnlySupervisao = isGlobal && !userRoles.includes('Administrador') && !userRoles.includes('Diretor');
          
          if (isOnlySupervisao) {
              listaFinal = listaFinal.filter(c => {
                 const cat = c.categoria_profissional || "";
                 return !cat.includes('Enfermeir') && !cat.includes('Liderança') && !cat.includes('Assistencial');
              });
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
    { id: "meu_painel",           label: "Meu Painel",           icon: <Home size={16}/>,             allowedRoles: ['ALL'] },
    { id: "plantao_diario",       label: "Plantão Diário",       icon: <Clock size={16}/>,            allowedRoles: ['Plantão Assistencial', 'Liderança 2', 'Liderança 1', 'Diretor'] },
    { id: "planejamento_diario",  label: "Planejamento Diário",  icon: <Calendar size={16}/>,         allowedRoles: ['Plantão Assistencial', 'Liderança 2', 'Liderança 1', 'Diretor', 'Supervisão', 'Supervisão Plantonista'] },
    { id: "escala_nominal",       label: "Fazer Escala",         icon: <CalendarDays size={16}/>,     allowedRoles: ['Liderança 2', 'Liderança 1', 'Diretor'] },
    { id: "escala",               label: "Planejamento Mensal",  icon: <CalendarDays size={16}/>,     allowedRoles: ['Liderança 2', 'Liderança 1', 'Diretor'] },
    { id: "ausencias",            label: "Ausências",            icon: <UserMinus size={16}/>,        allowedRoles: ['Liderança 2', 'Liderança 1', 'Diretor'] },
    { id: "setores",              label: "Setores Config.",      icon: <Building size={16}/>,         allowedRoles: ['Liderança 2', 'Liderança 1', 'Diretor'] },
    { id: "remanejamento",        label: "Remanejamento",        icon: <ArrowRightLeft size={16}/>,   allowedRoles: ['Liderança 2', 'Liderança 1', 'Diretor'] },
    { id: "gestao_colab",         label: "Gestão de Colab.",     icon: <Users size={16}/>,            allowedRoles: ['Liderança 1', 'Secretaria'] },
    { id: "relatorio",            label: "Relatório Gerencial",  icon: <TrendingUp size={16}/>,       allowedRoles: ['Liderança 1'] },
    { id: "visao_estrategica",    label: "Visão Estratégica",    icon: <Eye size={16}/>,              allowedRoles: ['Diretor'] },
    { id: "auditoria_escalas",    label: "Auditoria de Escalas", icon: <ShieldCheck size={16}/>,      allowedRoles: ['Diretor'] },
    { id: "config_dimensionamento", label: "Config. Dimensionamento", icon: <Ruler size={16}/>,      allowedRoles: ['Diretor'] },
    { id: "dashboard_global",     label: "Dashboard Global",     icon: <LayoutDashboard size={16}/>,  allowedRoles: ['Supervisão', 'Supervisão Plantonista'] },
  ];

  const botoes = TODOS_MODULOS.filter(modulo => 
    userRoles.includes('Administrador') || 
    modulo.allowedRoles.includes('ALL') || 
    userRoles.some(role => modulo.allowedRoles.includes(role))
  );

  if (loadingAuth || loadingDados) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-slate-500 font-medium">
            {loadingAuth ? 'Validando perfil de acesso (RBAC)...' : 'Carregando colaboradores do setor via Supabase...'}
          </p>
          <p className="text-slate-400 text-sm mt-1">{unidadeLogada || 'Verificando unidade...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Menu horizontal */}
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

      {pagina === "meu_painel" && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Bem-vindo ao Meu Painel</h2>
          <p className="text-slate-500">Módulo em desenvolvimento para visualização de escalas pessoais e avisos.</p>
        </div>
      )}
      {pagina === "plantao_diario" && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Plantão Diário</h2>
          <p className="text-slate-500">Módulo em desenvolvimento para gestão das atividades do dia.</p>
        </div>
      )}
      {pagina === "planejamento_diario" && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Planejamento Diário</h2>
          <p className="text-slate-500">Módulo em desenvolvimento para alocação detalhada por turno.</p>
        </div>
      )}
      {pagina === "escala_nominal" &&
        <FazerEscala
          colaboradores={colaboradores} setColaboradores={setColaboradores}
          escalaNominal={escalaNominal} setEscalaNominal={setEscalaNominal}
          ausencias={ausencias} unidadeLogada={unidadeLogada}
        />
      }
      {pagina === "escala"       && <PlanejamentoQuantPage />}
      {pagina === "ausencias"    && <AusenciasPage colaboradores={colaboradores} ausencias={ausencias} setAusencias={setAusencias} user={user} filtroGlobalSetor={filtroGlobalSetor} />}
      {pagina === "setores"      && <SetoresConfigPage setores={setores} setSetores={setSetores} unidadeLogada={unidadeLogada} />}
      {pagina === "gestao_colab" && <GestaoColabPage colaboradores={colaboradores} setColaboradores={setColaboradores} unidadeLogada={unidadeLogada} user={user} filtroGlobalSetor={filtroGlobalSetor}/>}
      {pagina === "remanejamento" && <RemanejamentoTab colaboradores={colaboradores} user={user} filtroGlobalSetor={filtroGlobalSetor} setores={setores} />}
      {pagina === "relatorio" && <RelatorioGerencial colaboradores={colaboradores} ausencias={ausencias} unidadeLogada={unidadeLogada} />}
      
      {["visao_estrategica", "auditoria_escalas", "config_dimensionamento", "dashboard_global"].includes(pagina) && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">{TODOS_MODULOS.find(m => m.id === pagina)?.label}</h2>
          <p className="text-slate-500">Módulo avançado em fase de planejamento.</p>
        </div>
      )}
    </div>
  );
}
