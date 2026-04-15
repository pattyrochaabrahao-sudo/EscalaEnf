import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase'; 
import {
  CalendarDays, Users, ClipboardList, Coffee, AlertCircle, 
  Search, Filter, Loader2, Save, FileText, CheckCircle2, MapPin
} from 'lucide-react';

// Opções padrão para o Planeamento (podem ser customizadas depois)
const OPCOES_ATIVIDADE = [
  'Cuidados Integrais (Leitos 01-05)',
  'Cuidados Integrais (Leitos 06-10)',
  'Medicação / Preparo',
  'Triagem / Acolhimento',
  'Chefia de Equipe',
  'Apoio / Corredor',
  'Rotina Administrativa'
];

const OPCOES_PAUSAS = [
  '09:00 - 09:15',
  '10:00 - 10:15',
  '11:00 - 12:00 (Almoço)',
  '12:00 - 13:00 (Almoço)',
  '15:00 - 15:15',
  '16:00 - 16:15',
  '21:00 - 22:00 (Jantar)',
  '02:00 - 04:00 (Descanso)',
  '04:00 - 06:00 (Descanso)'
];

export default function PlanejamentoDiario() {
  const { user, filtroGlobalSetor } = useAuth();
  const isSupervisao = user?.role === "Supervisão";
  const setorAplicado = (isSupervisao && filtroGlobalSetor) ? filtroGlobalSetor : (user?.unidadeLogada || "");

  const [colabsSetor, setColabsSetor] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [turno, setTurno] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');
  const [buscaColaborador, setBuscaColaborador] = useState("");

  // Estado do Planeamento: { colabId: { atividade: '', pausa: '', obs: '' } }
  const [planejamento, setPlanejamento] = useState({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      
      // Busca o setor oficial se não estiver definido
      let setorFinal = setorAplicado;
      if (!setorFinal && !isSupervisao) {
        const { data: setoresData } = await supabase.from('setores_unidades').select('*');
        if (setoresData && setoresData.length > 0) {
          setorFinal = setoresData[0].Nome_Oficial || setoresData[0].nome_oficial; 
        }
      }

      // Busca colaboradores
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

  // ─── LÓGICA DE FILTROS ───
  const cargosDisponiveis = [...new Set(colabsSetor.map(c => c.cargo))].filter(Boolean).sort();
  const mapeamentoTurno = { 'Manhã': ['M', 'D'], 'Tarde': ['T', 'D'], 'Noite': ['N', 'SN'] };

  const colabsFiltrados = colabsSetor.filter(c => {
    const matchNome = c.nome.toLowerCase().includes(buscaColaborador.toLowerCase());
    const matchCargo = filtroCargo ? c.cargo === filtroCargo : true;
    let matchTurno = true;
    if (turno && mapeamentoTurno[turno] && c.turno_padrao) {
      matchTurno = mapeamentoTurno[turno].includes(c.turno_padrao.toUpperCase());
    }
    return matchNome && matchCargo && matchTurno;
  });

  // ─── CONTADORES PARA OS CARDS ───
  // Apenas consideramos os colaboradores que estão visíveis no filtro atual
  const qtdEquipe = colabsFiltrados.length;
  const qtdEscala = colabsFiltrados.filter(c => planejamento[c.id]?.atividade).length;
  const qtdPausas = colabsFiltrados.filter(c => planejamento[c.id]?.pausa).length;
  const qtdObs = colabsFiltrados.filter(c => planejamento[c.id]?.obs).length;

  // ─── FUNÇÕES DE ATUALIZAÇÃO DO PLANEAMENTO ───
  const atualizarPlanejamento = (id, campo, valor) => {
    setPlanejamento(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { atividade: '', pausa: '', obs: '' }),
        [campo]: valor
      }
    }));
  };

  const salvarPlanejamento = async () => {
    setSalvando(true);
    // Simula um tempo de rede. Aqui você integrará o INSERT/UPDATE no Supabase na tabela de planejamento.
    setTimeout(() => {
      setSalvando(false);
      alert('Planejamento diário salvo com sucesso!');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium">Carregando a equipa para o planeamento...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-6 relative">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="text-indigo-600"/> Planejamento Diário — {(isSupervisao && !filtroGlobalSetor) ? 'Visão Global' : (setorAplicado || 'Meu Setor')}
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Atribuição de escalas, pausas e observações por turno</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm border border-slate-200 capitalize">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          <select
            className="border border-slate-300 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700 text-sm shadow-sm"
            value={turno}
            onChange={e => { setTurno(e.target.value); setBuscaColaborador(""); }}
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
          <CalendarDays className="text-indigo-300 w-16 h-16 mb-4"/>
          <h3 className="text-lg font-bold text-indigo-800">Selecione um Turno</h3>
          <p className="text-indigo-600/70 max-w-sm mt-2 font-medium">Escolha o turno acima para começar a distribuir as atividades da sua equipa.</p>
        </div>
      ) : (
        <>
          {/* ── Cards de Resumo ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Equipe do Turno', value: qtdEquipe, color: 'indigo', icon: Users },
              { label: 'Escala de Atividades', value: `${qtdEscala}/${qtdEquipe}`, color: 'blue', icon: ClipboardList },
              { label: 'Pausas Programadas', value: `${qtdPausas}/${qtdEquipe}`, color: 'emerald', icon: Coffee },
              { label: 'Intercorrências / Obs', value: qtdObs, color: 'orange', icon: AlertCircle },
            ].map((card, i) => {
              const Icon = card.icon;
              const c = card.color;
              return (
                <div key={i} className={`bg-${c}-50 border border-${c}-100 p-4 rounded-2xl flex items-center gap-4`}>
                  <div className={`bg-${c}-100 p-3 rounded-xl text-${c}-600`}><Icon size={22}/></div>
                  <div>
                    <p className={`text-xs font-bold text-${c}-700 uppercase`}>{card.label}</p>
                    <p className={`text-2xl font-black text-${c}-700`}>{card.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Distribuição de Atividades ── */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-5 gap-4">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg"><MapPin className="text-indigo-500"/> Distribuição de Atividades e Setores</h3>
                <p className="text-xs text-slate-500 mt-1">Configure a escala para o turno da {turno}.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                {/* Filtro de Cargo */}
                <div className="relative flex-1 min-w-[180px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Filter size={16}/></div>
                  <select 
                    className="pl-9 pr-3 py-2 w-full border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700 bg-white shadow-sm"
                    value={filtroCargo} onChange={e => setFiltroCargo(e.target.value)}
                  >
                    <option value="">Todas as Categorias</option>
                    {cargosDisponiveis.map(cargo => (
                       <option key={cargo} value={cargo}>{cargo}</option>
                    ))}
                  </select>
                </div>

                {/* Busca */}
                <div className="relative flex-1 min-w-[200px]">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Search size={16}/></div>
                   <input 
                     type="text" placeholder="Buscar nome..." 
                     className="pl-9 pr-3 py-2 w-full border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700 bg-white shadow-sm"
                     value={buscaColaborador} onChange={e => setBuscaColaborador(e.target.value)}
                   />
                </div>
              </div>
            </div>

            {/* Tabela de Planeamento */}
            <div className="overflow-x-auto rounded-xl shadow-sm border border-slate-200 bg-white">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="p-4 w-1/3">Colaborador / Cargo</th>
                    <th className="p-4 w-1/4">Atividade / Setor</th>
                    <th className="p-4 w-1/4">Pausa / Intervalo</th>
                    <th className="p-4 w-auto">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {colabsFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-400 font-medium">
                        Nenhum colaborador encontrado para o turno da {turno}.
                      </td>
                    </tr>
                  ) : (
                    colabsFiltrados.map(c => {
                      const dados = planejamento[c.id] || { atividade: '', pausa: '', obs: '' };
                      return (
                        <tr key={c.id} className="transition-colors hover:bg-slate-50">
                          {/* Colaborador Info */}
                          <td className="p-4">
                            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              {c.nome}
                              <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold">T: {c.turno_padrao || '?'}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{c.cargo} • Mat: {c.matricula}</div>
                          </td>
                          
                          {/* Atividade */}
                          <td className="p-4">
                            <select
                              className={`w-full p-2 border rounded-lg text-sm font-medium outline-none transition-colors ${dados.atividade ? 'border-indigo-300 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-slate-50 text-slate-600 focus:border-indigo-400'}`}
                              value={dados.atividade}
                              onChange={e => atualizarPlanejamento(c.id, 'atividade', e.target.value)}
                              disabled={isSupervisao}
                            >
                              <option value="">Atribuir Atividade...</option>
                              {OPCOES_ATIVIDADE.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </td>

                          {/* Pausa */}
                          <td className="p-4">
                            <select
                              className={`w-full p-2 border rounded-lg text-sm font-medium outline-none transition-colors ${dados.pausa ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-600 focus:border-emerald-400'}`}
                              value={dados.pausa}
                              onChange={e => atualizarPlanejamento(c.id, 'pausa', e.target.value)}
                              disabled={isSupervisao}
                            >
                              <option value="">Definir Pausa...</option>
                              {OPCOES_PAUSAS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </td>

                          {/* Observações */}
                          <td className="p-4">
                            <div className="relative group">
                              <input
                                type="text"
                                placeholder="Adicionar Obs..."
                                className={`w-full p-2 border rounded-lg text-sm outline-none transition-colors ${dados.obs ? 'border-orange-300 bg-orange-50 text-orange-800' : 'border-slate-200 bg-slate-50 text-slate-600 focus:border-orange-400'}`}
                                value={dados.obs}
                                onChange={e => atualizarPlanejamento(c.id, 'obs', e.target.value)}
                                disabled={isSupervisao}
                              />
                              <FileText className="absolute right-2 top-2.5 text-slate-400 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" size={16}/>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Ações Inferiores */}
            <div className="mt-6 flex justify-end">
              {!isSupervisao && (
                <button
                  onClick={salvarPlanejamento}
                  disabled={salvando || colabsFiltrados.length === 0}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {salvando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Salvar Planejamento
                </button>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}