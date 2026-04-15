import React, { useState, useEffect } from "react";
import { Users, Calendar, CalendarDays, ClipboardCheck, UserMinus, Activity, LayoutDashboard, CheckCircle, AlertTriangle, ArrowRightLeft, Building, Send, Lock, LogOut, User, Search, X, ChevronLeft, ChevronRight, Filter, TrendingUp, TrendingDown, Minus, UserPlus, Edit2, Save, Trash2, Plus } from 'lucide-react';

const LISTA_UI = ["03PA", "03CA", "03DN", "03DS", "04DN", "04DS", "05DN", "05DS", "06DN", "06DS", "06AA", "06CC", "06GS", "06GN", "07DN", "07DS", "07CC", "07AA", "07GN", "07GS", "08DN", "08DS", "08EE", "08AA", "08CC", "08GN", "08GS", "08VEG", "09DN", "09DS", "09CC", "09GN", "09GS", "10DN", "10DS", "10GS","10GN"];
const LISTA_UTI = ["04GS", "05DS", "AA08", "AA09", "09B1(UAN)", "11FF", "11DN", "11EE", "11GS", "11DS", "11GN"];
const LISTA_EMERG = ["04CC", "04UDC", "04AB-OBS", "EMERG CLINICA", "EMERG CIRÚRGICA", "EMERG CIRÚRGICA II", "PS Otorrino/Oftalmo", "Acolhimento e Classificação de Risco", "Sala de Procedimentos/Endoscopia"];
const LISTA_ESP = ["CETIP", "CENTRO OBSTÉTRICO", "CENTRO CIRÚRGICO", "CEIC","CME"];

const LISTA_CONTRATOS = ["HC30", "HC40", "HC + FM35", "HC + FM40 (PAR)", "HC + FM40 (IMPAR)", "FM40"];

const SETORES_INICIAIS = [
  ...LISTA_UI.map(nome => ({ nome, grupo: "Unidades de Internação", leitosOperacionais: 20, minEnf: 2, minTec: 6 })),
  ...LISTA_UTI.map(nome => ({ nome, grupo: "UTI's", leitosOperacionais: 10, minEnf: 3, minTec: 5 })),
  ...LISTA_EMERG.map(nome => ({ nome, grupo: "Emergência Referenciada", leitosOperacionais: 15, minEnf: 4, minTec: 8 })),
  ...LISTA_ESP.map(nome => ({ nome, grupo: "Áreas Especializadas", leitosOperacionais: 10, minEnf: 1, minTec: 2 })),
  { nome: "C.O", grupo: "Blocos Cirúrgicos", leitosOperacionais: 12, minEnf: 2, minTec: 4 }
];

