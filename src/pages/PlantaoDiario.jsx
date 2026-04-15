import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase'; 
import {
  ClipboardCheck, Users, Activity, Send, CheckCircle2,
  AlertCircle, BedDouble, AlertTriangle, ShieldAlert, X,
  Plus, ChevronDown, FileText, Biohazard, HeartPulse, Stethoscope, Package, Info, Search, Loader2, Filter
} from 'lucide-react';

// ─── Tipos de Alerta ─────────────────────────────────────────────────────────
const TIPOS_ALERTA = [
  { id: 'isolamentos',        label: 'Isolamentos',                tipo: 'isolamento',    icon: Biohazard   },
  { id: 'protocolo_agravo',   label: 'Protocolo de Agravo',        tipo: 'leitos',        icon: HeartPulse  },
  { id: 'acamados',           label: 'Pacientes Acamados',         tipo: 'leitos',        icon: BedDouble   },
  { id: 'traqueostomia',      label: 'Pacientes c/ Traqueostomia', tipo: 'leitos',        icon: Stethoscope },
  { id: 'falta_material',     label: 'Falta de Materiais Críticos', tipo: 'material',      icon: Package     },
  { id: 'demais_infos',       label: 'Demais Informações',         tipo: 'livre',         icon: Info        },
];

const TIPOS_ISOLAMENTO = [
  'Isolamento por Contacto',
  'Isolamento Respiratório',
  'Isolamento por Gotículas',
  'Isolamento Reverso',
];

// ─── Modal de Justificativa de Ausência ──────────────────────────────────────
function ModalAusencia({ colaborador, dados, onSalvar, onCancelar }) {
  const [motivo, setMotivo] = useState(dados?.motivo || '');
  const [obs, setObs] = useState(dados?.obs || '');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-rose-500 p-5 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2"><AlertCircle size={20}/> Justificativa de Ausência</h3>
          <button onClick={onCancelar} className="hover:bg-rose-600 p-1 rounded-full transition-colors"><X size={20}/></button>
        </div>
        <div className="p-6">
          <p className="text-sm font-bold text-slate-700 mb-4">Colaborador: <span className="text-rose-600">{colaborador?.nome}</span></p>
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Ausência *</label>
            <select
              autoFocus required
              className="w-full border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-400 bg-slate-50"
              value={motivo} onChange={e => setMotivo(e.target.value)}
            >
              <option value="">Selecione...</option>
              <option value="Afastamento médico">Afastamento médico</option>
              <option value="Outras justificativas">Outras justificativas</option>
              <option value="Falta não justificada">Falta não justificada</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Observações</label>
            <textarea
              rows="3" placeholder="Detalhes adicionais (opcional)..."
              className="w-full border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-400 bg-slate-50 resize-none"
              value={obs} onChange={e => setObs(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button onClick={onCancelar} className="text-slate-500 font-bold px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors text-sm">Cancelar</button>
            <button
              disabled={!motivo} onClick={() => onSalvar({ motivo, obs })}
              className="bg-rose-500 text-white font-bold px-6 py-2 rounded-xl hover:bg-rose-600 shadow-sm transition-colors text-sm disabled:opacity-40"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de Alerta Dinâmico ─────────────────────────────────────────────────
function ModalAlerta({ tipoDef, dadosExistentes, onSalvar, onRemover, onCancelar }) {
  const [form, setForm] = useState({
    tipoIsolamento: dadosExistentes?.tipoIsolamento || '',
    leitosPaciente: dadosExistentes?.leitosPaciente || '',
    quantidadeLeitos: dadosExistentes?.quantidadeLeitos || '',
    quaisLeitos: dadosExistentes?.quaisLeitos || '',
    materialDescricao: dadosExistentes?.materialDescricao || '',
    impacto: dadosExistentes?.impacto || '',
    textoLivre: dadosExistentes?.textoLivre || '',
  });

  const u = f => setForm(prev => ({ ...prev, ...f }));
  const Icon = tipoDef.icon;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-orange-500 p-5 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2"><Icon size={20}/> {tipoDef.label}</h3>
          <button onClick={onCancelar} className="hover:bg-orange-600 p-1 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <form className="p-6 flex flex-col gap-4" onSubmit={e => { e.preventDefault(); onSalvar(form); }}>
          {tipoDef.tipo === 'isolamento' && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Isolamento *</label>
                <select required className="w-full border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50"
                  value={form.tipoIsolamento} onChange={e => u({ tipoIsolamento: e.target.value })}>
                  <option value="">Selecione...</option>
                  {TIPOS_ISOLAMENTO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Leito(s) / Paciente(s) *</label>
                <input required type="text" placeholder="Ex: Leito 12 – João Silva" className="w-full border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50"
                  value={form.leitosPaciente} onChange={e => u({ leitosPaciente: e.target.value })} />
                <p className="text-[10px] text-slate-500 mt-1 ml-1">Separe por vírgulas se for mais de um.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Observações</label>
                <textarea rows="2" className="w-full border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 resize-none"
                  placeholder="Precauções adicionais..." value={form.textoLivre} onChange={e => u({ textoLivre: e.target.value })} />
              </div>
            </>
          )}

          {tipoDef.tipo === 'leitos' && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Leito(s) / Paciente(s) *</label>
                <input required type="text" placeholder="Ex: Leito 12 – João Silva" className="w-full border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50"
                  value={form.leitosPaciente} onChange={e => u({ leitosPaciente: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Observações</label>
                <textarea rows="2" className="w-full border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 resize-none"
                  placeholder="Detalhes adicionais..." value={form.textoLivre} onChange={e => u({ textoLivre: e.target.value })} />
              </div>
            </>
          )}

          {tipoDef.tipo === 'material' && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Descrição do Material *</label>
                <input required type="text" placeholder="Ex: Luvas descartáveis M, sonda vesical 14Fr" className="w-full border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50"
                  value={form.materialDescricao} onChange={e => u({ materialDescricao: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Impacto na Assistência</label>
                <textarea rows="2" className="w-full border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 resize-none"
                  placeholder="Descreva o impacto ou urgência..." value={form.impacto} onChange={e => u({ impacto: e.target.value })} />
              </div>
            </>
          )}

          {tipoDef.tipo === 'livre' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Informação *</label>
              <textarea required rows="5" className="w-full border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 resize-none"
                placeholder="Descreva a situação ou informação relevante para a equipa..." value={form.textoLivre} onChange={e => u({ textoLivre: e.target.value })} />
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            {dadosExistentes ? (
              <button type="button" onClick={onRemover} className="text-rose-600 font-bold px-4 py-2 hover:bg-rose-50 rounded-lg transition-colors text-sm">Remover Alerta</button>
            ) : <div />}
            <div className="flex gap-2">
              <button type="button" onClick={onCancelar} className="text-slate-500 font-bold px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors text-sm">Cancelar</button>
              <button type="submit" className="bg-orange-500 text-white font-bold px-6 py-2 rounded-xl hover:bg-orange-600 shadow-sm transition-colors text-sm">Salvar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function PlantaoDiario() {
  const { user, filtroGlobalSetor } = useAuth();
  
  const isSupervisao = user?.role === "Supervisão";
  const setorAplicado = (isSupervisao && filtroGlobalSetor) ? filtroGlobalSetor : (user?.unidadeLogada || "");
  
  // ─── Integração Supabase (Estados) ───
  const [colabsSetor, setColabsSetor] = useState([]);
  const [leitosTotais, setLeitosTotais] = useState(30);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [turno, setTurno] = useState('');
  const [filtroCargo, setFiltroCargo] = useState(''); // <-- Novo filtro
  const [buscaColaborador, setBuscaColaborador] = useState("");

  const [ocupados, setOcupados] = useState(0);
  const [bloqueados, setBloqueados] = useState(0);
  const leitosVagos = leitosTotais - (ocupados + bloqueados);

  const [presencas, setPresencas] = useState({});
  const [ausencias, setAusencias] = useState({});
  const [modalAusencia, setModalAusencia] = useState(null);

  const [alertas, setAlertas] = useState([]);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [modalAlerta, setModalAlerta] = useState(null);
  const dropRef = useRef(null);
  
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  const registrarAtualizacao = () => setUltimaAtualizacao(new Date());

  // ─── Efeito para buscar Dados Reais do Supabase ───
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);

      const { data: setoresData } = await supabase.from('setores_unidades').select('*');
      let setorFinal = setorAplicado;

      if (setoresData && setoresData.length > 0) {
        if (!setorFinal && !isSupervisao) {
          setorFinal = setoresData[0].Nome_Oficial || setoresData[0].nome_oficial; 
        }

        if (isSupervisao && !filtroGlobalSetor) {
          const totalCalc = setoresData.reduce((sum, s) => sum + (parseInt(s.Leitos_Operacionais || s.leitos_operacionais) || 0), 0);
          setLeitosTotais(totalCalc > 0 ? totalCalc : 30);
        } else {
          const infoSetor = setoresData.find(s => (s.Nome_Oficial || s.nome_oficial) === setorFinal);
          setLeitosTotais((infoSetor?.Leitos_Operacionais || infoSetor?.leitos_operacionais) ? parseInt(infoSetor?.Leitos_Operacionais || infoSetor?.leitos_operacionais) : 30);
        }
      }

      const { data: colabsData } = await supabase.from('colaboradores').select('*');
      if (colabsData) {
        const colaboradoresFormatados = colabsData.map(c => ({
          id: c.Matricula || c.matricula,
          nome: c.Nome_Completo || c.nome_completo,
          cargo: c.Categoria_Profissional || c.categoria_profissional,
          setor: c.Unidade_Alocacao || c.unidade_alocacao,
          matricula: c.Matricula || c.matricula,
          turno_padrao: c.Turno_Padrao || c.turno_padrao,
          status: c.Status_Atual || c.Status || c.status_atual || c.status
        })).filter(c => (c.status || '').toLowerCase().includes('ativo'));

        if (isSupervisao && !filtroGlobalSetor) {
          setColabsSetor(colaboradoresFormatados);
        } else {
          setColabsSetor(colaboradoresFormatados.filter(c => (c.setor || '').toUpperCase() === (setorFinal || '').toUpperCase()));
        }
      }

      setLoading(false);
    };

    carregarDados();
  }, [setorAplicado, isSupervisao, filtroGlobalSetor]);

  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownAberto(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ─── LÓGICA DE FILTROS ───
  
  // Extrair cargos únicos disponíveis neste setor para preencher o Dropdown
  const cargosDisponiveis = [...new Set(colabsSetor.map(c => c.cargo))].filter(Boolean).sort();

  // Mapeamento: se o Chefe escolher "Manhã", filtramos por 'M' ou 'D' (Diaristas), etc.
  const mapeamentoTurno = {
    'Manhã': ['M', 'D'],
    'Tarde': ['T', 'D'],
    'Noite': ['N', 'SN']
  };

  const colabsFiltrados = colabsSetor.filter(c => {
    // 1. Filtro de Texto (Nome)
    const matchNome = c.nome.toLowerCase().includes(buscaColaborador.toLowerCase());
    
    // 2. Filtro de Categoria (Cargo)
    const matchCargo = filtroCargo ? c.cargo === filtroCargo : true;
    
    // 3. Filtro de Turno (Baseado na seleção principal lá em cima)
    let matchTurno = true;
    if (turno && mapeamentoTurno[turno]) {
      const turnosPermitidos = mapeamentoTurno[turno];
      // Se não tiver turno cadastrado na BD, deixamos passar por segurança
      if (c.turno_padrao) {
        matchTurno = turnosPermitidos.includes(c.turno_padrao.toUpperCase());
      }
    }

    return matchNome && matchCargo && matchTurno;
  });

  // Contadores derivados baseados APENAS em quem foi filtrado
  const qtdPresentes = colabsFiltrados.filter(c => presencas[c.id] === true).length;
  const qtdAusentes  = colabsFiltrados.filter(c => presencas[c.id] === false).length;
  const pctOcupacao  = leitosTotais ? Math.round(((ocupados + bloqueados) / leitosTotais) * 100) : 0;

  function marcarTodosPresentes() {
    const p = { ...presencas };
    colabsFiltrados.forEach(c => { p[c.id] = true; }); // Só marca os filtrados!
    setPresencas(p);
  }

  function clicarPresenca(colab) {
    registrarAtualizacao();
    setPresencas(prev => {
      const atual = prev[colab.id];
      if (atual === undefined || atual === true) {
        if (atual !== false) setModalAusencia(colab);
        return { ...prev, [colab.id]: false };
      } else {
        setAusencias(a => { const n = { ...a }; delete n[colab.id]; return n; });
        return { ...prev, [colab.id]: true };
      }
    });
  }

  function confirmarAusencia(dados) {
    registrarAtualizacao();
    setAusencias(prev => ({ ...prev, [modalAusencia.id]: dados }));
    setModalAusencia(null);
  }

  function cancelarAusencia() {
    if (modalAusencia) {
      setPresencas(prev => ({ ...prev, [modalAusencia.id]: true }));
    }
    setModalAusencia(null);
  }

  function abrirNovoAlerta(tipoDef) {
    setModalAlerta({ tipoDef, uid: null, dadosExistentes: null });
    setDropdownAberto(false);
  }

  function abrirEditarAlerta(alerta) {
    setModalAlerta({ tipoDef: alerta.tipoDef, uid: alerta.uid, dadosExistentes: alerta.dados });
  }

  function salvarAlerta(dados) {
    registrarAtualizacao();
    setAlertas(prev => {
      if (modalAlerta.uid) {
        return prev.map(a => a.uid === modalAlerta.uid ? { ...a, dados } : a);
      } else {
        const uid = `${modalAlerta.tipoDef.id}_${Date.now()}`;
        return [...prev, { uid, tipoDef: modalAlerta.tipoDef, dados }];
      }
    });
    setModalAlerta(null);
  }

  function removerAlerta() {
    registrarAtualizacao();
    setAlertas(prev => prev.filter(a => a.uid !== modalAlerta.uid));
    setModalAlerta(null);
  }

  function enviarPlantao() {
    alert('Plantão diário registado com sucesso!');
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium">Carregando a equipa e o setor...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-6 relative">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="text-indigo-600"/> Plantão Diário — {(isSupervisao && !filtroGlobalSetor) ? 'Visão Global' : (setorAplicado || 'Meu Setor')}
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Registo de transição de turno e assiduidade</p>
          {ultimaAtualizacao && (
             <p className="text-xs font-bold text-emerald-600 mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded border border-emerald-100 animate-fade-in">
               Última informação registada: {ultimaAtualizacao.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
             </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm border border-slate-200">
            {new Date().toLocaleDateString('pt-BR')}
          </span>
          <select
            className="border border-slate-300 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700 text-sm shadow-sm"
            value={turno}
            onChange={e => {
              setTurno(e.target.value);
              // Ao trocar de turno, podemos resetar a busca para facilitar
              setBuscaColaborador(""); 
            }}
          >
            <option value="">Selecione o Turno...</option>
            <option value="Manhã">Manhã (07h – 13h)</option>
            <option value="Tarde">Tarde (13h – 19h)</option>
            <option value="Noite">Noite (19h – 07h)</option>
          </select>
        </div>
      </div>

      {!turno ? (
        <div className="bg-indigo-50 border border-indigo-100 p-12 rounded-2xl text-center flex flex-col items-center justify-center">
          <Activity className="text-indigo-300 w-16 h-16 mb-4"/>
          <h3 className="text-lg font-bold text-indigo-800">Aguardando Início do Plantão</h3>
          <p className="text-indigo-600/70 max-w-sm mt-2 font-medium">Selecione o turno acima para desbloquear o formulário e filtrar a sua equipa.</p>
        </div>
      ) : (
        <>
          {/* ── Cards de Resumo ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Equipe do Turno',  value: colabsFiltrados.length, color: 'indigo', icon: Users       },
              { label: 'Equipe Presente',  value: qtdPresentes,           color: 'emerald', icon: CheckCircle2 },
              { label: 'Ausências',        value: qtdAusentes,            color: 'rose',    icon: AlertTriangle },
              { label: 'Ocupação Leitos',  value: `${pctOcupacao}%`,      color: 'blue',    icon: BedDouble    },
            ].map(card => {
              const Icon = card.icon;
              const c = card.color;
              return (
                <div key={card.label} className={`bg-${c}-50 border border-${c}-100 p-4 rounded-2xl flex items-center gap-4 transition-all`}>
                  <div className={`bg-${c}-100 p-3 rounded-xl text-${c}-600`}><Icon size={22}/></div>
                  <div>
                    <p className={`text-xs font-bold text-${c}-700 uppercase`}>{card.label}</p>
                    <p className={`text-2xl font-black text-${c}-700`}>{card.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Check-in ── */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-5 gap-4">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg"><Users className="text-indigo-500"/> Checklist de Assiduidade Nominal</h3>
                <p className="text-xs text-slate-500 mt-1">Lista filtrada pelo turno da {turno}.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                {/* Novo Filtro de Categoria (Cargo) */}
                <div className="relative flex-1 min-w-[180px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                     <Filter size={16}/>
                  </div>
                  <select 
                    className="pl-9 pr-3 py-2 w-full border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700 bg-white shadow-sm"
                    value={filtroCargo}
                    onChange={e => setFiltroCargo(e.target.value)}
                  >
                    <option value="">Todas as Categorias</option>
                    {cargosDisponiveis.map(cargo => (
                       <option key={cargo} value={cargo}>{cargo}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro de Busca */}
                <div className="relative flex-1 min-w-[200px]">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                     <Search size={16}/>
                   </div>
                   <input 
                     type="text" 
                     placeholder="Buscar nome..." 
                     className="pl-9 pr-3 py-2 w-full border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700 bg-white shadow-sm"
                     value={buscaColaborador}
                     onChange={e => setBuscaColaborador(e.target.value)}
                   />
                </div>
                
                <button
                  onClick={marcarTodosPresentes}
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm active:scale-95 shrink-0"
                >
                  <CheckCircle2 size={16}/> <span className="hidden sm:inline">Marcar Visíveis</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl shadow-sm border border-slate-200 bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="p-4">Colaborador / Cargo</th>
                    <th className="p-4 text-center w-36">Status</th>
                    <th className="p-4">Justificativa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {colabsFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-slate-400 font-medium">
                        Nenhum colaborador encontrado com os filtros atuais.
                      </td>
                    </tr>
                  ) : (
                    colabsFiltrados.map(c => {
                      const isPresent = presencas[c.id];
                      const ausInfo   = ausencias[c.id];
                      const btnCls = isPresent === true
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : isPresent === false
                          ? 'bg-rose-500 hover:bg-rose-600'
                          : 'bg-slate-300 hover:bg-slate-400';

                      return (
                        <tr key={c.id} className={`transition-colors hover:bg-slate-50 ${isPresent === false ? 'bg-rose-50/30' : ''}`}>
                          <td className="p-4">
                            <div className="text-sm font-bold text-slate-800">{c.nome} <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-1 font-bold">Turno {c.turno_padrao || '?'}</span></div>
                            <div className="text-xs text-slate-500 mt-0.5">{c.cargo} • Mat: {c.matricula}</div>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => clicarPresenca(c)}
                              disabled={isSupervisao}
                              className={`h-8 w-24 rounded-full text-xs font-bold text-white transition-colors focus:outline-none ${btnCls} ${(isSupervisao) && 'opacity-70 cursor-not-allowed'}`}
                            >
                              {isPresent === true ? 'Presente' : isPresent === false ? 'Faltou' : 'Pendente'}
                            </button>
                          </td>
                          <td className="p-4">
                            {isPresent === false && ausInfo ? (
                              <button
                                onClick={() => { if(!isSupervisao) setModalAusencia(c); }}
                                disabled={isSupervisao}
                                className={`text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors ${!isSupervisao ? 'hover:bg-rose-100' : 'opacity-80 cursor-default'}`}
                              >
                                {ausInfo.motivo} {!isSupervisao && '— Editar'}
                              </button>
                            ) : (
                              <span className="text-slate-300 text-sm italic">
                                {isPresent === false ? 'Abrindo modal...' : '—'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Gestão de Leitos + Alertas ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leitos */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg mb-6"><BedDouble className="text-indigo-500"/> Gestão de Leitos</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
                  <p className="text-slate-500 text-xs font-bold uppercase">Leitos Totais</p>
                  <p className="text-3xl font-black text-slate-800 mt-2">{leitosTotais}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-100 text-center">
                  <p className="text-emerald-700 text-xs font-bold uppercase">Leitos Vagos</p>
                  <p className="text-3xl font-black text-emerald-600 mt-2">{Math.max(0, leitosVagos)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100 text-center">
                  <p className="text-blue-700 text-xs font-bold uppercase mb-2">Ocupados</p>
                  <input type="number" min="0" className="w-full text-center text-2xl font-black text-blue-800 border-none bg-white p-2 rounded-lg shadow-inner outline-none focus:ring-2 focus:ring-blue-400" value={ocupados} onChange={e => { setOcupados(parseInt(e.target.value) || 0); registrarAtualizacao(); }}/>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl shadow-sm border border-rose-100 text-center">
                  <p className="text-rose-700 text-xs font-bold uppercase mb-2">Bloqueados</p>
                  <input type="number" min="0" className="w-full text-center text-2xl font-black text-rose-800 border-none bg-white p-2 rounded-lg shadow-inner outline-none focus:ring-2 focus:ring-rose-400" value={bloqueados} onChange={e => { setBloqueados(parseInt(e.target.value) || 0); registrarAtualizacao(); }}/>
                </div>
              </div>
            </div>

            {/* Alertas */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg"><AlertCircle className="text-orange-500"/> Alertas da Unidade</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Registre situações que requerem atenção da supervisão.</p>
                </div>
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropdownAberto(v => !v)}
                    className="flex items-center gap-2 bg-orange-500 text-white font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors text-sm shadow-sm"
                  >
                    <Plus size={16}/> Incluir Alerta <ChevronDown size={14} className={`transition-transform ${dropdownAberto ? 'rotate-180' : ''}`}/>
                  </button>
                  {dropdownAberto && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-30 min-w-[220px] overflow-hidden">
                      {TIPOS_ALERTA.map(tipo => {
                        const Icon = tipo.icon;
                        const count = alertas.filter(a => a.tipoDef.id === tipo.id).length;
                        return (
                          <button
                            key={tipo.id}
                            onClick={() => abrirNovoAlerta(tipo)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-orange-50 text-left transition-colors border-b border-slate-100 last:border-0 ${count > 0 ? 'text-orange-600' : 'text-slate-700'}`}
                          >
                            <Icon size={16} className={count > 0 ? 'text-orange-500' : 'text-slate-400'}/>
                            {tipo.label}
                            {count > 0 && <span className="ml-auto bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {alertas.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-8">
                  <ShieldAlert size={36} className="mb-2"/>
                  <p className="text-sm font-medium">Nenhum alerta registado</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 overflow-y-auto max-h-48 pr-1">
                  {alertas.map(a => {
                    const Icon = a.tipoDef.icon;
                    const resumo = a.dados.leitosPaciente || a.dados.quaisLeitos || a.dados.materialDescricao || a.dados.textoLivre || '';
                    const clsMap = {
                      isolamento: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', iconBg: 'bg-orange-100', iconText: 'text-orange-600', badgeBg: 'bg-orange-200' },
                      material: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconBg: 'bg-red-100', iconText: 'text-red-600', badgeBg: 'bg-red-200' },
                      leitos: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', iconBg: 'bg-blue-100', iconText: 'text-blue-600', badgeBg: 'bg-blue-200' },
                      livre: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', iconBg: 'bg-slate-100', iconText: 'text-slate-600', badgeBg: 'bg-slate-200' },
                    };
                    const c = clsMap[a.tipoDef.tipo] || clsMap['livre'];

                    return (
                      <div key={a.uid} className={`flex items-start gap-3 ${c.bg} border ${c.border} p-3 rounded-xl transition-all`}>
                        <div className={`${c.iconBg} p-2 rounded-lg ${c.iconText} mt-0.5`}><Icon size={16}/></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold ${c.text}`}>{a.tipoDef.label}</p>
                            {a.tipoDef.tipo === 'isolamento' && a.dados.tipoIsolamento && (
                              <span className={`${c.badgeBg} ${c.text} text-[10px] px-2 py-0.5 rounded-full font-bold truncate`}>
                                {a.dados.tipoIsolamento}
                              </span>
                            )}
                          </div>
                          {resumo && <p className={`text-xs ${c.iconText} truncate mt-0.5`}>{resumo}</p>}
                        </div>
                        <button
                          onClick={() => abrirEditarAlerta(a)}
                          className={`text-[11px] ${c.iconText} font-semibold hover:underline shrink-0 mt-0.5`}
                        >
                          Editar
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-auto">
                {isSupervisao ? (
                   <div className="bg-slate-100 border border-slate-200 text-slate-600 font-bold px-8 py-4 rounded-2xl flex items-center gap-3 w-full justify-center text-sm mt-4">
                     <Info size={18}/> Modo Leitura: Plantão é gerido pela Chefia 1
                   </div>
                ) : (
                  <button
                    onClick={enviarPlantao}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold px-8 py-4 rounded-2xl hover:shadow-lg hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center gap-3 shadow-md w-full justify-center active:scale-[0.98] text-base mt-4"
                  >
                    <Send size={18}/> Salvar e Enviar Plantão Diário
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {modalAusencia && <ModalAusencia colaborador={modalAusencia} dados={ausencias[modalAusencia.id]} onSalvar={confirmarAusencia} onCancelar={cancelarAusencia} />}
      {modalAlerta && <ModalAlerta tipoDef={modalAlerta.tipoDef} dadosExistentes={modalAlerta.dadosExistentes} isEdicao={!!modalAlerta.uid} onSalvar={salvarAlerta} onRemover={removerAlerta} onCancelar={() => setModalAlerta(null)} />}
    </div>
  );
}