const COLABORADORES_INICIAIS = (() => {
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth();
  const anoAtual = dataAtual.getFullYear();
  const diaHoje = dataAtual.getDate();
  const dataHojeInputForInit = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(diaHoje).padStart(2, '0')}`;

  let idCounter = 7;
  const gerados = [
    { id: 1, matricula: "1001", nome: "Maria Silva", sexo: "Feminino", dataNascimento: "1985-05-12", dataAdmissao: "2015-02-10", cargo: "Enfermeira", setor: LISTA_UI[0], status: "Ativo", vinculo: "HC", contrato: "HC30", turno: "diurno 12h", diasLicenca: 0, dataInicioLicenca: "", cargaHoraria: 144 },
    { id: 2, matricula: "1002", nome: "João Souza", sexo: "Masculino", dataNascimento: "1990-08-22", dataAdmissao: "2018-04-05", cargo: "Técnico", setor: LISTA_UI[0], status: "Licença Médica", vinculo: "FFM", contrato: "FM40", turno: "noturno 12h", diasLicenca: 15, dataInicioLicenca: dataHojeInputForInit, cargaHoraria: 192 },
    { id: 3, matricula: "1003", nome: "Ana Costa", sexo: "Feminino", dataNascimento: "1988-11-30", dataAdmissao: "2012-09-15", cargo: "Técnico", setor: LISTA_UTI[0], status: "Gestante", vinculo: "HC", contrato: "HC + FM 35", turno: "6h manhã", diasLicenca: 0, dataInicioLicenca: "", cargaHoraria: 168 },
    { id: 4, matricula: "1004", nome: "Carlos Mendes", sexo: "Masculino", dataNascimento: "1982-01-18", dataAdmissao: "2010-06-20", cargo: "Enfermeira", setor: LISTA_EMERG[0], status: "Ativo", vinculo: "HC", contrato: "HC40", turno: "diurno 12h", diasLicenca: 0, dataInicioLicenca: "", cargaHoraria: 192 },
    { id: 5, matricula: "1005", nome: "Lucia Santos", sexo: "Feminino", dataNascimento: "1995-04-10", dataAdmissao: "2020-01-08", cargo: "Técnico", setor: LISTA_UI[0], status: "Ativo", vinculo: "FFM", contrato: "HC + FM40 (PAR)", turno: "8h manhã", diasLicenca: 0, dataInicioLicenca: "", cargaHoraria: 192 },
    { id: 6, matricula: "1006", nome: "Marcos Lima", sexo: "Masculino", dataNascimento: "1987-07-25", dataAdmissao: "2016-11-11", cargo: "Enfermeira", setor: LISTA_UTI[0], status: "Inativo", vinculo: "HC", contrato: "HC30", turno: "diurno 12h", diasLicenca: 0, dataInicioLicenca: "", cargaHoraria: 144 }
  ];
  
  const nomes = ["Ana", "Bruno", "Carlos", "Daniela", "Eduardo", "Fernanda", "Gabriel", "Helena", "Igor", "Juliana", "Lucas", "Mariana", "Nicolas", "Olivia", "Pedro", "Rafael", "Sofia", "Tiago", "Vinicius", "Vitoria", "Marcos", "Leticia", "João", "Maria", "José", "Camila", "Rodrigo", "Amanda", "Felipe", "Beatriz"];
  const sobrenomes = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa"];
  
  const turnos12h = ["diurno 12h", "noturno 12h"];
  
  const gerar = (setor, cargo, qtd) => {
    for(let i = 0; i < qtd; i++) {
       const nomeStr = `${nomes[Math.floor(Math.random() * nomes.length)]} ${sobrenomes[Math.floor(Math.random() * sobrenomes.length)]}`;
       const turno = turnos12h[i % 2]; 
       gerados.push({
         id: idCounter,
         matricula: (1000 + idCounter).toString(),
         nome: nomeStr,
         sexo: i % 2 === 0 ? "Feminino" : "Masculino",
         dataNascimento: "1990-01-01",
         dataAdmissao: "2020-01-01",
         cargo: cargo,
         setor: setor,
         status: "Ativo",
         vinculo: i % 3 === 0 ? "FFM" : "HC",
         contrato: "HC30",
         turno: turno,
         diasLicenca: 0,
         dataInicioLicenca: "",
         cargaHoraria: 144
       });
       idCounter++;
    }
  };

  // 03DN
  gerar("03DN", "Enfermeira", 10);
  gerar("03DN", "Técnico", 28);
  // 04GS
  gerar("04GS", "Enfermeira", 14);
  gerar("04GS", "Técnico", 24);
  // Centro Cirúrgico
  gerar("C.O", "Enfermeira", 10);
  gerar("C.O", "Técnico", 20);
  gerar("CENTRO CIRÚRGICO", "Enfermeira", 8);
  gerar("CENTRO CIRÚRGICO", "Técnico", 16);

  return gerados;
})();

export default function App() {
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth();
  const anoAtual = dataAtual.getFullYear();
  const diaHoje = dataAtual.getDate();

  const dataHojeInput = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(diaHoje).padStart(2, '0')}`;

  // =========================================================================
  // ESTADOS GLOBAIS E AUTENTICAÇÃO
  // =========================================================================
  const perfisDisponiveis = ["Plantão Assistencial", "Liderança", "Supervisão", "Administrativo"];
  
  const [autenticado, setAutenticado] = useState(false);
  const [perfilAtual, setPerfilAtual] = useState(""); 
  const [unidadeLogada, setUnidadeLogada] = useState(""); 
  const [pagina, setPagina] = useState("dashboard");

  const [setores, setSetores] = useState(SETORES_INICIAIS);
  const gruposUnidades = ["Todos", ...Array.from(new Set(setores.map(s => s.grupo)))];

  const [chLegenda, setChLegenda] = useState({
    "HC30": 144, "HC40": 192, "HC + FM35": 168, "HC + FM40 (PAR)": 192, "HC + FM40 (IMPAR)": 192, "FM40": 192
  });

  const [colaboradores, setColaboradores] = useState(COLABORADORES_INICIAIS);
  const [escalaNominal, setEscalaNominal] = useState([]);
  const [ultimaAlteracaoEscala, setUltimaAlteracaoEscala] = useState(localStorage.getItem('ultimaAlteracaoEscala') || null);
  const [filtroGlobalSetor, setFiltroGlobalSetor] = useState(""); // "" significa "Ver Todas"
  
  // Escala legacy pre-existente mantida para fallbacks
  const [escala, setEscala] = useState([
    { id: 1, dia: diaHoje, mes: mesAtual, ano: anoAtual, setor: LISTA_UTI[0], manha: { enf: 18, tec: 24 }, tarde: { enf: 19, tec: 24 }, noite: { enf: 37, tec: 48 } },
    { id: 2, dia: diaHoje, mes: mesAtual, ano: anoAtual, setor: LISTA_EMERG[0], manha: { enf: 5, tec: 14 }, tarde: { enf: 4, tec: 14 }, noite: { enf: 9, tec: 28 } }
  ]);

  const [ausencias, setAusencias] = useState([
    { colaborador: "João Souza", matricula: "1002", setor: LISTA_UI[0], motivo: "Atestado", data: dataAtual.toLocaleDateString('pt-BR'), turno: "Manhã" },
    { colaborador: "Lucia Santos", matricula: "1005", setor: LISTA_UI[0], motivo: "Falta", data: dataAtual.toLocaleDateString('pt-BR'), turno: "Tarde" }
  ]);

  const [remanejamentos, setRemanejamentos] = useState([]);
  const [plantaoDiario, setPlantaoDiario] = useState([]);
  const [logs, setLogs] = useState([]);

  function registrarLog(texto) { setLogs(prev => [{ data: new Date().toLocaleString('pt-BR'), perfil: perfilAtual, texto }, ...prev]); }

  function fazerLogoff() {
    registrarLog(`Logout realizado`);
    setAutenticado(false); setPerfilAtual(""); setUnidadeLogada(""); setPagina("dashboard");
  }

  // =========================================================================
  // COMPONENTES AUXILIARES
  // =========================================================================
  function MultiBarChart({ data, title, keys }) {
    let maxVal = Math.max(...data.flatMap(d => keys.map(k => Math.abs(d[k.key] || 0))));
    if (maxVal < 5) maxVal = 5;

    return (
      <div className="bg-white p-5 h-[340px] flex flex-col w-full rounded-2xl shadow-sm border border-slate-200 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h4 className="text-slate-800 font-bold text-sm tracking-wide">{title}</h4>
          <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
             {keys.map((k, i) => ( <span key={i} className="flex items-center gap-1.5"><div className={`w-2.5 h-2.5 rounded-full ${k.color}`}></div> {k.label}</span> ))}
          </div>
        </div>
        <div className="flex-1 flex items-end justify-between gap-2 mt-2 pt-4 border-b border-slate-200 relative pb-2 px-1 overflow-x-auto">
          {data.map((item, idx) => (
             <div key={idx} className="flex flex-col items-center justify-end h-full w-full min-w-[50px] group">
                <div className="flex items-end gap-[1px] h-full w-full justify-center relative">
                   {keys.map((k, i) => {
                     const val = item[k.key] || 0; const isNegative = val < 0; const absVal = Math.abs(val); const heightPct = (absVal / maxVal) * 100;
                     return (
                       <div key={i} className={`w-[8px] md:w-[12px] ${isNegative ? 'bg-rose-500' : k.color} relative rounded-t-sm transition-all group-hover:opacity-80`} style={{ height: `${heightPct}%`, minHeight: absVal > 0 ? '12px' : '0' }}>
                          {absVal > 0 && <span className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold ${isNegative ? 'text-rose-600' : 'text-slate-600'} opacity-0 group-hover:opacity-100 transition-opacity`}>{val}</span>}
                       </div>
                     )
                   })}
                </div>
                <span className="text-[9px] font-bold text-slate-500 mt-3 rotate-45 md:rotate-0 origin-left text-left md:text-center w-full block overflow-visible whitespace-nowrap absolute -bottom-6 truncate max-w-[60px]">{item.nome}</span>
             </div>
          ))}
        </div>
        <div className="h-6"></div>
      </div>
    );
  }

  // =========================================================================
  // TELA DE LOGIN & MENU
  // =========================================================================
  function TelaLogin() {
    const [perf, setPerf] = useState(""); const [uni, setUni] = useState(""); const [senha, setSenha] = useState("");
    const exigeUnidade = ["Plantão Assistencial", "Liderança"].includes(perf);

    function handleLogin(e) {
      e.preventDefault();
      if (!perf) return alert("Selecione um perfil de acesso.");
      if (exigeUnidade && !uni) return alert("Selecione a unidade de atuação.");
      if (!senha) return alert("Digite sua senha.");
      if (senha !== "123") return alert("Senha incorreta! (Dica: 123)");

      setPerfilAtual(perf); setUnidadeLogada(exigeUnidade ? uni : ""); setAutenticado(true);
      setPagina(perf === "Supervisão" ? "plantao" : "dashboard");
      registrarLog(`Login realizado. Unidade: ${exigeUnidade ? uni : 'Geral'}`);
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-indigo-600 p-8 text-center">
            <div className="bg-white/20 p-4 rounded-2xl inline-block mb-4 backdrop-blur-sm"><Activity size={40} className="text-white" /></div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Escala<span className="text-indigo-200">Enf</span></h1>
            <p className="text-indigo-100 mt-2 font-medium">Acesso Restrito</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Perfil de Acesso</label>
              <select className="w-full border border-slate-300 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700 font-medium transition-all" value={perf} onChange={e => setPerf(e.target.value)}>
                <option value="">Selecione seu perfil...</option>{perfisDisponiveis.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {exigeUnidade && (
              <div className="animate-fade-in">
                <label className="block text-sm font-bold text-slate-700 mb-2">Unidade / Setor</label>
                <select className="w-full border border-slate-300 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700 font-medium transition-all" value={uni} onChange={e => setUni(e.target.value)}>
                  <option value="">Selecione a unidade...</option>{setores.map((s, idx) => <option key={`${s.nome}-${idx}`} value={s.nome}>{s.nome}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div>
                <input type="password" className="w-full border border-slate-300 pl-11 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium transition-all" placeholder="Sua senha (use 123)" value={senha} onChange={e => setSenha(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold p-4 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-[0.98]">Acesso ao Sistema</button>
          </form>
        </div>
      </div>
    );
  }

  function Menu() {
    const botoes = [
      { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, roles: ["Plantão Assistencial", "Liderança", "Supervisão", "Administrativo"] },
      { id: "plantao", label: "Plantão Diário", icon: <ClipboardCheck size={18} />, roles: ["Plantão Assistencial", "Administrativo"] },
      { id: "detalhamento", label: "Detalhamento do Plantão", icon: <ClipboardCheck size={18} />, roles: ["Supervisão", "Administrativo"] },
      { id: "ausencias", label: "Ausências", icon: <UserMinus size={18} />, roles: ["Plantão Assistencial", "Supervisão", "Administrativo"] },
      { id: "escala_nominal", label: "Fazer Escala", icon: <CalendarDays size={18} />, roles: ["Liderança", "Administrativo"] },
      { id: "escala", label: "Planejamento Quant.", icon: <Calendar size={18} />, roles: ["Liderança", "Administrativo"] },
      { id: "remanejamento", label: "Remanejamentos", icon: <ArrowRightLeft size={18} />, roles: ["Supervisão", "Administrativo"] },
      { id: "setores", label: "Setores Config.", icon: <Building size={18} />, roles: ["Liderança", "Administrativo"] },
      { id: "gestao_colab", label: "Gestão de Colab.", icon: <UserPlus size={18} />, roles: ["Liderança", "Administrativo"] },
      { id: "logs", label: "Auditoria", icon: <Activity size={18} />, roles: ["Administrativo"] },
    ];
    return (
      <div className="flex flex-wrap gap-2 mb-6 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
        {botoes.filter(btn => btn.roles.includes(perfilAtual)).map((btn) => (
          <button key={btn.id} onClick={() => setPagina(btn.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${ pagina === btn.id ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>{btn.icon} {btn.label}</button>
        ))}
      </div>
    );
  }

  // =========================================================================
  // DASHBOARD
  // =========================================================================
  function Dashboard() {
    // Agora Plantão Assistencial e Liderança veem o Dashboard Operacional
    if (["Plantão Assistencial", "Liderança"].includes(perfilAtual)) {
      const horaAtual = dataAtual.getHours();
      let turnoAtualKey = 'Manhã'; let turnoAtualLabel = 'Manhã (07h às 13h)';
      if (horaAtual >= 13 && horaAtual < 19) { turnoAtualKey = 'Tarde'; turnoAtualLabel = 'Tarde (13h às 19h)'; } 
      else if (horaAtual >= 19 || horaAtual < 7) { turnoAtualKey = 'Noite'; turnoAtualLabel = 'Noite (19h às 07h)'; }

      // Se Liderança usa o dashboard, busca da escala nominal para maior precisão (ou do fallback se vazio)
      let enfEsc = 0, tecEsc = 0;
      const escMesNominal = escalaNominal.find(e => e.mes === mesAtual && e.ano === anoAtual && e.setor === unidadeLogada);
      
      if (escMesNominal) {
         Object.entries(escMesNominal.grid).forEach(([colabId, diasColab]) => {
            const val = diasColab[diaHoje];
            if (val) {
               const c = colaboradores.find(col => col.id.toString() === colabId);
               if (c) {
                  const isEnf = c.cargo.includes("Enferm");
                  if (turnoAtualKey === 'Manhã' && ['M', 'D', 'PRD'].includes(val)) { if(isEnf) enfEsc++; else tecEsc++; }
                  if (turnoAtualKey === 'Tarde' && ['T', 'D', 'PRD'].includes(val)) { if(isEnf) enfEsc++; else tecEsc++; }
                  if (turnoAtualKey === 'Noite' && ['N', 'PRN'].includes(val)) { if(isEnf) enfEsc++; else tecEsc++; }
               }
            }
         });
      } else {
         const escalaHoje = escala.find(e => e.setor === unidadeLogada && e.dia === diaHoje && e.mes === mesAtual && e.ano === anoAtual);
         if (escalaHoje) { enfEsc = escalaHoje[turnoAtualKey.toLowerCase()].enf; tecEsc = escalaHoje[turnoAtualKey.toLowerCase()].tec; }
      }
      const totalEsc = enfEsc + tecEsc;

      const ultimoPlantao = plantaoDiario.find(p => p.setor === unidadeLogada && p.data === dataAtual.toLocaleDateString('pt-BR') && p.turno === turnoAtualKey) || plantaoDiario.find(p => p.setor === unidadeLogada);
      const enfPres = ultimoPlantao ? ultimoPlantao.enfPresentes : 0;
      const tecPres = ultimoPlantao ? ultimoPlantao.tecPresentes : 0;
      const totalPres = enfPres + tecPres;

      const rec = remanejamentos.filter(r => r.destino === unidadeLogada && r.data === dataAtual.toLocaleDateString('pt-BR'));
      const ced = remanejamentos.filter(r => r.origem === unidadeLogada && r.data === dataAtual.toLocaleDateString('pt-BR'));

      const leitosOp = ultimoPlantao ? (ultimoPlantao.leitosOperacionais || 0) : setores.find(s => s.nome === unidadeLogada)?.leitosOperacionais || 0;
      const leitosOcup = ultimoPlantao ? (ultimoPlantao.ocupados || 0) : 0;
      const leitosBloq = ultimoPlantao ? (ultimoPlantao.bloqueados || 0) : 0;

      return (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Operacional - Unidade {unidadeLogada}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500">
              <p className="text-gray-500 text-sm font-medium mb-2">Equipe Escalada <span className="text-blue-600 block text-xs">{turnoAtualLabel}</span></p>
              <div className="flex justify-between items-end mt-1"><p className="text-4xl font-extrabold text-blue-600">{totalEsc}</p><div className="text-xs text-gray-500 text-right font-medium"><p>Enf: {enfEsc}</p><p>Tec/Aux: {tecEsc}</p></div></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-500">
              <p className="text-gray-500 text-sm font-medium mb-2">Equipe Presente <span className="text-green-600 block text-xs">(Últ. Check de Turno)</span></p>
              <div className="flex justify-between items-end mt-1"><p className={`text-4xl font-extrabold text-green-600`}>{totalPres}</p><div className="text-xs text-gray-500 text-right font-medium"><p>Enf: {enfPres}</p><p>Tec/Aux: {tecPres}</p></div></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-purple-500">
              <p className="text-gray-500 text-sm font-medium mb-2">Equipe Ajustada <span className="text-purple-600 block text-xs">(Remanejamentos hoje)</span></p>
              <div className="flex justify-between items-end mt-1"><p className="text-2xl font-bold text-gray-800"><span className="text-green-600">+{rec.length}</span> / <span className="text-red-600">-{ced.length}</span></p><div className="text-xs text-gray-500 text-right font-medium"><p>Recebidos</p><p>Cedidos</p></div></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-orange-500">
              <p className="text-gray-500 text-sm font-medium mb-2">Panorama de Leitos <span className="text-orange-500 block text-xs">(Atualização)</span></p>
              <div className="grid grid-cols-3 gap-1 text-center mt-1">
                <div className="bg-gray-50 rounded p-1"><p className="text-xl font-bold text-gray-700">{leitosOp}</p><p className="text-[10px] text-gray-500 uppercase">Operac</p></div>
                <div className="bg-blue-50 rounded p-1"><p className="text-xl font-bold text-blue-700">{leitosOcup}</p><p className="text-[10px] text-gray-500 uppercase">Ocup</p></div>
                <div className="bg-red-50 rounded p-1"><p className="text-xl font-bold text-red-600">{leitosBloq}</p><p className="text-[10px] text-gray-500 uppercase">Bloq</p></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (perfilAtual === "Supervisão") {
      return <DashboardSupervisao />;
    }

    // Dashboard para Administrativo/Geral
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Administrativo/Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500"><p className="text-gray-500 text-sm font-medium">Dias Planejados</p><p className="text-3xl font-bold text-gray-800 mt-2">{escala.length}</p></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-500"><p className="text-gray-500 text-sm font-medium">Plantões Concluídos</p><p className="text-3xl font-bold text-gray-800 mt-2">{plantaoDiario.length}</p></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-red-500"><p className="text-gray-500 text-sm font-medium">Ausências (Mês)</p><p className="text-3xl font-bold text-gray-800 mt-2">{ausencias.length}</p></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-orange-500"><p className="text-gray-500 text-sm font-medium">Remanejamentos</p><p className="text-3xl font-bold text-gray-800 mt-2">{remanejamentos.length}</p></div>
        </div>
      </div>
    );
  }

  function DashboardSupervisao() {
    const [supFiltroTurno, setSupFiltroTurno] = useState("Manhã");
    const [supFiltroUnidade, setSupFiltroUnidade] = useState("Todas");

    const checklistsDoTurno = plantaoDiario.filter(p => p.data === dataAtual.toLocaleDateString('pt-BR'));
    const qtdChecklists = checklistsDoTurno.length;
    const totalUnidades = setores.length;
    const percentAdesao = totalUnidades > 0 ? ((qtdChecklists / totalUnidades) * 100).toFixed(1) : 0;

    // Filter logic for Operational Cards
    let enfEsc = 0, tecEsc = 0, enfPres = 0, tecPres = 0, leitosOp = 0, leitosOcup = 0, leitosBloq = 0;
    let recList = [], cedList = [];

    const unidadesParaFiltrar = supFiltroUnidade === "Todas" ? setores.map(s => s.nome) : [supFiltroUnidade];

    unidadesParaFiltrar.forEach(uni => {
       const escMesNominal = escalaNominal.find(e => e.mes === mesAtual && e.ano === anoAtual && e.setor === uni);
       if (escMesNominal) {
          Object.entries(escMesNominal.grid).forEach(([colabId, diasColab]) => {
             const val = diasColab[diaHoje];
             if (val) {
                const c = colaboradores.find(col => col.id.toString() === colabId);
                if (c) {
                   const isEnf = c.cargo.includes("Enferm");
                   if (supFiltroTurno === 'Manhã' && ['M', 'D', 'PRD'].includes(val)) { if(isEnf) enfEsc++; else tecEsc++; }
                   if (supFiltroTurno === 'Tarde' && ['T', 'D', 'PRD'].includes(val)) { if(isEnf) enfEsc++; else tecEsc++; }
                   if (supFiltroTurno === 'Noite' && ['N', 'PRN'].includes(val)) { if(isEnf) enfEsc++; else tecEsc++; }
                }
             }
          });
       }
       
       const ultimoPlantao = plantaoDiario.find(p => p.setor === uni && p.data === dataAtual.toLocaleDateString('pt-BR') && p.turno === supFiltroTurno) || plantaoDiario.find(p => p.setor === uni);
       if (ultimoPlantao) {
           enfPres += ultimoPlantao.enfPresentes || 0;
           tecPres += ultimoPlantao.tecPresentes || 0;
           leitosOp += ultimoPlantao.leitosOperacionais || 0;
           leitosOcup += ultimoPlantao.ocupados || 0;
           leitosBloq += ultimoPlantao.bloqueados || 0;
       } else {
           leitosOp += setores.find(s => s.nome === uni)?.leitosOperacionais || 0;
       }

       const r = remanejamentos.filter(rem => rem.destino === uni && rem.data === dataAtual.toLocaleDateString('pt-BR') && rem.turno === supFiltroTurno);
       const c = remanejamentos.filter(rem => rem.origem === uni && rem.data === dataAtual.toLocaleDateString('pt-BR') && rem.turno === supFiltroTurno);
       recList.push(...r);
       cedList.push(...c);
    });

    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><LayoutDashboard className="text-indigo-600"/> Dashboard da Supervisão</h2>
          <p className="text-sm font-medium text-slate-500">Acompanhamento e suporte da operação no turno vigente.</p>
        </div>

        {/* Banner de Adesão ao Checklist */}
        <div className="bg-indigo-700 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between mb-8">
           <div>
              <p className="text-indigo-200 text-xs font-bold uppercase mb-1 flex items-center gap-1.5"><ClipboardCheck size={14}/> Status de Operação do Plantão</p>
              <p className="text-2xl font-black">Turno {supFiltroTurno} <span className="text-sm font-normal text-indigo-200">({qtdChecklists} de {totalUnidades} enviaram o Checklist)</span></p>
           </div>
           <div className="flex items-center gap-6 mt-4 md:mt-0">
              <div className="text-right">
                 <p className="text-4xl font-black">{percentAdesao}%</p>
                 <p className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Adesão Atual</p>
              </div>
              <button className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-2">
                 <CheckCircle size={18}/> Ver Pendentes ({totalUnidades - qtdChecklists})
              </button>
           </div>
        </div>

        {/* Filtros para os Cards Operacionais */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
           <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 mb-1">Turno Analisado</label>
              <select className="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={supFiltroTurno} onChange={e => setSupFiltroTurno(e.target.value)}>
                 <option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Noite">Noite</option>
              </select>
           </div>
           <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 mb-1">Unidade</label>
              <select className="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={supFiltroUnidade} onChange={e => setSupFiltroUnidade(e.target.value)}>
                 <option value="Todas">Todas as Unidades</option>
                 {setores.map(s => <option key={s.nome} value={s.nome}>{s.nome}</option>)}
              </select>
           </div>
        </div>

        {/* Cards Operacionais Filtrados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500">
            <p className="text-gray-500 text-sm font-medium mb-2">Equipe Escalada <span className="text-blue-600 block text-xs">{supFiltroTurno}</span></p>
            <div className="flex justify-between items-end mt-1"><p className="text-4xl font-extrabold text-blue-600">{enfEsc + tecEsc}</p><div className="text-xs text-gray-500 text-right font-medium"><p>Enf: {enfEsc}</p><p>Tec/Aux: {tecEsc}</p></div></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-500">
            <p className="text-gray-500 text-sm font-medium mb-2">Equipe Presente <span className="text-green-600 block text-xs">(Últ. Check de Turno)</span></p>
            <div className="flex justify-between items-end mt-1"><p className="text-4xl font-extrabold text-green-600">{enfPres + tecPres}</p><div className="text-xs text-gray-500 text-right font-medium"><p>Enf: {enfPres}</p><p>Tec/Aux: {tecPres}</p></div></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-purple-500">
            <p className="text-gray-500 text-sm font-medium mb-2">Equipe Ajustada <span className="text-purple-600 block text-xs">(Remanejamentos hoje)</span></p>
            <div className="flex justify-between items-end mt-1"><p className="text-2xl font-bold text-gray-800"><span className="text-green-600">+{recList.length}</span> / <span className="text-red-600">-{cedList.length}</span></p><div className="text-xs text-gray-500 text-right font-medium"><p>Recebidos</p><p>Cedidos</p></div></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-orange-500">
            <p className="text-gray-500 text-sm font-medium mb-2">Panorama de Leitos <span className="text-orange-500 block text-xs">(Atualização)</span></p>
            <div className="grid grid-cols-3 gap-1 text-center mt-1">
              <div className="bg-gray-50 rounded p-1"><p className="text-xl font-bold text-gray-700">{leitosOp}</p><p className="text-[10px] text-gray-500 uppercase">Operac</p></div>
              <div className="bg-blue-50 rounded p-1"><p className="text-xl font-bold text-blue-700">{leitosOcup}</p><p className="text-[10px] text-gray-500 uppercase">Ocup</p></div>
              <div className="bg-red-50 rounded p-1"><p className="text-xl font-bold text-red-600">{leitosBloq}</p><p className="text-[10px] text-gray-500 uppercase">Bloq</p></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Remanejamento() {
    // ... mantido o código original do remanejamento
    const [matBusca, setMatBusca] = useState("");
    const [dataRem, setDataRem] = useState(dataHojeInput);
    const [destino, setDestino] = useState("");
    const [turnoRem, setTurnoRem] = useState("Manhã");
    const [remParaExcluir, setRemParaExcluir] = useState(null);

    const colabEncontrado = colaboradores.find(c => c.matricula === matBusca);

    function handleSalvar(e) {
      e.preventDefault();
      if (!colabEncontrado) return alert("Colaborador não encontrado!");
      if (!destino) return alert("Selecione o setor de destino!");
      if (destino === colabEncontrado.setor) return alert("O setor de destino deve ser diferente do setor base!");

      const [anoStr, mesStr, diaStr] = dataRem.split('-');
      const dia = parseInt(diaStr, 10); const mes = parseInt(mesStr, 10) - 1; const ano = parseInt(anoStr, 10);
      const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}/${ano}`;

      const baseRemanejamento = { colaborador: colabEncontrado.nome, matricula: colabEncontrado.matricula, origem: colabEncontrado.setor, destino: destino, data: dataFormatada, dia, mes, ano };

      if (turnoRem === "Diurno Integral (Manhã e Tarde)") {
        setRemanejamentos(prev => [{ ...baseRemanejamento, id: Date.now(), turno: "Manhã" }, { ...baseRemanejamento, id: Date.now() + 1, turno: "Tarde" }, ...prev]);
      } else {
        setRemanejamentos(prev => [{ ...baseRemanejamento, id: Date.now(), turno: turnoRem }, ...prev]);
      }
      registrarLog(`Remanejamento agendado: ${colabEncontrado.nome} de ${colabEncontrado.setor} para ${destino} em ${dataFormatada} (${turnoRem})`);
      setMatBusca(""); setDestino(""); alert("Remanejamento registrado com sucesso!");
    }

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Remanejamentos de Equipe</h2>
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8 shadow-inner animate-fade-in">
          <h3 className="font-bold text-indigo-800 mb-4 flex items-center gap-2"><ArrowRightLeft size={18} /> Registrar ou Agendar Remanejamento</h3>
          <form onSubmit={handleSalvar} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div><label className="block text-sm font-bold text-indigo-900 mb-1">Data</label><input type="date" className="w-full border border-indigo-200 p-2.5 rounded-xl bg-white" value={dataRem} onChange={e => setDataRem(e.target.value)} required /></div>
              <div><label className="block text-sm font-bold text-indigo-900 mb-1">Matrícula</label><input type="text" className="w-full border border-indigo-200 p-2.5 rounded-xl bg-white" value={matBusca} onChange={e => setMatBusca(e.target.value)} placeholder="Ex: 1001" required /></div>
              <div className="md:col-span-2"><label className="block text-sm font-bold text-indigo-900 mb-1">Colaborador Localizado</label><input type="text" className="w-full border border-indigo-200 p-2.5 rounded-xl bg-indigo-100/50 text-indigo-800 cursor-not-allowed" value={colabEncontrado ? `${colabEncontrado.nome} (${colabEncontrado.cargo})` : "Aguardando..."} disabled /></div>
            </div>
            {colabEncontrado && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in p-4 bg-white rounded-xl border border-indigo-100 mt-2">
                <div><label className="block text-[10px] font-bold text-slate-500 uppercase">Origem</label><div className="font-bold text-slate-800 p-2.5 bg-slate-50 rounded-xl border">{colabEncontrado.setor}</div></div>
                <div><label className="block text-[10px] font-bold text-indigo-600 uppercase">Destino</label><select className="w-full border border-indigo-300 p-2.5 rounded-xl bg-white" value={destino} onChange={e => setDestino(e.target.value)} required><option value="">Selecione...</option>{setores.filter(s => s.nome !== colabEncontrado.setor).map((s, idx) => <option key={`${s.nome}-${idx}`} value={s.nome}>{s.nome}</option>)}</select></div>
                <div><label className="block text-[10px] font-bold text-indigo-600 uppercase">Turno</label><select className="w-full border border-indigo-300 p-2.5 rounded-xl bg-white" value={turnoRem} onChange={e => setTurnoRem(e.target.value)} required><option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Diurno Integral (Manhã e Tarde)">Diurno 12h</option><option value="Noite">Noite</option></select></div>
              </div>
            )}
            <div className="flex justify-end mt-2"><button type="submit" className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 active:scale-95 flex items-center gap-2"><CheckCircle size={18} /> Confirmar</button></div>
          </form>
        </div>

        <h3 className="font-bold text-slate-800 mt-8 mb-4">Remanejamentos Efetuados no Plantão</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
           <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                 <tr><th className="p-4">Colaborador</th><th className="p-4">Origem</th><th className="p-4">Destino</th><th className="p-4">Data</th><th className="p-4">Turno</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                 {remanejamentos.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-slate-500 italic">Nenhum remanejamento registrado.</td></tr>}
                 {remanejamentos.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-slate-50 transition-colors">
                       <td className="p-4 font-bold text-slate-800">{r.colaborador} <span className="text-xs font-normal text-slate-400 block font-mono">{r.matricula}</span></td>
                       <td className="p-4"><span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded text-xs font-bold border border-rose-100">{r.origem}</span></td>
                       <td className="p-4"><span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded text-xs font-bold border border-emerald-100">{r.destino}</span></td>
                       <td className="p-4 text-slate-600 font-medium">{r.data}</td>
                       <td className="p-4 text-slate-600 font-medium">{r.turno}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    );
  }

  function PlantaoDiario() {
    const [filtroData, setFiltroData] = useState(dataHojeInput);
    const [filtroTurno, setFiltroTurno] = useState("Diurno");
    const [filtroGrupo, setFiltroGrupo] = useState("Todos");

    if (perfilAtual === "Supervisão" || perfilAtual === "Administrativo") {
      const turnosMapeados = filtroTurno === "Diurno" ? ["Manhã", "Tarde"] : ["Noite"];
      const [anoF, mesF, diaF] = filtroData.split('-').map(Number);
      const mesFIndex = mesF - 1; 

      let setoresFiltrados = setores;
      if (filtroGrupo !== "Todos") setoresFiltrados = setores.filter(s => s.grupo === filtroGrupo);
      if (perfilAtual === "Supervisão" && filtroGlobalSetor !== "") {
         setoresFiltrados = setoresFiltrados.filter(s => s.nome === filtroGlobalSetor);
      }

      const dadosTabela = setoresFiltrados.map(setor => {
        const escDia = escala.find(e => e.setor === setor.nome && e.dia === diaF && e.mes === mesFIndex && e.ano === anoF);
        let enfEsc = 0; let tecEsc = 0;
        if (escDia) {
          if (filtroTurno === "Diurno") { enfEsc = escDia.manha.enf + escDia.tarde.enf; tecEsc = escDia.manha.tec + escDia.tarde.tec; } 
          else { enfEsc = escDia.noite.enf; tecEsc = escDia.noite.tec; }
        }

        const ausSetor = ausencias.filter(a => {
           if (a.setor !== setor.nome || !turnosMapeados.includes(a.turno)) return false;
           const parts = a.data.split('/');
           return parts.length === 3 && parseInt(parts[0]) === diaF && parseInt(parts[1]) === (mesFIndex + 1) && parseInt(parts[2]) === anoF;
        });
        
        let enfAus = 0; let tecAus = 0;
        ausSetor.forEach(a => {
           const c = colaboradores.find(col => col.matricula === a.matricula);
           if (c && (c.cargo === "Enfermeira" || c.cargo === "Enfermeiro")) enfAus++; else tecAus++;
        });

        let checksSetor = plantaoDiario.filter(p => p.setor === setor.nome && p.diaPlantao === diaF && p.mes === mesFIndex && p.ano === anoF && turnosMapeados.includes(p.turno));
        let enfPres = checksSetor.reduce((acc, curr) => acc + curr.enfPresentes, 0);
        let tecPres = checksSetor.reduce((acc, curr) => acc + curr.tecPresentes, 0);
        
        const checkValid = checksSetor.length > 0 ? checksSetor[0] : null;
        const observacoes = checkValid ? checkValid.observacoes : "";

        const remDia = remanejamentos.filter(r => r.dia === diaF && r.mes === mesFIndex && r.ano === anoF && turnosMapeados.includes(r.turno));
        let enfRemRecebido = 0; let tecRemRecebido = 0; let enfRemCedido = 0; let tecRemCedido = 0;

        remDia.forEach(r => {
          const cargo = colaboradores.find(c => c.nome === r.colaborador)?.cargo;
          const isEnf = cargo === "Enfermeira" || cargo === "Enfermeiro";
          if (r.destino === setor.nome) { if (isEnf) { enfRemRecebido++; enfPres++; } else { tecRemRecebido++; tecPres++; } }
          if (r.origem === setor.nome) { if (isEnf) { enfRemCedido++; enfPres--; } else { tecRemCedido++; tecPres--; } }
        });

        enfPres = Math.max(0, enfPres); tecPres = Math.max(0, tecPres);

        const fatorMin = filtroTurno === "Diurno" ? 2 : 1; 
        const minEnfReal = setor.minEnf * fatorMin; const minTecReal = setor.minTec * fatorMin;
        const abaixoMinimo = (enfPres < minEnfReal || tecPres < minTecReal);
        const teveAusencia = (enfAus > 0 || tecAus > 0);

        let prioridade = 4; 
        if (teveAusencia && abaixoMinimo) prioridade = 1; else if (!teveAusencia && abaixoMinimo) prioridade = 2; else if (teveAusencia && !abaixoMinimo) prioridade = 3; 

        return { nome: setor.nome, grupo: setor.grupo, enfEsc, tecEsc, enfAus, tecAus, enfPres, tecPres, remEnfBalanco: enfRemRecebido - enfRemCedido, remTecBalanco: tecRemRecebido - tecRemCedido, observacoes, minEnfReal, minTecReal, prioridade };
      });

      dadosTabela.sort((a, b) => a.prioridade - b.prioridade);

      const ttEscalados = dadosTabela.reduce((acc, cur) => acc + cur.enfEsc + cur.tecEsc, 0);
      const ttPresentes = dadosTabela.reduce((acc, cur) => acc + cur.enfPres + cur.tecPres, 0);
      const ttAusEnf = dadosTabela.reduce((acc, cur) => acc + cur.enfAus, 0);
      const ttAusTec = dadosTabela.reduce((acc, cur) => acc + cur.tecAus, 0);

      let dadosChart = [];
      if (filtroGrupo === "Todos") {
        const agrupado = {};
        dadosTabela.forEach(d => {
          if (!agrupado[d.grupo]) agrupado[d.grupo] = { nome: d.grupo, minimoTotal: 0, escaladaTotal: 0, remanejamentoTotal: 0, realTotal: 0 };
          agrupado[d.grupo].minimoTotal += (d.minEnfReal + d.minTecReal); agrupado[d.grupo].escaladaTotal += (d.enfEsc + d.tecEsc);
          agrupado[d.grupo].remanejamentoTotal += (d.remEnfBalanco + d.remTecBalanco); agrupado[d.grupo].realTotal += (d.enfPres + d.tecPres);
        });
        dadosChart = Object.values(agrupado);
      } else {
        dadosChart = dadosTabela.map(d => ({ ...d, minimoTotal: d.minEnfReal + d.minTecReal, escaladaTotal: d.enfEsc + d.tecEsc, remanejamentoTotal: d.remEnfBalanco + d.remTecBalanco, realTotal: d.enfPres + d.tecPres }));
      }

      return (
        <div className="animate-fade-in flex flex-col gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
             <div className="flex flex-wrap items-center gap-4">
                <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex items-center shadow-inner h-12">
                   <button onClick={() => setFiltroTurno('Diurno')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all h-full ${filtroTurno === 'Diurno' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>Diurno</button>
                   <button onClick={() => setFiltroTurno('Noturno')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all h-full ${filtroTurno === 'Noturno' ? 'bg-indigo-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Noturno</button>
                </div>
                <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                <div className="flex flex-col"><label className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Data Ref.</label><input type="date" className="bg-slate-50 border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-slate-700 h-10" value={filtroData} onChange={e => setFiltroData(e.target.value)} /></div>
                <div className="flex flex-col"><label className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider flex items-center gap-1"><Filter size={10}/> Agrupamento</label>
                   <select className="bg-slate-50 border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-slate-700 h-10 min-w-[180px]" value={filtroGrupo} onChange={e => setFiltroGrupo(e.target.value)}>
                     {gruposUnidades.map((g, idx) => <option key={`${g}-${idx}`} value={g}>{g}</option>)}
                   </select>
                </div>
             </div>
             <div className="flex items-center gap-6 xl:border-l xl:pl-6 border-slate-200">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100"><Users size={18}/></div><div><p className="text-[10px] uppercase font-bold text-slate-400">Escalados</p><p className="text-xl font-black text-slate-800 leading-none">{ttEscalados}</p></div></div>
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100"><CheckCircle size={18}/></div><div><p className="text-[10px] uppercase font-bold text-slate-400">Presentes</p><p className="text-xl font-black text-slate-800 leading-none">{ttPresentes}</p></div></div>
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100"><UserMinus size={18}/></div><div><p className="text-[10px] uppercase font-bold text-slate-400">Ausências (E/T)</p><p className="text-xl font-bold text-rose-600 leading-none">{ttAusEnf} <span className="text-slate-300 text-sm font-normal">|</span> {ttAusTec}</p></div></div>
             </div>
          </div>

          {perfilAtual === "Administrativo" && (
             <div className="mb-2">
                <MultiBarChart title="PANORAMA DE RH (MÍNIMO x ESCALADO x REMANEJADO x REAL)" data={dadosChart} 
                   keys={[{ key: 'minimoTotal', color: 'bg-slate-300', label: 'Equipa Mínima' }, { key: 'escaladaTotal', color: 'bg-indigo-400', label: 'Equipa Escalada' }, { key: 'remanejamentoTotal', color: 'bg-orange-400', label: 'Remanejamento (Saldo)' }, { key: 'realTotal', color: 'bg-emerald-500', label: 'Equipa Real' }]} 
                />
             </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center"><h3 className="text-base font-bold text-slate-800 flex items-center gap-2"><ClipboardCheck size={18} className="text-indigo-600"/> Detalhamento do Plantão ({filtroGrupo === "Todos" ? "Geral" : filtroGrupo})</h3></div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
                   <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                         <th className="p-4 py-3 w-40">Unidade & Status</th>
                         <th className="p-4 py-3 text-center" title="Mínimo de Segurança">Mínimo Seg.</th>
                         <th className="p-4 py-3 text-center bg-indigo-50/30">Escalados</th><th className="p-4 py-3 text-center bg-rose-50/30">Ausências</th>
                         <th className="p-4 py-3 text-center bg-emerald-50/30">Remanej.</th><th className="p-4 py-3 text-center bg-slate-100/50 rounded-tl-lg font-bold text-slate-700">Presente Real</th><th className="p-4 py-3 text-left w-64">Observações</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {dadosTabela.length === 0 ? (<tr><td colSpan="7" className="p-8 text-center text-slate-500 italic">Nenhuma unidade encontrada para este grupo.</td></tr>) : null}
                      {dadosTabela.map((row, i) => (
                         <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="p-4">
                               <div className="font-bold text-slate-800 text-base mb-1.5">{row.nome}</div>
                               {row.prioridade === 1 && <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"><AlertTriangle size={10}/> Crítico</span>}
                               {row.prioridade === 2 && <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"><AlertTriangle size={10}/> Furo Base</span>}
                               {row.prioridade === 3 && <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"><Minus size={10}/> Atenção</span>}
                               {row.prioridade === 4 && <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"><CheckCircle size={10}/> Normal</span>}
                            </td>
                            <td className="p-4 text-center"><div className="inline-flex gap-1 items-center px-2 py-1 text-xs font-medium text-slate-500"><span>{row.minEnfReal}E</span><span className="text-slate-300">|</span><span>{row.minTecReal}T</span></div></td>
                            <td className="p-4 text-center bg-indigo-50/10">
                               <div className="inline-flex gap-1.5 items-center bg-white px-2.5 py-1 rounded-lg border border-indigo-100 shadow-sm"><span className="text-indigo-700 font-bold">{row.enfEsc > 0 ? row.enfEsc : '-'}E</span><span className="text-indigo-200">|</span><span className="text-sky-700 font-bold">{row.tecEsc > 0 ? row.tecEsc : '-'}T</span></div>
                            </td>
                            <td className="p-4 text-center bg-rose-50/10">
                               {(row.enfAus > 0 || row.tecAus > 0) ? (
                                  <div className="inline-flex gap-1.5 items-center bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 shadow-sm"><span className="text-rose-700 font-bold">{row.enfAus > 0 ? row.enfAus : '0'}E</span><span className="text-rose-300">|</span><span className="text-orange-600 font-bold">{row.tecAus > 0 ? row.tecAus : '0'}T</span></div>
                               ) : <span className="text-slate-300 font-medium">-</span>}
                            </td>
                            <td className="p-4 text-center bg-emerald-50/10">
                               {(row.remEnfBalanco !== 0 || row.remTecBalanco !== 0) ? (
                                  <div className="inline-flex gap-1.5 items-center bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-sm">
                                     <span className={`font-bold ${row.remEnfBalanco > 0 ? 'text-emerald-600' : row.remEnfBalanco < 0 ? 'text-rose-600' : 'text-slate-400'}`}>{row.remEnfBalanco > 0 ? `+${row.remEnfBalanco}` : row.remEnfBalanco === 0 ? '0' : row.remEnfBalanco}E</span><span className="text-emerald-200">|</span>
                                     <span className={`font-bold ${row.remTecBalanco > 0 ? 'text-emerald-600' : row.remTecBalanco < 0 ? 'text-rose-600' : 'text-slate-400'}`}>{row.remTecBalanco > 0 ? `+${row.remTecBalanco}` : row.remTecBalanco === 0 ? '0' : row.remTecBalanco}T</span>
                                  </div>
                               ) : <span className="text-slate-300 font-medium">-</span>}
                            </td>
                            <td className="p-4 text-center bg-slate-50 border-l border-slate-100 relative">
                               <div className="inline-flex gap-1.5 items-center bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                  <span className={`font-black text-sm ${row.enfPres < row.minEnfReal ? 'text-rose-600' : 'text-emerald-600'}`} title={`Mín. ${row.minEnfReal}`}>{row.enfPres}E</span><span className="text-slate-200">|</span>
                                  <span className={`font-black text-sm ${row.tecPres < row.minTecReal ? 'text-rose-600' : 'text-emerald-600'}`} title={`Mín. ${row.minTecReal}`}>{row.tecPres}T</span>
                               </div>
                            </td>
                            <td className="p-4"><p className="text-xs text-slate-500 line-clamp-3" title={row.observacoes}>{row.observacoes || <span className="italic opacity-50">Sem observações.</span>}</p></td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      );
    }

    const [diaPlantao] = useState(dataAtual.getDate());
    const [dataHoraFixa] = useState(dataAtual.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }));
    
    const [setor, setSetor] = useState(unidadeLogada || "");
    const [turno, setTurno] = useState("");
    
    // Estados Requeridos (Censo de Leitos)
    const [ocupados, setOcupados] = useState("");
    const [bloqueados, setBloqueados] = useState("");
    const [isolamento, setIsolamento] = useState("");
    const [isoContato, setIsoContato] = useState("");
    const [isoRespiratorio, setIsoRespiratorio] = useState("");
    const [isoAmbos, setIsoAmbos] = useState("");

    const [observacoes, setObservacoes] = useState("");

    // Estados Requeridos (UI - Protocolo de Agravo)
    const [agravoQtd, setAgravoQtd] = useState("");
    const [agravoLeitos, setAgravoLeitos] = useState("");

    // Estados Requeridos (UTI)
    const [dialiseSLED, setDialiseSLED] = useState("");
    const [dialiseHL, setDialiseHL] = useState("");
    const [ecmo, setEcmo] = useState("Não");

    // Estado Requerido (Centro Cirúrgico)
    const [salasCirurgicas, setSalasCirurgicas] = useState([{ id: Date.now(), sala: "", procedimento: "", montada: false, emCurso: false, rpa: false, agEnf: "", agUTI: "" }]);

    // Novos Estados: CEIC
    const [ceicAtendimentosUnidades, setCeicAtendimentosUnidades] = useState("");
    const [ceicAtendimentos, setCeicAtendimentos] = useState("");
    const [ceicAreasVisitadas, setCeicAreasVisitadas] = useState("");
    const [ceicTransportes, setCeicTransportes] = useState("");

    // Novos Estados: CETIP
    const [cetipAtendimentos, setCetipAtendimentos] = useState("");

    // Novos Estados: 03PA (Térreo - CAM)
    const [paProntoAtendimento, setPaProntoAtendimento] = useState({ atendimentos: "", internados: "", transferidos: "", obitos: "", obs: "" });
    const [paObservacao, setPaObservacao] = useState({ atendimentos: "", internados: "", transferidos: "", obitos: "", obs: "" });
    const [paTriagem, setPaTriagem] = useState({ atendimentos: "", internados: "", transferidos: "", obitos: "", obs: "" });

    // Novos Estados: CME
    const CME_EQUIP_LIST = ["Autoclave 1", "Autoclave 2", "Autoclave 3", "Autoclave F1 (Híbrida)", "Termolavadora 1", "Termolavadora 2", "Termolavadora 3", "Termolavadora 4", "CartWash", "AGS", "AGS (expurgo)"];
    const CME_ENXOVAL_LIST = ["LAP", "AV 1", "AV 2", "CAMPO MÉDIO", "CAMPO FENESTRADO"];
    
    const [cmeEquipamentos, setCmeEquipamentos] = useState(CME_EQUIP_LIST.map(e => ({ nome: e, status: "" }))); // status: "" | "Funcionando" | "Manutenção"
    const [cmeEnxoval, setCmeEnxoval] = useState(CME_ENXOVAL_LIST.map(e => ({ nome: e, status: "" }))); // status: "" | "Disponível" | "Em falta"

    const podeEditar = ["Plantão Assistencial"].includes(perfilAtual);
    const turnoKey = turno === "Manhã" ? "manha" : turno === "Tarde" ? "tarde" : "noite"; 
    
    const escDia = escala.find(e => e.setor === setor && e.dia === diaPlantao && e.mes === mesAtual && e.ano === anoAtual);
    const enfEscalados = (escDia && turno) ? escDia[turnoKey].enf : 0;
    const tecEscalados = (escDia && turno) ? escDia[turnoKey].tec : 0;
    
    // Checklist Nominal Logic
    const colabsSetor = colaboradores.filter(c => c.setor === setor);
    const escMesNominal = escalaNominal.find(e => e.mes === mesAtual && e.ano === anoAtual && e.setor === setor);

    let escaladosHoje = [];
    if (turno && setor) {
      if (escMesNominal && escMesNominal.grid && Object.keys(escMesNominal.grid).length > 0) {
        escaladosHoje = colabsSetor.filter(c => {
          const val = escMesNominal.grid[c.id]?.[diaPlantao];
          if (!val) return false;
          if (turno === 'Manhã' && ['M', 'D', 'PRD'].includes(val)) return true;
          if (turno === 'Tarde' && ['T', 'D', 'PRD'].includes(val)) return true;
          if (turno === 'Noite' && ['N', 'PRN'].includes(val)) return true;
          return false;
        });
      } else {
        // Fallback case when there is no nominal schedule
        escaladosHoje = colabsSetor.filter(c => {
          const t = c.turno.toLowerCase();
          if (turno === 'Manhã' && (t.includes('manhã') || t.includes('diurno'))) return true;
          if (turno === 'Tarde' && (t.includes('tarde') || t.includes('diurno'))) return true;
          if (turno === 'Noite' && t.includes('noturno')) return true;
          return false;
        });
        
        // Safety net: se a triagem falhar mas o setor tiver funcionários, exibe todos para preenchimento manual
        if (escaladosHoje.length === 0 && colabsSetor.length > 0) {
           escaladosHoje = colabsSetor;
        }
      }
    }

    const [presencas, setPresencas] = useState({});
    const [motivosAusencia, setMotivosAusencia] = useState({});

    // Reset fields when sector/shift changes
    useEffect(() => { 
      setOcupados(""); setBloqueados(""); setIsolamento(""); setIsoContato(""); setIsoRespiratorio(""); setIsoAmbos("");
      setAgravoQtd(""); setAgravoLeitos("");
      setSalasCirurgicas([{ id: Date.now(), sala: "", procedimento: "", montada: false, emCurso: false, rpa: false, agEnf: "", agUTI: "" }]);
      setCeicAtendimentosUnidades(""); setCeicAtendimentos(""); setCeicAreasVisitadas(""); setCeicTransportes("");
      setCetipAtendimentos("");
      setPaProntoAtendimento({ atendimentos: "", internados: "", transferidos: "", obitos: "", obs: "" });
      setPaObservacao({ atendimentos: "", internados: "", transferidos: "", obitos: "", obs: "" });
      setPaTriagem({ atendimentos: "", internados: "", transferidos: "", obitos: "", obs: "" });
      setCmeEquipamentos(CME_EQUIP_LIST.map(e => ({ nome: e, status: "" })));
      setCmeEnxoval(CME_ENXOVAL_LIST.map(e => ({ nome: e, status: "" })));
      
      setPresencas({});
      setMotivosAusencia({});
    }, [setor, turno, diaPlantao]);

    const calcEnfPres = escaladosHoje.filter(c => presencas[c.id] && (c.cargo === 'Enfermeira' || c.cargo === 'Enfermeiro')).length;
    const calcTecPres = escaladosHoje.filter(c => presencas[c.id] && (c.cargo === 'Técnico' || c.cargo === 'Auxiliar')).length;

    // Checks if every scheduled employee is either verified as present or has a reason written
    const isBotaoLiberado = escaladosHoje.length > 0 && escaladosHoje.every(c => presencas[c.id] || (motivosAusencia[c.id] && motivosAusencia[c.id].trim() !== ""));
    const nenhumEscalado = escaladosHoje.length === 0 && turno !== "";

    const infoSetorSelecionado = setores.find(s => s.nome === setor);
    
    // Condicionais de exibição
    const isEmergencia = infoSetorSelecionado?.grupo === "Emergência Referenciada";
    const isUI = infoSetorSelecionado?.grupo === "Unidades de Internação" && setor !== "03PA";
    const isUTI = infoSetorSelecionado?.grupo === "UTI's";
    const isCentroCirurgico = infoSetorSelecionado?.grupo === "Blocos Cirúrgicos" || setor.toUpperCase().includes("CIRÚRGIC") || setor === "C.O" || setor === "CENTRO OBSTÉTRICO";
    const isCEIC = setor === "CEIC";
    const isCETIP = setor === "CETIP";
    const is03PA = setor === "03PA";
    const isCME = setor === "CME";

    const mostraCenso = isUI || isUTI || isEmergencia;

    function updateSala(id, field, value) { setSalasCirurgicas(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s)); }
    function handleCmeEquip(idx, val) { const n = [...cmeEquipamentos]; n[idx].status = val; setCmeEquipamentos(n); }
    function handleCmeEnxoval(idx, val) { const n = [...cmeEnxoval]; n[idx].status = val; setCmeEnxoval(n); }

    function enviarPlantao() {
      if (!setor || !turno) return alert("Preencha os campos obrigatórios (Unidade e Turno)!");
      if (!nenhumEscalado && !isBotaoLiberado) return alert("ATENÇÃO: Você precisa checar a presença ou justificar a ausência de TODOS os colaboradores escalados antes de enviar!");

      const novasAusencias = [];
      escaladosHoje.forEach(c => {
         if (!presencas[c.id]) {
             novasAusencias.push({
                 colaborador: c.nome,
                 matricula: c.matricula,
                 setor: setor,
                 motivo: motivosAusencia[c.id],
                 data: dataAtual.toLocaleDateString('pt-BR'),
                 turno: turno
             });
             registrarLog(`Ausência automática registrada: ${c.nome} (${turno})`);
         }
      });

      if (novasAusencias.length > 0) {
          setAusencias(prev => [...novasAusencias, ...prev]);
      }

      const novoPlantao = {
        id: Date.now(), diaPlantao, mes: mesAtual, ano: anoAtual,
        dataHora: dataHoraFixa, setor, turno,
        enfPresentes: calcEnfPres, tecPresentes: calcTecPres,
        leitosOperacionais: infoSetorSelecionado.leitosOperacionais,
        ocupados: mostraCenso ? (parseInt(ocupados) || 0) : 0,
        bloqueados: mostraCenso ? (parseInt(bloqueados) || 0) : 0,
        isolamento: mostraCenso ? (parseInt(isolamento) || 0) : 0,
        isoDetalhes: mostraCenso ? { contato: parseInt(isoContato)||0, respiratorio: parseInt(isoRespiratorio)||0, ambos: parseInt(isoAmbos)||0 } : { contato: 0, respiratorio: 0, ambos: 0 },
        observacoes,
        protocoloAgravo: isUI ? { qtd: parseInt(agravoQtd) || 0, leitos: agravoLeitos } : null,
        dialiseSLED: isUTI ? parseInt(dialiseSLED) || 0 : null,
        dialiseHL: isUTI ? parseInt(dialiseHL) || 0 : null,
        ecmo: isUTI ? ecmo : null,
        salasCirurgicas: isCentroCirurgico ? salasCirurgicas.filter(s => s.sala || s.procedimento) : null,
        ceic: isCEIC ? { atendimentosUnidades: ceicAtendimentosUnidades, atendimentos: ceicAtendimentos, areasVisitadas: ceicAreasVisitadas, transportes: ceicTransportes } : null,
        cetip: isCETIP ? { atendimentos: cetipAtendimentos } : null,
        dados03PA: is03PA ? { prontoAtendimento: paProntoAtendimento, observacao: paObservacao, triagem: paTriagem } : null,
        cme: isCME ? { equipamentos: cmeEquipamentos, enxoval: cmeEnxoval } : null
      };

      setPlantaoDiario([novoPlantao, ...plantaoDiario]);
      registrarLog(`Check diário enviado: ${setor} (Turno ${turno})`);
      
      setTurno(""); setObservacoes("");
      setPresencas({}); setMotivosAusencia({});
      setOcupados(""); setBloqueados(""); setIsolamento(""); setIsoContato(""); setIsoRespiratorio(""); setIsoAmbos("");
      setAgravoQtd(""); setAgravoLeitos(""); setDialiseSLED(""); setDialiseHL(""); setEcmo("Não");
      setSalasCirurgicas([{ id: Date.now(), sala: "", procedimento: "", montada: false, emCurso: false, rpa: false, agEnf: "", agUTI: "" }]);
      setCeicAtendimentosUnidades(""); setCeicAtendimentos(""); setCeicAreasVisitadas(""); setCeicTransportes("");
      setCetipAtendimentos("");
      setPaProntoAtendimento({ atendimentos: "", internados: "", transferidos: "", obitos: "", obs: "" });
      setPaObservacao({ atendimentos: "", internados: "", transferidos: "", obitos: "", obs: "" });
      setPaTriagem({ atendimentos: "", internados: "", transferidos: "", obitos: "", obs: "" });
      setCmeEquipamentos(CME_EQUIP_LIST.map(e => ({ nome: e, status: "" })));
      setCmeEnxoval(CME_ENXOVAL_LIST.map(e => ({ nome: e, status: "" })));
      
      alert("Check Diário enviado com sucesso!");
    }

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Check Diário do Plantão</h2>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-mono text-sm border border-slate-200">
            Dia: {diaPlantao} | {dataHoraFixa.split(' ')[1]}
          </span>
        </div>
        
        {podeEditar && (
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8">
            <h3 className="font-bold text-indigo-800 mb-4 flex items-center gap-2"><ClipboardCheck size={18} /> Formulário de Transição</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
                <select className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none disabled:bg-slate-200 disabled:text-slate-500 transition-all focus:ring-2 focus:ring-indigo-500" value={setor} onChange={e => setSetor(e.target.value)} disabled={!!unidadeLogada}>
                  <option value="">Selecione...</option>{setores.map((s, idx) => <option key={`${s.nome}-${idx}`} value={s.nome}>{s.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Turno</label>
                <select className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={turno} onChange={e => setTurno(e.target.value)}>
                  <option value="">Selecione...</option><option value="Manhã">Manhã (07h)</option><option value="Tarde">Tarde (13h)</option><option value="Noite">Noite (19h)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 bg-white p-5 rounded-xl shadow-sm border border-indigo-100/50">
              <div className="col-span-full mb-2 border-b border-slate-100 pb-3 flex justify-between items-center">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">Recursos Humanos (Auto-calculado)</span>
                {turno && setor && (
                   <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold shadow-sm border border-indigo-200">Planejamento: {enfEscalados} Enf | {tecEscalados} Tec</span>
                )}
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Enf. Presentes</label><input type="number" className="border border-indigo-100 bg-indigo-50/50 p-2.5 rounded-xl w-full text-indigo-800 font-bold outline-none cursor-not-allowed" value={calcEnfPres} readOnly title="Calculado automaticamente via Checklist" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Téc. Presentes</label><input type="number" className="border border-indigo-100 bg-indigo-50/50 p-2.5 rounded-xl w-full text-indigo-800 font-bold outline-none cursor-not-allowed" value={calcTecPres} readOnly title="Calculado automaticamente via Checklist" /></div>

              {/* Tabela de Checklist Nominal */}
              <div className="col-span-full mt-4">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
                    <h4 className="font-bold text-slate-700 text-sm uppercase flex items-center gap-2"><Users size={16} className="text-indigo-500"/> Checklist Nominal de Presença</h4>
                    {turno && setor && escaladosHoje.length > 0 && (
                       <button type="button" onClick={() => {
                          const todas = {};
                          escaladosHoje.forEach(c => todas[c.id] = true);
                          setPresencas(todas);
                       }} className="mt-2 md:mt-0 text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-200 transition-colors shadow-sm">
                          <CheckCircle size={14} className="inline mr-1" /> Marcar Todos Presentes
                       </button>
                    )}
                 </div>
                 
                 <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-inner bg-slate-50">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                       <thead>
                          <tr className="bg-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                             <th className="p-3 border-b border-slate-300">Colaborador</th>
                             <th className="p-3 border-b border-slate-300">Cargo</th>
                             <th className="p-3 border-b border-slate-300 text-center w-24">Presente?</th>
                             <th className="p-3 border-b border-slate-300">Motivo (se ausente)</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-200">
                          {!turno ? (
                             <tr><td colSpan="4" className="p-6 text-center text-sm text-slate-500 italic">Por favor, <strong className="text-slate-700">selecione o Turno</strong> acima para carregar a lista de colaboradores da unidade.</td></tr>
                          ) : colabsSetor.length === 0 ? (
                             <tr><td colSpan="4" className="p-6 text-center text-sm text-slate-500 italic">Sua unidade não possui colaboradores cadastrados.<br/>Solicite o cadastro na <strong>Gestão de Colaboradores</strong>.</td></tr>
                          ) : escaladosHoje.length === 0 ? (
                             <tr><td colSpan="4" className="p-6 text-center text-sm text-slate-500 italic">Nenhum colaborador escalado localizado.</td></tr>
                          ) : (
                             escaladosHoje.map(c => (
                                <tr key={c.id} className={`transition-colors ${presencas[c.id] ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'bg-white hover:bg-slate-50'}`}>
                                   <td className="p-3">
                                      <div className="text-sm font-bold text-slate-800">{c.nome}</div>
                                      <div className="text-xs text-slate-400 font-mono">Mat: {c.matricula}</div>
                                   </td>
                                   <td className="p-3 text-sm font-medium text-slate-600">{c.cargo}</td>
                                   <td className="p-3 text-center">
                                      <input type="checkbox" className="w-5 h-5 accent-indigo-600 cursor-pointer rounded border-slate-300" 
                                             checked={!!presencas[c.id]} 
                                             onChange={e => setPresencas({...presencas, [c.id]: e.target.checked})} />
                                   </td>
                                   <td className="p-3">
                                      <input type="text" 
                                             className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 transition-all" 
                                             placeholder={presencas[c.id] ? "Em serviço (Presente)" : "Digite o motivo da ausência..."}
                                             disabled={!!presencas[c.id]}
                                             value={motivosAusencia[c.id] || ""}
                                             onChange={e => setMotivosAusencia({...motivosAusencia, [c.id]: e.target.value})} />
                                   </td>
                                </tr>
                             ))
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>

            {/* SEÇÃO DINÂMICA: Censo de Leitos (Apenas UI, UTI e Emergência Referenciada) */}
            {mostraCenso && (
              <div className="mb-4 bg-white p-5 rounded-xl shadow-sm border border-indigo-100/50 animate-fade-in">
                 <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3 border-b border-slate-100 pb-2 flex items-center gap-2"><Activity size={16} className="text-indigo-500"/> Censo de Leitos (Capacidade Operacional: {infoSetorSelecionado?.leitosOperacionais || 0})</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-700 mb-1">Leitos Ocupados</label>
                       <input type="number" min="0" className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={ocupados} onChange={e => setOcupados(e.target.value)} />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-700 mb-1">Leitos Bloqueados</label>
                       <input type="number" min="0" className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={bloqueados} onChange={e => setBloqueados(e.target.value)} />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-700 mb-1">Pacientes em Isolamento</label>
                       <input type="number" min="0" className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={isolamento} onChange={e => setIsolamento(e.target.value)} />
                    </div>
                 </div>
                 {parseInt(isolamento) > 0 && (
                    <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2">
                       <div><label className="block text-[10px] font-bold text-slate-500 uppercase">Contato</label><input type="number" min="0" className="border border-slate-300 p-1.5 rounded-lg w-full mt-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={isoContato} onChange={e => setIsoContato(e.target.value)} /></div>
                       <div><label className="block text-[10px] font-bold text-slate-500 uppercase">Respiratório</label><input type="number" min="0" className="border border-slate-300 p-1.5 rounded-lg w-full mt-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={isoRespiratorio} onChange={e => setIsoRespiratorio(e.target.value)} /></div>
                       <div><label className="block text-[10px] font-bold text-slate-500 uppercase">Ambos</label><input type="number" min="0" className="border border-slate-300 p-1.5 rounded-lg w-full mt-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={isoAmbos} onChange={e => setIsoAmbos(e.target.value)} /></div>
                    </div>
                 )}
              </div>
            )}

            {/* SEÇÃO DINÂMICA: Protocolo de Agravo (Unidades de Internação - UI) */}
            {isUI && (
              <div className="mb-4 bg-white p-5 rounded-xl shadow-sm border border-indigo-100/50 animate-fade-in">
                 <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3 border-b border-slate-100 pb-2 flex items-center gap-2"><Activity size={16} className="text-indigo-500"/> Protocolo de Agravo</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                       <label className="block text-xs font-bold text-slate-700 mb-1">Qtd. de Leitos/Pacientes</label>
                       <input type="number" min="0" className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={agravoQtd} onChange={e => setAgravoQtd(e.target.value)} placeholder="0" />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-slate-700 mb-1">Quais leitos?</label>
                       <input type="text" className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={agravoLeitos} onChange={e => setAgravoLeitos(e.target.value)} placeholder="Ex: Leito 05, Leito 12..." />
                    </div>
                 </div>
              </div>
            )}

            {/* SEÇÃO: CEIC */}
            {isCEIC && (
              <div className="mb-4 bg-white p-5 rounded-xl shadow-sm border border-indigo-100/50 animate-fade-in">
                 <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3 border-b border-slate-100 pb-2 flex items-center gap-2"><Activity size={16} className="text-indigo-500"/> Painel CEIC</h4>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div><label className="block text-xs font-bold text-slate-700 mb-1">Atendimentos nas Unidades</label><input type="number" min="0" className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={ceicAtendimentosUnidades} onChange={e => setCeicAtendimentosUnidades(e.target.value)} /></div>
                    <div><label className="block text-xs font-bold text-slate-700 mb-1">Atendimentos na CEIC</label><input type="number" min="0" className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={ceicAtendimentos} onChange={e => setCeicAtendimentos(e.target.value)} /></div>
                    <div><label className="block text-xs font-bold text-slate-700 mb-1">Total Áreas Visitadas</label><input type="number" min="0" className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={ceicAreasVisitadas} onChange={e => setCeicAreasVisitadas(e.target.value)} /></div>
                    <div><label className="block text-xs font-bold text-slate-700 mb-1">Total de Transportes</label><input type="number" min="0" className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={ceicTransportes} onChange={e => setCeicTransportes(e.target.value)} /></div>
                 </div>
              </div>
            )}

            {/* SEÇÃO: CETIP */}
            {isCETIP && (
              <div className="mb-4 bg-white p-5 rounded-xl shadow-sm border border-indigo-100/50 animate-fade-in">
                 <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3 border-b border-slate-100 pb-2 flex items-center gap-2"><Activity size={16} className="text-indigo-500"/> Painel CETIP</h4>
                 <div className="w-full md:w-1/4">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Número de Atendimentos</label>
                    <input type="number" min="0" className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={cetipAtendimentos} onChange={e => setCetipAtendimentos(e.target.value)} />
                 </div>
              </div>
            )}

            {/* SEÇÃO: 03PA (Pronto Atendimento) */}
            {is03PA && (
              <div className="mb-4 bg-white p-5 rounded-xl shadow-sm border border-indigo-100/50 animate-fade-in overflow-hidden">
                 <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3 border-b border-slate-100 pb-2 flex items-center gap-2"><Activity size={16} className="text-orange-500"/> Controle de Atendimentos (Térreo - CAM)</h4>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                       <thead>
                          <tr className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider text-center">
                             <th className="p-2 border border-slate-200 text-left bg-slate-200 w-40">Unidades</th>
                             <th className="p-2 border border-slate-200 w-24">Nº Atend.</th>
                             <th className="p-2 border border-slate-200 w-24">Nº Internados</th>
                             <th className="p-2 border border-slate-200 w-24">Transferidos</th>
                             <th className="p-2 border border-slate-200 w-20">Óbitos</th>
                             <th className="p-2 border border-slate-200 text-left">Observações / Recomendações</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr className="hover:bg-slate-50">
                             <td className="p-2 border border-slate-200 font-bold text-xs bg-orange-500 text-white">Pronto Atendimento</td>
                             <td className="p-1 border border-slate-200"><input type="number" className="w-full p-1.5 text-xs text-center outline-none bg-transparent" value={paProntoAtendimento.atendimentos} onChange={e => setPaProntoAtendimento({...paProntoAtendimento, atendimentos: e.target.value})} /></td>
                             <td className="p-1 border border-slate-200"><input type="number" className="w-full p-1.5 text-xs text-center outline-none bg-transparent" value={paProntoAtendimento.internados} onChange={e => setPaProntoAtendimento({...paProntoAtendimento, internados: e.target.value})} /></td>
                             <td className="p-1 border border-slate-200"><input type="number" className="w-full p-1.5 text-xs text-center outline-none bg-transparent" value={paProntoAtendimento.transferidos} onChange={e => setPaProntoAtendimento({...paProntoAtendimento, transferidos: e.target.value})} /></td>
                             <td className="p-1 border border-slate-200"><input type="number" className="w-full p-1.5 text-xs text-center outline-none bg-transparent" value={paProntoAtendimento.obitos} onChange={e => setPaProntoAtendimento({...paProntoAtendimento, obitos: e.target.value})} /></td>
                             <td className="p-1 border border-slate-200"><input type="text" className="w-full p-1.5 text-xs outline-none bg-transparent" placeholder="Observações..." value={paProntoAtendimento.obs} onChange={e => setPaProntoAtendimento({...paProntoAtendimento, obs: e.target.value})} /></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                             <td className="p-2 border border-slate-200 font-bold text-xs bg-orange-500 text-white">Observação</td>
                             <td className="p-1 border border-slate-200"><input type="number" className="w-full p-1.5 text-xs text-center outline-none bg-transparent" value={paObservacao.atendimentos} onChange={e => setPaObservacao({...paObservacao, atendimentos: e.target.value})} /></td>
                             <td className="p-1 border border-slate-200"><input type="number" className="w-full p-1.5 text-xs text-center outline-none bg-transparent" value={paObservacao.internados} onChange={e => setPaObservacao({...paObservacao, internados: e.target.value})} /></td>
                             <td className="p-1 border border-slate-200"><input type="number" className="w-full p-1.5 text-xs text-center outline-none bg-transparent" value={paObservacao.transferidos} onChange={e => setPaObservacao({...paObservacao, transferidos: e.target.value})} /></td>
                             <td className="p-1 border border-slate-200"><input type="number" className="w-full p-1.5 text-xs text-center outline-none bg-transparent" value={paObservacao.obitos} onChange={e => setPaObservacao({...paObservacao, obitos: e.target.value})} /></td>
                             <td className="p-1 border border-slate-200"><input type="text" className="w-full p-1.5 text-xs outline-none bg-transparent" placeholder="Observações..." value={paObservacao.obs} onChange={e => setPaObservacao({...paObservacao, obs: e.target.value})} /></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                             <td className="p-2 border border-slate-200 font-bold text-xs bg-orange-500 text-white">Triagem</td>
                             <td className="p-1 border border-slate-200"><input type="number" className="w-full p-1.5 text-xs text-center outline-none bg-transparent" value={paTriagem.atendimentos} onChange={e => setPaTriagem({...paTriagem, atendimentos: e.target.value})} /></td>
                             <td className="p-1 border border-slate-200"><input type="number" className="w-full p-1.5 text-xs text-center outline-none bg-transparent" value={paTriagem.internados} onChange={e => setPaTriagem({...paTriagem, internados: e.target.value})} /></td>
                             <td className="p-1 border border-slate-200"><input type="number" className="w-full p-1.5 text-xs text-center outline-none bg-transparent" value={paTriagem.transferidos} onChange={e => setPaTriagem({...paTriagem, transferidos: e.target.value})} /></td>
                             <td className="p-1 border border-slate-200"><input type="number" className="w-full p-1.5 text-xs text-center outline-none bg-transparent" value={paTriagem.obitos} onChange={e => setPaTriagem({...paTriagem, obitos: e.target.value})} /></td>
                             <td className="p-1 border border-slate-200"><input type="text" className="w-full p-1.5 text-xs outline-none bg-transparent" placeholder="Observações..." value={paTriagem.obs} onChange={e => setPaTriagem({...paTriagem, obs: e.target.value})} /></td>
                          </tr>
                          <tr className="bg-emerald-50 font-bold text-emerald-800 text-center text-sm">
                             <td className="p-2 border border-slate-200 text-right text-slate-600">Total:</td>
                             <td className="p-2 border border-slate-200">{(parseInt(paProntoAtendimento.atendimentos)||0) + (parseInt(paObservacao.atendimentos)||0) + (parseInt(paTriagem.atendimentos)||0)}</td>
                             <td className="p-2 border border-slate-200">{(parseInt(paProntoAtendimento.internados)||0) + (parseInt(paObservacao.internados)||0) + (parseInt(paTriagem.internados)||0)}</td>
                             <td className="p-2 border border-slate-200">{(parseInt(paProntoAtendimento.transferidos)||0) + (parseInt(paObservacao.transferidos)||0) + (parseInt(paTriagem.transferidos)||0)}</td>
                             <td className="p-2 border border-slate-200 bg-slate-100"></td><td className="p-2 border border-slate-200 bg-slate-100"></td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </div>
            )}

            {/* SEÇÃO: CME */}
            {isCME && (
              <div className="mb-4 bg-white p-5 rounded-xl shadow-sm border border-indigo-100/50 animate-fade-in flex flex-col xl:flex-row gap-6">
                 <div className="flex-1">
                    <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3 border-b border-slate-100 pb-2 flex items-center gap-2"><Activity size={16} className="text-slate-500"/> Central de Material (Equipamentos)</h4>
                    <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                       <thead><tr className="bg-slate-200 text-slate-700 uppercase"><th className="p-2 border border-slate-300">Equipamentos</th><th className="p-2 border border-slate-300 text-center w-24">Funcionando</th><th className="p-2 border border-slate-300 text-center w-24">Manutenção</th></tr></thead>
                       <tbody>
                          {cmeEquipamentos.map((item, idx) => (
                             <tr key={item.nome} className="hover:bg-slate-50">
                                <td className="p-1.5 border border-slate-200 font-semibold text-slate-700">{item.nome}</td>
                                <td className="p-1.5 border border-slate-200 text-center"><input type="radio" name={`equip-${idx}`} className="w-4 h-4 accent-indigo-600 cursor-pointer" checked={item.status === 'Funcionando'} onChange={() => handleCmeEquip(idx, 'Funcionando')} /></td>
                                <td className="p-1.5 border border-slate-200 text-center"><input type="radio" name={`equip-${idx}`} className="w-4 h-4 accent-indigo-600 cursor-pointer" checked={item.status === 'Manutenção'} onChange={() => handleCmeEquip(idx, 'Manutenção')} /></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3 border-b border-slate-100 pb-2 flex items-center gap-2"><Activity size={16} className="text-slate-500"/> Enxoval Cirúrgico</h4>
                    <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                       <thead><tr className="bg-slate-200 text-slate-700 uppercase"><th className="p-2 border border-slate-300">Enxoval</th><th className="p-2 border border-slate-300 text-center w-24">Disponível</th><th className="p-2 border border-slate-300 text-center w-24">Em Falta</th></tr></thead>
                       <tbody>
                          {cmeEnxoval.map((item, idx) => (
                             <tr key={item.nome} className="hover:bg-slate-50">
                                <td className="p-1.5 border border-slate-200 font-semibold text-slate-700">{item.nome}</td>
                                <td className="p-1.5 border border-slate-200 text-center"><input type="radio" name={`enxoval-${idx}`} className="w-4 h-4 accent-indigo-600 cursor-pointer" checked={item.status === 'Disponível'} onChange={() => handleCmeEnxoval(idx, 'Disponível')} /></td>
                                <td className="p-1.5 border border-slate-200 text-center"><input type="radio" name={`enxoval-${idx}`} className="w-4 h-4 accent-indigo-600 cursor-pointer" checked={item.status === 'Em falta'} onChange={() => handleCmeEnxoval(idx, 'Em falta')} /></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}

            {/* SEÇÃO DINÂMICA: Indicadores Extras para UTI's */}
            {isUTI && (
              <div className="mb-4 bg-white p-5 rounded-xl shadow-sm border border-indigo-100/50 animate-fade-in">
                 <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3 border-b border-slate-100 pb-2 flex items-center gap-2"><Activity size={16} className="text-indigo-500"/> Indicadores Específicos (UTI)</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Diálise SLED (Qtd)</label><input type="number" min="0" className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={dialiseSLED} onChange={e => setDialiseSLED(e.target.value)} placeholder="Quantidade SLED..." /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Diálise HL (Qtd)</label><input type="number" min="0" className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={dialiseHL} onChange={e => setDialiseHL(e.target.value)} placeholder="Quantidade HL..." /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">ECMO Ativo?</label><select className="border border-slate-300 p-2.5 rounded-xl w-full bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={ecmo} onChange={e => setEcmo(e.target.value)}><option value="Não">Não</option><option value="Sim">Sim</option></select></div>
                 </div>
              </div>
            )}

            {/* SEÇÃO DINÂMICA: Painel Centro Cirúrgico */}
            {isCentroCirurgico && (
              <div className="mb-4 bg-white p-5 rounded-xl shadow-sm border border-indigo-100/50 animate-fade-in overflow-hidden">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-2 mb-3 gap-2">
                     <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2"><Activity size={16} className="text-indigo-500"/> Painel Centro Cirúrgico (Salas)</h4>
                     <button type="button" onClick={() => setSalasCirurgicas([...salasCirurgicas, { id: Date.now(), sala: "", procedimento: "", montada: false, emCurso: false, rpa: false, agEnf: "", agUTI: "" }])} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors border border-indigo-200 flex items-center gap-1"><Plus size={14}/> Adicionar Sala</button>
                 </div>
                 <div className="overflow-x-auto pb-2">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                       <thead>
                          <tr className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                             <th className="p-2 border border-slate-200 w-32">Salas PS/Eletivas</th>
                             <th className="p-2 border border-slate-200">Procedimento cirúrgico</th>
                             <th className="p-2 border border-slate-200 text-center w-16">Montada</th>
                             <th className="p-2 border border-slate-200 text-center w-16">Em curso</th>
                             <th className="p-2 border border-slate-200 text-center w-24">RPA em sala</th>
                             <th className="p-2 border border-slate-200 w-32">Ag Enf desde:</th>
                             <th className="p-2 border border-slate-200 w-32">Ag. UTI desde:</th>
                             <th className="p-2 border border-slate-200 w-10 text-center"></th>
                          </tr>
                       </thead>
                       <tbody>
                          {salasCirurgicas.map((row) => (
                             <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-1 border border-slate-200"><input type="text" className="w-full p-1.5 text-xs outline-none bg-transparent font-bold text-slate-700 uppercase" placeholder="SALA XX" value={row.sala} onChange={e => updateSala(row.id, 'sala', e.target.value)} /></td>
                                <td className="p-1 border border-slate-200"><input type="text" className="w-full p-1.5 text-xs outline-none bg-transparent text-slate-700" placeholder="Nome / Procedimento" value={row.procedimento} onChange={e => updateSala(row.id, 'procedimento', e.target.value)} /></td>
                                <td className="p-1 border border-slate-200 text-center"><input type="checkbox" className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600" checked={row.montada} onChange={e => updateSala(row.id, 'montada', e.target.checked)} /></td>
                                <td className="p-1 border border-slate-200 text-center"><input type="checkbox" className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600" checked={row.emCurso} onChange={e => updateSala(row.id, 'emCurso', e.target.checked)} /></td>
                                <td className="p-1 border border-slate-200 text-center"><input type="checkbox" className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600" checked={row.rpa} onChange={e => updateSala(row.id, 'rpa', e.target.checked)} /></td>
                                <td className="p-1 border border-slate-200"><input type="text" className="w-full p-1.5 text-xs outline-none bg-transparent text-slate-700" placeholder="Ex: 22h" value={row.agEnf} onChange={e => updateSala(row.id, 'agEnf', e.target.value)} /></td>
                                <td className="p-1 border border-slate-200"><input type="text" className="w-full p-1.5 text-xs outline-none bg-transparent text-slate-700" placeholder="Ex: 22h de 30/01" value={row.agUTI} onChange={e => updateSala(row.id, 'agUTI', e.target.value)} /></td>
                                <td className="p-1 border border-slate-200 text-center"><button type="button" onClick={() => setSalasCirurgicas(salasCirurgicas.filter(s => s.id !== row.id))} className="text-rose-400 hover:text-rose-600 p-1 transition-colors"><Trash2 size={14}/></button></td>
                             </tr>
                          ))}
                          {salasCirurgicas.length === 0 && <tr><td colSpan="8" className="p-4 text-center text-xs text-slate-500 italic">Nenhuma sala adicionada. Clique em "Adicionar Sala" acima.</td></tr>}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observações Gerais</label>
              <textarea className="border border-slate-300 p-3 rounded-xl w-full bg-white h-24 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none" value={observacoes} onChange={e => setObservacoes(e.target.value)} />
            </div>

            <div className="flex justify-end">
              <button className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md ${isBotaoLiberado || nenhumEscalado ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`} onClick={isBotaoLiberado || nenhumEscalado ? enviarPlantao : () => alert('Você precisa checar a presença ou preencher a justificativa de TODOS os colaboradores escalados!')}>
                <Send size={18} /> {isBotaoLiberado || nenhumEscalado ? "Finalizar e Enviar" : "Envio Bloqueado"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function Ausencias() {
    const podeEditar = ["Plantão Assistencial", "Administrativo"].includes(perfilAtual);
    const [matAusente, setMatAusente] = useState("");
    const [motivoAusente, setMotivoAusente] = useState("");
    const [turnoAusente, setTurnoAusente] = useState("Manhã");
    const colabEncontrado = colaboradores.find(c => c.matricula === matAusente);

    function registrar() {
      if(!colabEncontrado || !motivoAusente) return alert("Insira uma matrícula válida e um motivo!");
      
      const setorParaRegistrar = unidadeLogada || colabEncontrado.setor;

      setAusencias([{ 
        colaborador: colabEncontrado.nome, matricula: colabEncontrado.matricula, setor: setorParaRegistrar, motivo: motivoAusente, 
        data: dataAtual.toLocaleDateString('pt-BR'), turno: turnoAusente
      }, ...ausencias]);
      
      registrarLog(`Ausência avulsa registrada: ${colabEncontrado.nome} (Mat. ${matAusente}) no turno ${turnoAusente}`);
      setMatAusente(""); setMotivoAusente("");
      alert("Ausência extra registrada com sucesso!");
    }

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Registro Extra de Ausências</h2>
        
        {podeEditar && (
          <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 mb-8 animate-fade-in shadow-inner">
            <h3 className="font-bold text-rose-800 mb-4 flex items-center gap-2">
              <UserMinus size={18} /> Registrar Ausência Manual
            </h3>
            <p className="text-sm text-rose-700 font-medium mb-4">Utilize este formulário apenas para registrar ausências que não foram apontadas automaticamente pelo checklist do Plantão Diário.</p>
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-[15%]">
                  <label className="block text-sm font-bold text-rose-900 mb-1">Matrícula</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-3 text-rose-400" />
                    <input className="border border-rose-300 p-2.5 pl-9 rounded-xl bg-white w-full focus:ring-2 focus:ring-rose-500 outline-none transition-all" value={matAusente} onChange={e => setMatAusente(e.target.value)} placeholder="Ex: 1001" />
                  </div>
                </div>
                <div className="w-full md:w-[25%]"><label className="block text-sm font-bold text-rose-900 mb-1">Colaborador Localizado</label><input className="border border-rose-200 p-2.5 rounded-xl bg-rose-100/50 w-full text-rose-800 font-medium" value={colabEncontrado ? `${colabEncontrado.nome} (${colabEncontrado.cargo})` : "Não encontrado"} disabled /></div>
                <div className="w-full md:w-[15%]">
                  <label className="block text-sm font-bold text-rose-900 mb-1">Turno</label>
                  <select className="border border-rose-300 p-2.5 rounded-xl bg-white w-full focus:ring-2 focus:ring-rose-500 outline-none transition-all" value={turnoAusente} onChange={e => setTurnoAusente(e.target.value)}><option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Noite">Noite</option></select>
                </div>
                <div className="w-full md:w-[25%]"><label className="block text-sm font-bold text-rose-900 mb-1">Motivo / Observação</label><input className="border border-rose-300 p-2.5 rounded-xl bg-white w-full focus:ring-2 focus:ring-rose-500 outline-none transition-all" value={motivoAusente} onChange={e => setMotivoAusente(e.target.value)} placeholder="Ex: Atestado..." /></div>
                <button onClick={registrar} className="bg-rose-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-rose-700 h-[46px] transition-all shadow-md active:scale-95">Gravar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function SetoresConfig() {
    const podeEditar = perfilAtual === "Administrativo";
    const setoresVisiveis = (perfilAtual === "Liderança" && unidadeLogada) ? setores.filter(s => s.nome === unidadeLogada) : setores;

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Setores e Parâmetros</h2>
        <p className="mb-6 text-slate-600 font-medium bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm">Apenas o perfil <span className="font-bold text-indigo-700">Administrativo</span> pode ajustar a capacidade de leitos operacionais e os parâmetros mínimos de segurança.</p>
        
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-4 py-3">Setor</th><th className="p-4 py-3">Grupo (Aba)</th><th className="p-4 py-3 text-center">Leitos Operacionais</th><th className="p-4 py-3 text-center">Mín. Enfermeiros (Por Turno)</th><th className="p-4 py-3 text-center">Mín. Técnicos (Por Turno)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {setoresVisiveis.map((s, idx) => {
                const realIndex = setores.findIndex(setor => setor === s);
                return (
                  <tr key={`${s.nome}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{s.nome}</td>
                    <td className="p-4 text-sm text-slate-500 font-medium">{s.grupo}</td>
                    <td className="p-4 text-center"><input type="number" disabled={!podeEditar} className="border border-slate-300 p-2 rounded-lg w-24 text-center bg-white disabled:bg-transparent disabled:border-transparent font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={s.leitosOperacionais} onChange={e => { const novos = [...setores]; novos[realIndex].leitosOperacionais = parseInt(e.target.value); setSetores(novos); }} /></td>
                    <td className="p-4 text-center"><input type="number" disabled={!podeEditar} className="border border-slate-300 p-2 rounded-lg w-24 text-center bg-white disabled:bg-transparent disabled:border-transparent font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={s.minEnf} onChange={e => { const novos = [...setores]; novos[realIndex].minEnf = parseInt(e.target.value); setSetores(novos); }} /></td>
                    <td className="p-4 text-center"><input type="number" disabled={!podeEditar} className="border border-slate-300 p-2 rounded-lg w-24 text-center bg-white disabled:bg-transparent disabled:border-transparent font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={s.minTec} onChange={e => { const novos = [...setores]; novos[realIndex].minTec = parseInt(e.target.value); setSetores(novos); }} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }


  function DetalhamentoPlantao() {
     const [turnoFiltro, setTurnoFiltro] = useState("Diurno");
     const [dataRef, setDataRef] = useState(dataHojeInput);
     const [agrupamento, setAgrupamento] = useState("Todos");

     const [anoStr, mesStr, diaStr] = dataRef.split('-');
     const diaSel = parseInt(diaStr, 10);
     const mesSel = parseInt(mesStr, 10) - 1;
     const anoSel = parseInt(anoStr, 10);
     const dataFormatada = `${String(diaSel).padStart(2, '0')}/${String(mesSel + 1).padStart(2, '0')}/${anoSel}`;

     let totalEscalados = 0;
     let totalPresentes = 0;
     let totalAusenciasEnf = 0;
     let totalAusenciasTec = 0;

     const dadosTabela = setores.map(s => {
        let escEnf = 0, escTec = 0;
        const escMesNominal = escalaNominal.find(e => e.mes === mesSel && e.ano === anoSel && e.setor === s.nome);
        if (escMesNominal) {
           Object.entries(escMesNominal.grid).forEach(([colabId, diasColab]) => {
              const val = diasColab[diaSel];
              if (val) {
                 const c = colaboradores.find(col => col.id.toString() === colabId);
                 if (c) {
                    const isEnf = c.cargo.includes("Enferm");
                    if (turnoFiltro === 'Diurno' && ['M', 'T', 'D', 'PRD'].includes(val)) { if(isEnf) escEnf++; else escTec++; }
                    if (turnoFiltro === 'Noturno' && ['N', 'PRN'].includes(val)) { if(isEnf) escEnf++; else escTec++; }
                 }
              }
           });
        }

        let ausEnf = 0, ausTec = 0;
        const ausenciasDia = ausencias.filter(a => a.setor === s.nome && a.data === dataFormatada);
        ausenciasDia.forEach(a => {
           const isManhaTarde = a.turno === "Manhã" || a.turno === "Tarde";
           if ((turnoFiltro === "Diurno" && isManhaTarde) || (turnoFiltro === "Noturno" && a.turno === "Noite")) {
              const c = colaboradores.find(col => col.matricula === a.matricula);
              if (c && c.cargo.includes("Enferm")) ausEnf++; else ausTec++;
           }
        });

        let remInEnf = 0, remInTec = 0, remOutEnf = 0, remOutTec = 0;
        remanejamentos.forEach(r => {
           if (r.data === dataFormatada && ((turnoFiltro === "Diurno" && (r.turno === "Manhã" || r.turno === "Tarde")) || (turnoFiltro === "Noturno" && r.turno === "Noite"))) {
              const c = colaboradores.find(col => col.matricula === r.matricula);
              const isEnf = c && c.cargo.includes("Enferm");
              if (r.destino === s.nome) { if(isEnf) remInEnf++; else remInTec++; }
              if (r.origem === s.nome) { if(isEnf) remOutEnf++; else remOutTec++; }
           }
        });

        const presEnf = escEnf - ausEnf + remInEnf - remOutEnf;
        const presTec = escTec - ausTec + remInTec - remOutTec;

        totalEscalados += (escEnf + escTec);
        totalPresentes += (presEnf + presTec);
        totalAusenciasEnf += ausEnf;
        totalAusenciasTec += ausTec;

        let status = "NORMAL";
        if (presEnf < s.minEnf || presTec < s.minTec) status = "CRÍTICO";
        else if (presEnf === s.minEnf && presTec === s.minTec) status = "FURO BASE";

        return {
           nome: s.nome, minEnf: s.minEnf, minTec: s.minTec,
           escEnf, escTec, ausEnf, ausTec, remInEnf, remInTec, remOutEnf, remOutTec,
           presEnf, presTec, status
        };
     });

     return (
        <div>
           <div className="flex flex-col xl:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 gap-4">
             <div className="flex flex-wrap items-center gap-6">
               <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button onClick={() => setTurnoFiltro("Diurno")} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${turnoFiltro === "Diurno" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>Diurno</button>
                  <button onClick={() => setTurnoFiltro("Noturno")} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${turnoFiltro === "Noturno" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>Noturno</button>
               </div>
               <div className="border-l pl-6 border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Data Ref.</label>
                  <input type="date" className="border-none bg-transparent font-bold text-slate-700 outline-none w-32" value={dataRef} onChange={e => setDataRef(e.target.value)}/>
               </div>
               <div className="border-l pl-6 border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5"><Filter size={10} className="inline mr-1"/> Agrupamento</label>
                  <select className="border-none bg-transparent font-bold text-slate-700 outline-none" value={agrupamento} onChange={e => setAgrupamento(e.target.value)}>
                     <option>Todos</option><option>Unidades de Internação</option><option>UTI's</option>
                  </select>
               </div>
             </div>
             <div className="flex items-center gap-6 xl:border-l xl:pl-6 border-slate-200">
                <div className="flex items-center gap-2">
                   <div className="p-2 bg-indigo-50 rounded-full text-indigo-600"><Users size={18}/></div>
                   <div><p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Escalados</p><p className="text-xl font-black text-slate-800 leading-tight">{totalEscalados}</p></div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="p-2 bg-emerald-50 rounded-full text-emerald-600"><CheckCircle size={18}/></div>
                   <div><p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Presentes</p><p className="text-xl font-black text-slate-800 leading-tight">{totalPresentes}</p></div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="p-2 bg-rose-50 rounded-full text-rose-600"><UserMinus size={18}/></div>
                   <div><p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Ausências (E/T)</p><p className="text-xl font-black text-slate-800 leading-tight"><span className="text-rose-600">{totalAusenciasEnf}</span> <span className="text-slate-300">|</span> <span className="text-rose-600">{totalAusenciasTec}</span></p></div>
                </div>
             </div>
           </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><ClipboardCheck className="text-indigo-600"/> Detalhamento do Plantão (Geral)</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                 <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b">
                       <tr><th className="p-4">Unidade & Status</th><th className="p-4 text-center">Mínimo Seg.</th><th className="p-4 text-center">Escalados</th><th className="p-4 text-center">Ausências</th><th className="p-4 text-center">Remanej.</th><th className="p-4 text-center">Presente Real</th><th className="p-4">Observações</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                       {dadosTabela.map(row => (
                          <tr key={row.nome} className="hover:bg-slate-50 transition-colors">
                             <td className="p-4">
                                <div className="font-bold text-slate-800 text-base">{row.nome}</div>
                                {row.status === "CRÍTICO" && <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-300 bg-rose-50 text-rose-600 uppercase"><AlertTriangle size={10} className="inline mr-1 -mt-0.5"/> CRÍTICO</span>}
                                {row.status === "FURO BASE" && <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded border border-orange-300 bg-orange-50 text-orange-600 uppercase"><AlertTriangle size={10} className="inline mr-1 -mt-0.5"/> FURO BASE</span>}
                             </td>
                             <td className="p-4 text-center text-slate-500 font-bold">{row.minEnf}E <span className="text-slate-300 font-normal">|</span> {row.minTec}T</td>
                             <td className="p-4 text-center font-bold text-indigo-700"><span className="bg-indigo-50 px-2 py-1 rounded">{row.escEnf}E</span> <span className="text-slate-300 font-normal">|</span> <span className="bg-indigo-50 px-2 py-1 rounded">{row.escTec}T</span></td>
                             <td className="p-4 text-center font-bold text-rose-600">
                                {row.ausEnf > 0 || row.ausTec > 0 ? <><span className="bg-rose-50 px-2 py-1 rounded">{row.ausEnf}E</span> <span className="text-slate-300 font-normal">|</span> <span className="bg-rose-50 px-2 py-1 rounded">{row.ausTec}T</span></> : <span className="text-slate-300">-</span>}
                             </td>
                             <td className="p-4 text-center font-bold text-emerald-600 text-xs">
                                {(row.remInEnf > 0 || row.remOutEnf > 0 || row.remInTec > 0 || row.remOutTec > 0) ? <><span className="bg-emerald-50 px-1.5 py-1 rounded">{(row.remInEnf-row.remOutEnf)>0?'+':''}{row.remInEnf-row.remOutEnf}E</span> <span className="text-slate-300 font-normal">|</span> <span className="bg-emerald-50 px-1.5 py-1 rounded">{(row.remInTec-row.remOutTec)>0?'+':''}{row.remInTec-row.remOutTec}T</span></> : <span className="text-slate-300">-</span>}
                             </td>
                             <td className="p-4 text-center font-black text-rose-600">{row.presEnf}E <span className="text-slate-300 font-normal">|</span> {row.presTec}T</td>
                             <td className="p-4 text-slate-400 italic text-xs">Sem observações.</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
     );
  }
  
  function Ausencias() {
     const [matBusca, setMatBusca] = useState("");
     const [motivo, setMotivo] = useState("Atestado");
     const [dataAusencia, setDataAusencia] = useState(dataHojeInput);
     const [turnoAus, setTurnoAus] = useState("Manhã");

     const colabEncontrado = colaboradores.find(c => c.matricula === matBusca);

     function handleSalvar(e) {
       e.preventDefault();
       if (!colabEncontrado) return alert("Colaborador não encontrado.");
       const [anoStr, mesStr, diaStr] = dataAusencia.split('-');
       const dataFormatada = `${diaStr}/${mesStr}/${anoStr}`;
       
       setAusencias(prev => [{
         id: Date.now(),
         colaborador: colabEncontrado.nome,
         matricula: colabEncontrado.matricula,
         setor: colabEncontrado.setor,
         motivo, data: dataFormatada, turno: turnoAus
       }, ...prev]);
       registrarLog(`Ausência registrada: ${colabEncontrado.nome} em ${dataFormatada} (${motivo})`);
       alert("Ausência registrada com sucesso!");
       setMatBusca("");
     }

     return (
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Gestão de Ausências</h2>
          
          {/* Assistencial e Liderança podem registrar (Supervisão apenas lê) */}
          {["Plantão Assistencial", "Liderança", "Administrativo"].includes(perfilAtual) && perfilAtual !== "Supervisão" && (
             <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 mb-8 shadow-inner animate-fade-in">
               <h3 className="font-bold text-rose-800 mb-4 flex items-center gap-2"><UserMinus size={18}/> Registrar Ausência (Falta/Atestado)</h3>
               <form onSubmit={handleSalvar} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div><label className="block text-xs font-bold text-rose-900 mb-1">Matrícula</label><input type="text" className="w-full border border-rose-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-rose-400" value={matBusca} onChange={e=>setMatBusca(e.target.value)} placeholder="Ex: 1001" required/></div>
                  <div className="md:col-span-2"><label className="block text-xs font-bold text-rose-900 mb-1">Motivo</label><select className="w-full border border-rose-200 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-400" value={motivo} onChange={e=>setMotivo(e.target.value)}><option>Atestado</option><option>Falta Injustificada</option><option>Licença/Folga Extra</option></select></div>
                  <div><label className="block text-xs font-bold text-rose-900 mb-1">Data</label><input type="date" className="w-full border border-rose-200 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-400" value={dataAusencia} onChange={e=>setDataAusencia(e.target.value)} required/></div>
                  <div><label className="block text-xs font-bold text-rose-900 mb-1">Turno</label><select className="w-full border border-rose-200 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-400" value={turnoAus} onChange={e=>setTurnoAus(e.target.value)}><option>Manhã</option><option>Tarde</option><option>Noite</option></select></div>
                  <div className="md:col-span-5 flex justify-end mt-2"><button type="submit" className="bg-rose-600 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-rose-700 active:scale-95 transition-all shadow-md">Registrar Ausência</button></div>
               </form>
             </div>
          )}

          <h3 className="font-bold text-slate-800 mt-2 mb-4">Ausências Registradas (Acompanhamento)</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
             <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                   <tr><th className="p-4">Colaborador</th><th className="p-4">Matrícula</th><th className="p-4">Setor</th><th className="p-4">Data/Turno</th><th className="p-4">Motivo</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                   {(() => {
                      let ausenciasVisiveis = ausencias;
                      if (perfilAtual === "Supervisão" && filtroGlobalSetor !== "") {
                         ausenciasVisiveis = ausencias.filter(a => a.setor === filtroGlobalSetor);
                      }
                      if (ausenciasVisiveis.length === 0) return <tr><td colSpan="5" className="p-6 text-center text-slate-500 italic">Nenhuma ausência registrada no sistema.</td></tr>;
                      return ausenciasVisiveis.map((a, i) => (
                         <tr key={i} className="hover:bg-slate-50 transition-colors">
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

  function SetoresConfig() {
     // ...
     return <div className="p-6 bg-white rounded-2xl border"><h2 className="text-2xl font-bold">Setores (Resumido)</h2></div>;
  }

  // =========================================================================
  // FAZER ESCALA NOMINAL (Modificado c/ Tabela Congelada e Filtro de Turno)
  // =========================================================================
  function FazerEscala() {
    const nomeMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
    const [anoSelecionado, setAnoSelecionado] = useState(anoAtual);
    const [filtroTurnoEscala, setFiltroTurnoEscala] = useState("Todos");
    
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveConformity, setSaveConformity] = useState(true);
    const [inconformidadesList, setInconformidadesList] = useState([]);

    const TIPOS_PLANTAO = [
      { code: 'D', hours: 12, label: 'Diurno (12h)', color: 'bg-indigo-100 text-indigo-800' }, { code: 'PRD', hours: 0, label: 'PR Diurno', color: 'bg-indigo-200 text-indigo-900' },
      { code: 'N', hours: 12, label: 'Noturno (12h)', color: 'bg-sky-100 text-sky-800' }, { code: 'PRN', hours: 0, label: 'PR Noturno', color: 'bg-sky-200 text-sky-900' },
      { code: 'M', hours: 6, label: 'Manhã (6h)', color: 'bg-blue-50 text-blue-700' }, { code: 'T', hours: 6, label: 'Tarde (6h)', color: 'bg-cyan-50 text-cyan-700' },
      { code: 'F', hours: 0, label: 'Folga', color: 'bg-emerald-50 text-emerald-600' }, { code: 'DSR', hours: 0, label: 'DSR', color: 'bg-emerald-100 text-emerald-700' },
      { code: 'FE', hours: 0, label: 'Férias', color: 'bg-amber-100 text-amber-700' }, { code: '-', hours: 0, label: 'Descanso 12x36', color: 'bg-slate-100 text-slate-500' },
      { code: '', hours: 0, label: 'Apagar', color: 'bg-white text-slate-400 border border-slate-300' }
    ];
    const [ferramentaSelecionada, setFerramentaSelecionada] = useState('D');

    // Filtra por unidade, depois por turno e ordena (Enfermeiro -> Técnico -> Alfabética)
    let colabsFiltrados = colaboradores.filter(c => c.setor === unidadeLogada);
    
    if (filtroTurnoEscala !== "Todos") {
      colabsFiltrados = colabsFiltrados.filter(c => {
         const t = c.turno.toLowerCase();
         if (filtroTurnoEscala === "Manhã" && (t.includes("manhã") || t.includes("diurno"))) return true;
         if (filtroTurnoEscala === "Tarde" && (t.includes("tarde") || t.includes("diurno"))) return true;
         if (filtroTurnoEscala === "Noite" && (t.includes("noite") || t.includes("noturno"))) return true;
         return false;
      });
    }

    colabsFiltrados.sort((a, b) => {
       const isEnfA = a.cargo.includes("Enferm");
       const isEnfB = b.cargo.includes("Enferm");
       if (isEnfA && !isEnfB) return -1;
       if (!isEnfA && isEnfB) return 1;
       return a.nome.localeCompare(b.nome);
    });

    const [gridData, setGridData] = useState({});
    useEffect(() => {
      const esc = escalaNominal.find(e => e.mes === mesSelecionado && e.ano === anoSelecionado && e.setor === unidadeLogada);
      setGridData(esc ? esc.grid : {});
    }, [mesSelecionado, anoSelecionado, unidadeLogada, escalaNominal]);

    const diasNoMes = new Date(anoSelecionado, mesSelecionado + 1, 0).getDate();
    const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);
    function obterDiaSemana(dia) { return new Date(anoSelecionado, mesSelecionado, dia).getDay(); }
    const diasDaSemanaAbrev = ["D", "S", "T", "Q", "Q", "S", "S"];

    function isDateInLeave(d, m, y, startDateStr, days) {
       if (!startDateStr || !days) return false;
       const [sY, sM, sD] = startDateStr.split('-').map(Number);
       const start = new Date(sY, sM - 1, sD); const current = new Date(y, m, d);
       const end = new Date(sY, sM - 1, sD); end.setDate(end.getDate() + parseInt(days) - 1);
       return current >= start && current <= end;
    }

    function handleCellClick(colab, diaClicado) {
      setGridData(prev => {
        const newGrid = { ...prev }; if (!newGrid[colab.id]) newGrid[colab.id] = {};
        const currentVal = newGrid[colab.id][diaClicado];
        const hasAnyShift = Object.values(newGrid[colab.id]).some(val => val !== null && val !== undefined && val !== '');

        if (!hasAnyShift && (!currentVal || currentVal === '')) {
          const is12x36 = colab.turno.includes("12h"); const isNoite = colab.turno.includes("noturno"); const isTarde = colab.turno.includes("tarde");
          const tr12 = isNoite ? 'N' : 'D'; const tr6 = isTarde ? 'T' : 'M';
          for (let d = diaClicado; d <= diasNoMes; d++) {
            if (is12x36) { newGrid[colab.id][d] = ((d - diaClicado) % 2 === 0) ? tr12 : '-'; } 
            else { const diaSemana = obterDiaSemana(d); newGrid[colab.id][d] = (diaSemana === 0 || diaSemana === 6) ? 'F' : tr6; }
          }
          if (is12x36) { for (let d = diaClicado - 1; d >= 1; d--) { newGrid[colab.id][d] = (Math.abs(diaClicado - d) % 2 === 0) ? tr12 : '-'; } } 
          else { for (let d = 1; d < diaClicado; d++) { const diaSemana = obterDiaSemana(d); newGrid[colab.id][d] = (diaSemana === 0 || diaSemana === 6) ? 'F' : tr6; } }
        } else {
          newGrid[colab.id][diaClicado] = ferramentaSelecionada;
        }
        return newGrid;
      });
    }

    function limparLinha(colabId) {
      if(window.confirm("Deseja limpar a escala deste colaborador?")) { setGridData(prev => ({ ...prev, [colabId]: {} })); }
    }

    function salvarEscala() {
      const inconformes = colabsFiltrados.map(c => {
        const feitas = calculaHorasFeitas(c.id); const meta = c.cargaHoraria || 0;
        return { ...c, feitas, meta, diff: feitas - meta };
      }).filter(c => c.diff !== 0);
      
      if (inconformes.length > 0) { setSaveConformity(false); setInconformidadesList(inconformes); } else { setSaveConformity(true); setInconformidadesList([]); }
      setShowSaveModal(true);
    }

    function efetivarSalvamento() {
      const novaEscala = escalaNominal.filter(e => !(e.mes === mesSelecionado && e.ano === anoSelecionado && e.setor === unidadeLogada));
      novaEscala.push({ id: Date.now(), mes: mesSelecionado, ano: anoSelecionado, setor: unidadeLogada, grid: gridData });
      setEscalaNominal(novaEscala); 
      registrarLog(`Escala Nominal salva: ${unidadeLogada}`);
      
      const timestamp = new Date().toLocaleString('pt-BR');
      setUltimaAlteracaoEscala(timestamp);
      localStorage.setItem('ultimaAlteracaoEscala', timestamp);
      
      setShowSaveModal(false); 
      
      setTimeout(() => {
         if (window.confirm("Deseja imprimir a escala?")) {
            window.print();
         }
      }, 300);
    }

    function atualizaCargaHoraria(id, valor) { setColaboradores(prev => prev.map(c => c.id === id ? { ...c, cargaHoraria: parseInt(valor) || 0 } : c)); }

    function calculaHorasFeitas(colabId) {
      const row = gridData[colabId] || {}; let total = 0;
      Object.values(row).forEach(val => { const shiftInfo = TIPOS_PLANTAO.find(t => t.code === val); if (shiftInfo) total += shiftInfo.hours; });
      return total;
    }

    if (!unidadeLogada) {
       return <div className="bg-white p-6 rounded-2xl shadow-sm border text-center"><AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" /><h2 className="text-xl font-bold">Selecione uma Unidade</h2><p>Você precisa estar logado em uma unidade.</p></div>;
    }

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 impressao-escala">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 hide-on-print">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><CalendarDays className="text-indigo-600" /> Escala Nominal</h2>
            {ultimaAlteracaoEscala && <p className="text-sm font-medium text-slate-500 mt-1">Última alteração: {ultimaAlteracaoEscala}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
               <button onClick={() => setMesSelecionado(prev => prev === 0 ? 11 : prev - 1)} className="p-2 border bg-white rounded-lg shadow-sm"><ChevronLeft size={16}/></button>
               <div className="text-center w-36 font-bold text-indigo-700">{nomeMeses[mesSelecionado]} {anoSelecionado}</div>
               <button onClick={() => setMesSelecionado(prev => prev === 11 ? 0 : prev + 1)} className="p-2 border bg-white rounded-lg shadow-sm"><ChevronRight size={16}/></button>
            </div>
            <div className="border-l border-slate-300 pl-4 h-full flex items-center">
               <label className="text-xs font-bold text-slate-600 mr-2 uppercase">Turno:</label>
               <select className="bg-white border border-slate-300 p-1.5 rounded-lg text-sm font-bold text-indigo-700 outline-none" value={filtroTurnoEscala} onChange={e => setFiltroTurnoEscala(e.target.value)}>
                 <option value="Todos">Todos</option><option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Noite">Noite</option>
               </select>
            </div>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block text-center mb-6">
           <h2 className="text-2xl font-black text-slate-900 border-b pb-2 mb-2">Escala Nominal de Enfermagem - {unidadeLogada}</h2>
           <p className="text-sm font-bold text-slate-600">{nomeMeses[mesSelecionado]} {anoSelecionado} | Base de Turno: {filtroTurnoEscala}</p>
           {ultimaAlteracaoEscala && <p className="text-xs text-slate-500 mt-1">Última alteração: {ultimaAlteracaoEscala}</p>}
        </div>

        <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 shadow-inner hide-on-print">
           <span className="text-sm font-bold text-slate-700 mr-2 flex items-center gap-2"><Edit2 size={16} className="text-indigo-600"/> Pincel de Plantão:</span>
           {TIPOS_PLANTAO.map(tp => (
              <button key={tp.code} onClick={() => setFerramentaSelecionada(tp.code)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${ferramentaSelecionada === tp.code ? 'bg-indigo-600 text-white border-indigo-700 shadow-md transform scale-105' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>{tp.label}</button>
           ))}
        </div>

        {/* TABELA COM CAMPOS FIXOS: 
            O contêiner tem max-height de aproximadamente 10 linhas visíveis (campo móvel). 
            Uso de position: sticky para travar as primeiras linhas/colunas. 
        */}
        <div className="overflow-auto max-h-[60vh] rounded-xl border border-slate-300 mb-6 bg-slate-50 relative shadow-inner">
          <table className="w-full text-left border-collapse text-sm min-w-[max-content] table-fixed">
            <thead className="sticky top-0 z-40 bg-slate-100 shadow-sm outline outline-1 outline-slate-200">
              <tr className="text-slate-600 font-semibold h-12">
                <th className="p-2 w-[220px] min-w-[220px] sticky left-0 z-50 bg-slate-100 border-r border-slate-300 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">Colaborador</th>
                <th className="p-2 w-[70px] min-w-[70px] sticky left-[220px] z-50 bg-slate-100 border-r border-slate-300 text-center text-[10px] uppercase font-bold text-slate-500 leading-tight">CH<br/>Mensal</th>
                <th className="p-2 w-[70px] min-w-[70px] sticky left-[290px] z-50 bg-slate-100 border-r border-slate-300 text-center text-[10px] uppercase font-bold text-slate-500 leading-tight">Horas<br/>Feitas</th>
                <th className="p-2 w-[60px] min-w-[60px] sticky left-[360px] z-50 bg-slate-100 border-r border-slate-300 text-center text-[10px] uppercase font-bold text-slate-500 leading-tight">Ação</th>
                {dias.map(d => {
                  const isFds = obterDiaSemana(d) === 0 || obterDiaSemana(d) === 6;
                  return (
                    <th key={d} className={`p-1 w-[40px] min-w-[40px] text-center border-r border-slate-200 ${isFds ? 'bg-rose-100 text-rose-800' : ''}`}>
                      <div className="font-bold text-sm">{d}</div>
                      <div className="text-[9px] font-medium uppercase">{diasDaSemanaAbrev[obterDiaSemana(d)]}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {colabsFiltrados.length === 0 && (<tr><td colSpan={dias.length + 4} className="p-8 text-center text-slate-500 italic">Nenhum colaborador encontrado para este turno.</td></tr>)}
              {colabsFiltrados.map(c => {
                const horasFeitas = calculaHorasFeitas(c.id); const cargaMensal = c.cargaHoraria || 0; const ultrapassou = horasFeitas > cargaMensal;
                
                return (
                <tr key={c.id} className={`transition-colors h-[50px] group ${ultrapassou ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-slate-50/80'}`}>
                  {/* COLUNAS FIXAS */}
                  <td className={`p-2 sticky left-0 z-30 border-r border-slate-300 shadow-[2px_0_5px_rgba(0,0,0,0.02)] ${ultrapassou ? 'bg-yellow-50 group-hover:bg-yellow-100' : 'bg-white group-hover:bg-slate-50'}`}>
                    <div className="font-bold text-slate-800 text-xs truncate" title={c.nome}>{c.nome}</div>
                    <div className="text-[10px] text-slate-500 flex justify-between mt-1"><span className="truncate">{c.cargo}</span><span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 rounded uppercase border" title={c.turno}>{c.turno.split(' ')[0]} {c.turno.includes('12h')?'12h':''}</span></div>
                  </td>
                  <td className={`p-1 sticky left-[220px] z-30 border-r border-slate-300 text-center ${ultrapassou ? 'bg-yellow-50 group-hover:bg-yellow-100' : 'bg-white group-hover:bg-slate-50'}`}>
                    <input type="number" className="w-12 text-center text-xs font-bold border rounded p-1 outline-none" value={c.cargaHoraria || 0} onChange={(e) => atualizaCargaHoraria(c.id, e.target.value)} />
                  </td>
                  <td className={`p-1 sticky left-[290px] z-30 border-r border-slate-300 text-center ${ultrapassou ? 'bg-yellow-50 group-hover:bg-yellow-100' : 'bg-white group-hover:bg-slate-50'}`}>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${ultrapassou ? 'bg-rose-100 text-rose-700' : 'text-slate-600'}`}>{horasFeitas}h</span>
                  </td>
                  <td className={`p-1 sticky left-[360px] z-30 border-r border-slate-300 text-center ${ultrapassou ? 'bg-yellow-50 group-hover:bg-yellow-100' : 'bg-white group-hover:bg-slate-50'}`}>
                    <button onClick={() => limparLinha(c.id)} className="text-[10px] text-rose-500 font-bold px-1.5 py-1 bg-rose-50 rounded">Limpar</button>
                  </td>

                  {/* COLUNAS ROLÁVEIS */}
                  {dias.map(d => {
                     const val = gridData[c.id]?.[d]; const isFds = obterDiaSemana(d) === 0 || obterDiaSemana(d) === 6;
                     const isLeaveStatus = ["Licença INSS", "Licença Maternidade", "Licença Médica"].includes(c.status);
                     const onLeave = isLeaveStatus && isDateInLeave(d, mesSelecionado, anoSelecionado, c.dataInicioLicenca, c.diasLicenca);
                     const hasAbsence = ausencias.some(a => a.matricula === c.matricula && a.data.includes(`${String(d).padStart(2,'0')}/${String(mesSelecionado+1).padStart(2,'0')}/${anoSelecionado}`));
                     
                     const shiftConfig = TIPOS_PLANTAO.find(t => t.code === val);
                     let bgClass = isFds ? "bg-slate-100" : "bg-transparent";
                     let textClass = "text-slate-300"; let cellContent = val || '-';
                     
                     if (shiftConfig && val !== '') { bgClass = shiftConfig.color; textClass = "font-black text-sm"; } 
                     else if (!val) { cellContent = '-'; }
                     if (hasAbsence) { bgClass = "bg-rose-500 text-white font-black"; cellContent = val || 'FALTA'; }
                     if (onLeave) { bgClass = "bg-purple-100 font-black text-purple-700 text-[10px]"; cellContent = "LIC"; }
                     
                     return (
                       <td key={d} className={`p-0.5 border-r border-slate-200 cursor-pointer ${bgClass} hover:opacity-80 transition-opacity`} onClick={() => handleCellClick(c, d)}>
                          <div className={`w-full h-8 flex items-center justify-center text-xs select-none ${textClass}`}>{cellContent}</div>
                       </td>
                     );
                  })}
                </tr>
              )})}
            </tbody>
            {/* LINHAS FIXAS INFERIORES (Somas) - bottom-[Xpx] garante que fiquem no final do scroll */}
            {colabsFiltrados.length > 0 && (
              <tfoot className="sticky bottom-0 z-40 bg-white outline outline-1 outline-slate-300 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
                 <tr className="bg-blue-50/90 h-[36px] border-b border-blue-200">
                     <td colSpan={4} className="p-2 text-right text-[11px] font-bold text-blue-800 sticky left-0 z-50 bg-blue-100/90 border-r border-blue-200">Soma Manhã (M + D + PRD)</td>
                     {dias.map(d => { let sum=0; colabsFiltrados.forEach(c => { const val = gridData[c.id]?.[d]; if(val==='M'||val==='D'||val==='PRD') sum++; }); return <td key={d} className="border-r border-blue-200 text-center font-black text-blue-800 text-xs">{sum>0?sum:''}</td>; })}
                 </tr>
                 <tr className="bg-cyan-50/90 h-[36px] border-b border-cyan-200">
                     <td colSpan={4} className="p-2 text-right text-[11px] font-bold text-cyan-800 sticky left-0 z-50 bg-cyan-100/90 border-r border-cyan-200">Soma Tarde (T + D + PRD)</td>
                     {dias.map(d => { let sum=0; colabsFiltrados.forEach(c => { const val = gridData[c.id]?.[d]; if(val==='T'||val==='D'||val==='PRD') sum++; }); return <td key={d} className="border-r border-cyan-200 text-center font-black text-cyan-800 text-xs">{sum>0?sum:''}</td>; })}
                 </tr>
                 <tr className="bg-sky-50/90 h-[36px]">
                     <td colSpan={4} className="p-2 text-right text-[11px] font-bold text-sky-800 sticky left-0 z-50 bg-sky-100/90 border-r border-sky-200">Soma Noite (N + PRN)</td>
                     {dias.map(d => { let sum=0; colabsFiltrados.forEach(c => { const val = gridData[c.id]?.[d]; if(val==='N'||val==='PRN') sum++; }); return <td key={d} className="border-r border-sky-200 text-center font-black text-sky-800 text-xs">{sum>0?sum:''}</td>; })}
                 </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-slate-200 pt-5 gap-4 hide-on-print">
          <button onClick={salvarEscala} className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 shadow-md flex items-center gap-2"><Save size={18} /> Salvar Escala Nominal</button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PLANEJAMENTO MENSAL QUANTITATIVO (Modificado para Automação total)
  // =========================================================================
  function EscalaMensal() {
    const nomeMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    
    const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
    const [anoSelecionado, setAnoSelecionado] = useState(anoAtual);
    const [setorSelecionado, setSetorSelecionado] = useState(unidadeLogada || (setores[0]?.nome || ""));
    const [turnoFiltro, setTurnoFiltro] = useState("Todos"); 

    useEffect(() => {
       if (perfilAtual === "Supervisão" && filtroGlobalSetor !== "") {
          setSetorSelecionado(filtroGlobalSetor);
       }
    }, [filtroGlobalSetor, perfilAtual]);

    const [editManhaEnf, setEditManhaEnf] = useState(0); const [editManhaTec, setEditManhaTec] = useState(0);
    const [editTardeEnf, setEditTardeEnf] = useState(0); const [editTardeTec, setEditTardeTec] = useState(0);
    const [editNoiteEnf, setEditNoiteEnf] = useState(0); const [editNoiteTec, setEditNoiteTec] = useState(0);


    const infoSetor = setores.find(s => s.nome === setorSelecionado);

    const diasNoMes = new Date(anoSelecionado, mesSelecionado + 1, 0).getDate();
    const primeiroDiaSemana = new Date(anoSelecionado, mesSelecionado, 1).getDay();
    const blanks = Array.from({ length: primeiroDiaSemana }, () => null);
    const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);
    const gridCalendario = [...blanks, ...dias];

    // Busca a escala nominal do mês selecionado
    const escNominal = escalaNominal.find(e => e.mes === mesSelecionado && e.ano === anoSelecionado && e.setor === setorSelecionado);
    const gridNominal = escNominal ? escNominal.grid : {};

    function renderDia(d, index) {
      if (!d) return <div key={`blank-${index}`} className="border border-transparent p-2 bg-transparent"></div>;

      const isHoje = d === diaHoje && mesSelecionado === mesAtual && anoSelecionado === anoAtual;
      
      // Calcula escalados através da nominal
      let enfEscM = 0, tecEscM = 0, enfEscT = 0, tecEscT = 0, enfEscN = 0, tecEscN = 0;
      
      Object.entries(gridNominal).forEach(([colabId, diasColab]) => {
         const val = diasColab[d];
         if (val) {
            const c = colaboradores.find(col => col.id.toString() === colabId);
            if (c) {
               const isEnf = c.cargo.includes("Enferm");
               if (['M', 'D', 'PRD'].includes(val)) { if (isEnf) enfEscM++; else tecEscM++; }
               if (['T', 'D', 'PRD'].includes(val)) { if (isEnf) enfEscT++; else tecEscT++; }
               if (['N', 'PRN'].includes(val)) { if (isEnf) enfEscN++; else tecEscN++; }
            }
         }
      });

      let enfEsc = 0; let tecEsc = 0;
      if (turnoFiltro === "Todos") { enfEsc = Math.max(enfEscM, enfEscT) + enfEscN; tecEsc = Math.max(tecEscM, tecEscT) + tecEscN; } // Exibição aproximada visual pro total do dia
      else if (turnoFiltro === "Manhã") { enfEsc = enfEscM; tecEsc = tecEscM; } 
      else if (turnoFiltro === "Tarde") { enfEsc = enfEscT; tecEsc = tecEscT; } 
      else if (turnoFiltro === "Noite") { enfEsc = enfEscN; tecEsc = tecEscN; }

      // Calcula ausências extraindo da aba de ausências
      const dataStr = `${String(d).padStart(2,'0')}/${String(mesSelecionado+1).padStart(2,'0')}/${anoSelecionado}`;
      let ausentesDia = ausencias.filter(a => a.setor === setorSelecionado && a.data === dataStr);
      if (turnoFiltro !== "Todos") { ausentesDia = ausentesDia.filter(a => a.turno === turnoFiltro); }
      
      let enfAus = 0, tecAus = 0;
      ausentesDia.forEach(a => {
         const cargo = colaboradores.find(c => c.matricula === a.matricula)?.cargo;
         if(cargo && cargo.includes("Enferm")) enfAus++; else tecAus++;
      });

      const fatorMultiplicador = turnoFiltro === "Todos" ? 3 : 1;
      const minEnfDia = (infoSetor?.minEnf || 0) * fatorMultiplicador; const minTecDia = (infoSetor?.minTec || 0) * fatorMultiplicador;
      const alertaEscala = (enfEsc < minEnfDia || tecEsc < minTecDia);
      const temAusencia = enfAus > 0 || tecAus > 0;

      return (
        <div key={`dia-${d}`} className={`border rounded-xl p-3 flex flex-col gap-2 shadow-sm transition-all h-full ${isHoje ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200' : 'bg-white hover:shadow-md'}`}>
          <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
            <span className={`font-bold text-lg ${isHoje ? 'text-indigo-800' : 'text-slate-700'}`}>{d}</span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold bg-slate-100 px-1.5 py-0.5 rounded-md"><Lock size={10} className="inline mr-0.5"/> Auto</span>
          </div>
          <div className="text-[10px] text-slate-500 flex justify-between mt-1"><span title={`Mínimo exigido (${turnoFiltro})`}>Escala Min:</span><span className="font-bold text-slate-700">{minEnfDia}E / {minTecDia}T</span></div>
          <div className={`text-[10px] p-1.5 rounded-lg flex justify-between items-center ${alertaEscala ? 'bg-rose-50 text-rose-700 font-bold border border-rose-100' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}><span>Escalados:</span><span className="font-bold">{enfEsc}E / {tecEsc}T</span></div>
          {temAusencia && (
             <div className="text-[10px] p-1.5 rounded-lg flex justify-between items-center bg-rose-500 text-white font-bold shadow-sm mt-auto"><span>Ausentes:</span><span>{enfAus}E / {tecAus}T</span></div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Calendar className="text-indigo-600" /> Planejamento Mensal Quantitativo</h2>
        <div className="flex flex-col xl:flex-row justify-between items-center mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Setor</label>
              <select className="border border-slate-300 p-2.5 rounded-xl bg-white outline-none font-semibold text-slate-700 disabled:bg-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all" value={setorSelecionado} onChange={e => setSetorSelecionado(e.target.value)} disabled={!!unidadeLogada}>
                {setores.map((s, idx) => <option key={`${s.nome}-${idx}`} value={s.nome}>{s.nome}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={() => setMesSelecionado(prev => prev === 0 ? 11 : prev - 1)} className="p-2.5 border border-slate-300 rounded-xl bg-white hover:bg-slate-100 shadow-sm"><ChevronLeft size={16}/></button>
              <div className="text-center w-36 bg-white p-2 border border-slate-300 rounded-xl shadow-sm"><label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Mês Ref.</label><div className="font-bold text-indigo-700 text-base leading-none">{nomeMeses[mesSelecionado]} {anoSelecionado}</div></div>
              <button onClick={() => setMesSelecionado(prev => prev === 11 ? 0 : prev + 1)} className="p-2.5 border border-slate-300 rounded-xl bg-white hover:bg-slate-100 shadow-sm"><ChevronRight size={16}/></button>
            </div>
            <div className="border-l pl-4 border-slate-200">
              <label className="block text-xs font-bold text-indigo-800 mb-1">Visão do Turno:</label>
              <select className="border border-indigo-200 p-2.5 rounded-xl bg-indigo-50 outline-none font-bold text-indigo-900" value={turnoFiltro} onChange={e => setTurnoFiltro(e.target.value)}>
                <option value="Todos">24h (Geral)</option><option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Noite">Noite</option>
              </select>
            </div>
          </div>
          <div className="text-xs text-slate-500 flex flex-col sm:flex-row gap-3 mt-4 xl:mt-0 bg-white px-4 py-2 rounded-lg border shadow-sm">
             <span className="flex items-center gap-1.5 font-medium"><span className="w-3 h-3 bg-rose-50 border border-rose-200 rounded-md"></span> Abaixo do Mínimo</span>
             <span className="flex items-center gap-1.5 font-medium"><span className="w-3 h-3 bg-rose-500 rounded-md"></span> Contém Faltas</span>
             <span className="flex items-center gap-1.5 font-medium"><Lock size={12} className="text-slate-400"/> Calculado Automaticamente</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">{diasSemana.map(dia => <div key={dia} className="text-center font-bold text-slate-400 text-sm py-2 uppercase tracking-wide">{dia}</div>)}</div>
        <div className="grid grid-cols-7 gap-2 mb-8">{gridCalendario.map((d, i) => renderDia(d, i))}</div>
      </div>
    );
  }

  // =========================================================================
  // GESTÃO DE COLABORADORES (Com novos campos no formulário)
  // =========================================================================
  function GestaoColaboradores() {
    const STATUS_OPCOES = ["Ativo", "Inativo", "Licença INSS", "Licença Maternidade", "Licença Médica", "Gestante", "Lactante", "Em Treinamento", "Com RTC"];
    const [filtroVisao, setFiltroVisao] = useState(unidadeLogada ? "unidade" : "todos");
    let colabsList = filtroVisao === "unidade" && unidadeLogada ? colaboradores.filter(c => c.setor === unidadeLogada) : colaboradores;
    if (perfilAtual === "Supervisão" && filtroGlobalSetor !== "") {
       colabsList = colabsList.filter(c => c.setor === filtroGlobalSetor);
    }
    
    const [showModal, setShowModal] = useState(false);
    
    // Novos campos adicionados
    const [nMatricula, setNMatricula] = useState(""); 
    const [nNome, setNNome] = useState(""); 
    const [nSexo, setNSexo] = useState("Feminino"); 
    const [nDataNascimento, setNDataNascimento] = useState(""); 
    const [nDataAdmissao, setNDataAdmissao] = useState(""); 
    
    const [nCargo, setNCargo] = useState("Enfermeira"); 
    const [nVinculo, setNVinculo] = useState("HC"); 
    const [nContrato, setNContrato] = useState(LISTA_CONTRATOS[0]); 
    const [nTurno, setNTurno] = useState("diurno 12h"); 
    const [nSetor, setNSetor] = useState(unidadeLogada || setores[0].nome);

    const [editId, setEditId] = useState(null); 
    const [editStatus, setEditStatus] = useState(""); 
    const [editDias, setEditDias] = useState(""); 
    const [editDataInicioLicenca, setEditDataInicioLicenca] = useState(""); 
    const [editSetor, setEditSetor] = useState(""); 
    const [editContrato, setEditContrato] = useState("");
    
    const [colaboradorParaExcluir, setColaboradorParaExcluir] = useState(null);

    function salvarNovoColab(e) {
      e.preventDefault(); if (!nMatricula || !nNome || !nDataNascimento || !nDataAdmissao) return alert("Preencha todos os campos obrigatórios.");
      const chBase = chLegenda[nContrato] || 180;
      const novo = { id: Date.now(), matricula: nMatricula, nome: nNome, sexo: nSexo, dataNascimento: nDataNascimento, dataAdmissao: nDataAdmissao, cargo: nCargo, setor: nSetor, status: "Ativo", vinculo: nVinculo, contrato: nContrato, turno: nTurno, diasLicenca: 0, dataInicioLicenca: "", cargaHoraria: chBase };
      setColaboradores(prev => [novo, ...prev]); registrarLog(`Novo colaborador vinculado: ${nNome} na unidade ${nSetor}`); 
      setShowModal(false); setNMatricula(""); setNNome(""); setNContrato(LISTA_CONTRATOS[0]); setNDataNascimento(""); setNDataAdmissao("");
    }

    function iniciarEdicao(c) {
      setEditId(c.id); setEditStatus(c.status || "Ativo"); setEditDias(c.diasLicenca || 0); setEditDataInicioLicenca(c.dataInicioLicenca || ""); setEditSetor(c.setor); setEditContrato(c.contrato || LISTA_CONTRATOS[0]);
    }

    function salvarEdicao() {
      const isLeave = ["Licença INSS", "Licença Maternidade", "Licença Médica"].includes(editStatus);
      if (isLeave && (!editDataInicioLicenca || !editDias)) return alert("Preencha a data inicial e a quantidade de dias para a licença.");
      setColaboradores(colaboradores.map(c => { if (c.id === editId) { return { ...c, status: editStatus, diasLicenca: isLeave ? (parseInt(editDias) || 0) : 0, dataInicioLicenca: isLeave ? editDataInicioLicenca : "", setor: editSetor, contrato: editContrato }; } return c; }));
      registrarLog(`Colaborador ID ${editId} atualizado.`); setEditId(null);
    }

    function confirmarExclusao(id, nome) {
      setColaboradores(prev => prev.filter(c => c.id !== id)); registrarLog(`Colaborador excluído: ${nome}`); setColaboradorParaExcluir(null);
    }

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div><h2 className="text-2xl font-bold text-slate-800">Gestão de Colaboradores (RH)</h2><p className="text-slate-500 text-sm mt-1">Gerencie a equipa e edite as informações contratuais.</p></div>
          {perfilAtual !== "Supervisão" && <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center gap-2"><UserPlus size={18} /> Novo Colaborador</button>}
        </div>

        {unidadeLogada && (
           <div className="bg-slate-50 p-1.5 rounded-xl border flex items-center shadow-inner w-max mb-6">
              <button onClick={() => setFiltroVisao('unidade')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${filtroVisao === 'unidade' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>Minha Unidade</button>
              <button onClick={() => setFiltroVisao('todos')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${filtroVisao === 'todos' ? 'bg-white text-indigo-700 shadow-sm flex items-center gap-2' : 'text-slate-500 flex items-center gap-2'}`}><Users size={16}/> Banco de Dados Completo</button>
           </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b"><th className="p-4 py-3 w-28">Matrícula</th><th className="p-4 py-3">Nome / Cargo</th><th className="p-4 py-3 text-center">Contrato & Turno</th><th className="p-4 py-3">Unidade Base</th><th className="p-4 py-3 w-56">Status (Afastamentos)</th><th className="p-4 py-3 text-center w-24">Ação</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {colabsList.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 group">
                  <td className="p-4 font-mono text-slate-600 font-bold">{c.matricula}</td>
                  <td className="p-4">
                     <div className="font-bold text-slate-800 flex items-center gap-2">
                        {c.nome} 
                        {c.sexo && <span title={c.sexo} className="text-[10px] bg-slate-100 px-1 rounded-sm text-slate-400 font-mono">{c.sexo.charAt(0)}</span>}
                     </div>
                     <div className="text-xs text-slate-500 mt-1">{c.cargo} • <span className="opacity-70">{c.vinculo}</span></div>
                  </td>
                  <td className="p-4 text-center">
                    {editId === c.id ? (
                        <div className="flex flex-col gap-1.5 items-center"><select className="border border-slate-300 bg-white p-1 rounded w-full outline-none text-[10px] font-bold text-slate-700 focus:ring-2" value={editContrato} onChange={e => setEditContrato(e.target.value)}>{LISTA_CONTRATOS.map(ct => <option key={ct} value={ct}>{ct}</option>)}</select><span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">{c.turno}</span></div>
                    ) : (
                        <div className="flex flex-col gap-1 items-center"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold border">{c.contrato || "HC30"}</span><span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">{c.turno}</span></div>
                    )}
                  </td>
                  <td className="p-4">
                     {editId === c.id ? (<select className="border bg-indigo-50 p-1.5 rounded-lg w-full text-xs font-bold text-indigo-900" value={editSetor} onChange={e => setEditSetor(e.target.value)}>{setores.map((s, idx) => <option key={`${s.nome}-${idx}`} value={s.nome}>{s.nome}</option>)}</select>) : (<span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${c.setor === unidadeLogada ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{c.setor}</span>)}
                  </td>
                  <td className="p-4">
                    {editId === c.id ? (
                      <div className="flex flex-col gap-2">
                        <select className="border p-1.5 rounded-lg w-full text-xs" value={editStatus} onChange={e => setEditStatus(e.target.value)}>{STATUS_OPCOES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        {["Licença INSS", "Licença Maternidade", "Licença Médica"].includes(editStatus) && (
                          <div className="flex gap-2 mt-1"><input type="date" className="border bg-rose-50 p-1.5 rounded-lg w-full text-xs" value={editDataInicioLicenca} onChange={e => setEditDataInicioLicenca(e.target.value)} title="Data Inicial da Licença" /><input type="number" placeholder="Dias" className="border bg-rose-50 p-1.5 rounded-lg w-16 text-center text-xs" value={editDias} onChange={e => setEditDias(e.target.value)} /></div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${c.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700' : c.status === 'Inativo' ? 'bg-slate-100 text-slate-500' : 'bg-rose-50 text-rose-700'}`}>{c.status || "Ativo"}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {perfilAtual === "Supervisão" ? (
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Leitura</span>
                    ) : (
                      editId === c.id ? (
                        <button onClick={salvarEdicao} className="text-emerald-600 bg-emerald-50 px-3 py-1.5 flex gap-1.5 rounded-lg border text-xs font-bold"><Save size={14} /> Salvar</button>
                      ) : (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => iniciarEdicao(c)} className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg border"><Edit2 size={16} /></button><button onClick={() => setColaboradorParaExcluir({id: c.id, nome: c.nome})} className="text-rose-600 bg-rose-50 p-1.5 rounded-lg border"><Trash2 size={16} /></button></div>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Novo Colaborador */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-indigo-600 p-5 flex justify-between text-white"><h3 className="text-lg font-bold flex gap-2"><UserPlus size={20} /> Vincular Colaborador</h3><button onClick={() => setShowModal(false)} className="hover:bg-indigo-500 p-1.5 rounded-full"><X size={20} /></button></div>
              <form onSubmit={salvarNovoColab} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 bg-slate-50 space-y-4 overflow-y-auto flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label><input autoFocus required className="w-full border p-2 rounded-xl" value={nNome} onChange={e => setNNome(e.target.value)} /></div>
                    <div><label className="block text-xs font-bold text-slate-700 mb-1">Matrícula *</label><input required className="w-full border p-2 rounded-xl" value={nMatricula} onChange={e => setNMatricula(e.target.value)} /></div>
                    <div><label className="block text-xs font-bold text-slate-700 mb-1">Sexo</label>
                      <select className="w-full border p-2 rounded-xl" value={nSexo} onChange={e => setNSexo(e.target.value)}><option value="Feminino">Feminino</option><option value="Masculino">Masculino</option><option value="Outro">Outro</option></select>
                    </div>
                    <div><label className="block text-xs font-bold text-slate-700 mb-1">Data Nascimento *</label><input type="date" required className="w-full border p-2 rounded-xl text-slate-700" value={nDataNascimento} onChange={e => setNDataNascimento(e.target.value)} /></div>
                    <div><label className="block text-xs font-bold text-slate-700 mb-1">Data Admissão *</label><input type="date" required className="w-full border p-2 rounded-xl text-slate-700" value={nDataAdmissao} onChange={e => setNDataAdmissao(e.target.value)} /></div>
                    <div><label className="block text-xs font-bold text-slate-700 mb-1">Cargo Funcional</label><select className="w-full border p-2 rounded-xl" value={nCargo} onChange={e => setNCargo(e.target.value)}><option value="Enfermeira">Enfermeiro(a)</option><option value="Técnico">Técnico(a)</option></select></div>
                    <div className="col-span-2"><label className="block text-xs font-bold text-indigo-700 mb-1">Unidade Base</label><select className="w-full border-indigo-300 p-2 rounded-xl bg-indigo-50 font-semibold text-indigo-900" value={nSetor} onChange={e => setNSetor(e.target.value)}>{setores.map((s, idx) => <option key={`${s.nome}-${idx}`} value={s.nome}>{s.nome}</option>)}</select></div>
                    <div><label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Contrato</label><select className="w-full border p-2 rounded-xl" value={nContrato} onChange={e => setNContrato(e.target.value)}>{LISTA_CONTRATOS.map(ct => <option key={ct} value={ct}>{ct}</option>)}</select></div>
                    <div><label className="block text-xs font-bold text-slate-700 mb-1">Vínculo Genérico</label><select className="w-full border p-2 rounded-xl" value={nVinculo} onChange={e => setNVinculo(e.target.value)}><option value="HC">HC</option><option value="FFM">FFM</option></select></div>
                    <div className="col-span-2"><label className="block text-xs font-bold text-slate-700 mb-1">Turno Fixo</label><select className="w-full border p-2 rounded-xl" value={nTurno} onChange={e => setNTurno(e.target.value)}><option value="6h manhã">6h Manhã</option><option value="6h tarde">6h Tarde</option><option value="8h manhã">8h Manhã</option><option value="8h tarde">8h Tarde</option><option value="diurno 12h">Diurno 12h</option><option value="noturno 12h">Noturno 12h</option></select></div>
                  </div>
                </div>
                <div className="p-5 border-t flex justify-end gap-3 bg-white shrink-0"><button type="button" onClick={() => setShowModal(false)} className="text-slate-600 font-bold px-5 py-2.5 rounded-xl bg-slate-100">Cancelar</button><button type="submit" className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl">Salvar Vínculo</button></div>
              </form>
            </div>
          </div>
        )}

        {colaboradorParaExcluir && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
             {/* ... mantido ... */}
             <div className="bg-white max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl">
                 <div className="bg-rose-600 p-5 flex justify-between text-white"><h3 className="text-lg font-bold">Excluir Colaborador</h3><button onClick={() => setColaboradorParaExcluir(null)}><X/></button></div>
                 <div className="p-6 text-center">
                    <p className="mb-6">Deseja excluir <span className="font-bold">{colaboradorParaExcluir.nome}</span>?</p>
                    <div className="flex justify-center gap-3"><button onClick={() => setColaboradorParaExcluir(null)} className="px-5 py-2.5 rounded-xl bg-slate-100">Cancelar</button><button onClick={() => confirmarExclusao(colaboradorParaExcluir.id, colaboradorParaExcluir.nome)} className="bg-rose-600 text-white px-5 py-2.5 rounded-xl">Excluir</button></div>
                 </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // REMANEJAMENTO (Nova Aba para Supervisão)
  // =========================================================================
  function Remanejamento() {
    const [matColab, setMatColab] = useState("");
    const [destino, setDestino] = useState("");
    const [dataRem, setDataRem] = useState(dataHojeInput);
    const [turnoRem, setTurnoRem] = useState("Manhã");
    const [motivoRem, setMotivoRem] = useState("");

    const colabEncontrado = matColab ? colaboradores.find(c => c.matricula === matColab) : null;

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
        colaborador: colabEncontrado.nome,
        matricula: colabEncontrado.matricula,
        origem: colabEncontrado.setor,
        destino,
        data: dataFormatada,
        dia: diaF, mes: mesF, ano: anoF,
        turno: turnoRem,
        motivo: motivoRem || "Necessidade do Serviço"
      }, ...prev]);

      registrarLog(`Remanejamento: ${colabEncontrado.nome} de ${colabEncontrado.setor} para ${destino} em ${dataFormatada}`);
      alert("Remanejamento registrado com sucesso!");
      
      setMatColab("");
      setDestino("");
      setMotivoRem("");
    }

    const [anoH, mesH, diaH] = dataHojeInput.split('-').map(Number);
    const remsHoje = remanejamentos.filter(r => r.dia === diaH && r.mes === (mesH - 1) && r.ano === anoH);

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
         <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><ArrowRightLeft className="text-indigo-600" /> Remanejamento de Colaboradores</h2>
         
         {perfilAtual !== "Plantão Assistencial" && (
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8 shadow-inner animate-fade-in">
              <h3 className="font-bold text-indigo-800 mb-4">Registrar Novo Remanejamento</h3>
              <form onSubmit={handleSalvar} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-indigo-900 mb-1">Selecionar Colaborador</label>
                  <select className="w-full border border-indigo-200 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400" value={matColab} onChange={e => setMatColab(e.target.value)} required>
                    <option value="">Selecione...</option>
                    {colaboradores.filter(c => c.status === "Ativo").map(c => <option key={c.id} value={c.matricula}>{c.nome} ({c.cargo})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Origem (Atual)</label>
                  <input type="text" className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold outline-none" value={colabEncontrado ? colabEncontrado.setor : ""} disabled />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-900 mb-1">Destino</label>
                  <select className="w-full border border-indigo-200 p-2.5 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-400" value={destino} onChange={e => setDestino(e.target.value)} required>
                    <option value="">Selecione...</option>
                    {setores.filter(s => !colabEncontrado || s.nome !== colabEncontrado.setor).map(s => <option key={s.nome} value={s.nome}>{s.nome}</option>)}
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

  function RenderizarPagina() {
    switch (pagina) {
      case "dashboard": return <Dashboard />;
      case "escala": return <EscalaMensal />;
      case "escala_nominal": return <FazerEscala />;
      case "plantao": return <PlantaoDiario />;
      case "detalhamento": return <DetalhamentoPlantao />;
      case "ausencias": return <Ausencias />;
      case "remanejamento": return <Remanejamento />;
      case "setores": return <SetoresConfig />;
      case "gestao_colab": return <GestaoColaboradores />;
      case "logs": return <div>Logs (Resumido)</div>;
      default: return <Dashboard />;
    }
  }

  if (!autenticado) return <TelaLogin />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 md:p-8 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-[1400px] mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3.5 rounded-2xl text-white shadow-lg shadow-indigo-200"><Activity size={32} /></div>
          <div><h1 className="text-3xl font-black text-slate-900 tracking-tight">Escala<span className="text-indigo-600">Enf</span></h1><p className="text-slate-500 font-semibold text-sm tracking-wide uppercase mt-0.5">Gestão Estratégica</p></div>
        </div>
        <div className="bg-white border border-slate-200 p-2.5 px-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-slate-800 flex items-center justify-end gap-1.5"><User size={16} className="text-indigo-600" /> {perfilAtual}</span>
            {unidadeLogada && <span className="text-xs text-slate-500 font-medium">Unidade: <span className="text-indigo-700 font-bold">{unidadeLogada}</span></span>}
            {perfilAtual === "Supervisão" && (
                <div className="mt-1">
                   <select className="border-none bg-indigo-50 text-indigo-700 font-bold text-xs p-1 rounded outline-none" value={filtroGlobalSetor} onChange={e => setFiltroGlobalSetor(e.target.value)}>
                      <option value="">Todas as Áreas</option>
                      {setores.map((s, idx) => <option key={`filtro-${idx}`} value={s.nome}>{s.nome}</option>)}
                   </select>
                </div>
            )}
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <button onClick={fazerLogoff} className="flex items-center gap-2 text-rose-600 font-bold hover:bg-rose-50 px-3 py-2 rounded-xl transition-all active:scale-95"><LogOut size={18} /> Sair</button>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto">
        <Menu />
        <main className="transition-all duration-300 ease-in-out">
          <RenderizarPagina />
        </main>
      </div>
    </div>
  );
}