import React, { useState } from 'react';
import { CalendarDays, Users, Clock, FileWarning, TrendingUp } from 'lucide-react';

export default function RelatorioGerencial({ colaboradores, ausencias, unidadeLogada }) {
  // Mock data controls
  const [dataInicio, setDataInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substring(0, 10));
  const [dataFim, setDataFim] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().substring(0, 10));
  
  // Filter data for the current logged in unit
  const colabsSetor = colaboradores.filter(c => (c.setor || '').toUpperCase() === (unidadeLogada || '').toUpperCase());
  const totalColabs = colabsSetor.length;

  const ausenciasSetor = ausencias.filter(a => a.setor === unidadeLogada);
  const totalAfastamentos = ausenciasSetor.length;

  // Demographics: Categoria
  const contagemCategoria = colabsSetor.reduce((acc, c) => {
    let cat = c.cargo.includes("Enferm") ? "Enfermeiro" : "Técnico";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // Demographics: Turno
  const contagemTurno = colabsSetor.reduce((acc, c) => {
    let t = (c.turno || '').split(' ')[0] || "Outro";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Demographics: Contrato
  const contagemContrato = colabsSetor.reduce((acc, c) => {
    let cnt = c.contrato || "Outro";
    acc[cnt] = (acc[cnt] || 0) + 1;
    return acc;
  }, {});
  
  const renderBarChart = (title, dataObj, colorClass, bgClass) => {
    const maxVal = Math.max(...Object.values(dataObj), 1);
    return (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 mb-4">{title}</h3>
        <div className="flex flex-col gap-3">
          {Object.entries(dataObj).map(([key, val]) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600">{key}</span>
                <span className="font-black text-slate-800">{val}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className={`${bgClass} h-2 rounded-full transition-all duration-500`} style={{ width: `${(val / maxVal) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in flex flex-col gap-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="text-indigo-600"/> Relatório Gerencial</h2>
          <p className="text-sm text-slate-500">Métricas consolidadas para: <strong className="text-indigo-700">{unidadeLogada}</strong></p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="bg-transparent text-sm font-bold text-slate-600 p-1.5 outline-none"/>
            <span className="text-slate-400 font-black px-2">até</span>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="bg-transparent text-sm font-bold text-slate-600 p-1.5 outline-none"/>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Efetivo</p>
            <p className="text-2xl font-black text-slate-800">{totalColabs}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CalendarDays size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Férias em Curso</p>
            <p className="text-2xl font-black text-slate-800">{colabsSetor.filter(c => c.motivoAfastamento === 'FE').length || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100 flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><FileWarning size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Afastamentos / Faltas</p>
            <p className="text-2xl font-black text-slate-800">{totalAfastamentos}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Horas Efetivas (Mês)</p>
            <p className="text-2xl font-black text-slate-800">
               {colabsSetor.reduce((a,c) => a + (c.cargaHoraria || 0), 0)}h
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderBarChart("Distribuição por Categoria", contagemCategoria, "text-blue-600", "bg-blue-500")}
        {renderBarChart("Distribuição por Turno", contagemTurno, "text-purple-600", "bg-purple-500")}
        {renderBarChart("Distribuição por Contrato", contagemContrato, "text-teal-600", "bg-teal-500")}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Top Ausências Registradas</h3>
        {ausenciasSetor.length === 0 ? (
          <p className="text-sm italic text-slate-500 text-center py-6">Nenhuma ausência registrada para esta unidade no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead><tr className="border-b text-slate-500"><th className="p-2">Matrícula</th><th className="p-2">Colaborador</th><th className="p-2">Motivo</th><th className="p-2">Turno</th><th className="p-2">Data</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {ausenciasSetor.map((a, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2 font-mono text-slate-400">{a.matricula}</td>
                    <td className="p-2 font-bold text-slate-700">{a.colaborador}</td>
                    <td className="p-2 text-rose-600 font-semibold text-xs uppercase"><span className="bg-rose-50 px-2 py-1 rounded border border-rose-100">{a.motivo}</span></td>
                    <td className="p-2 text-slate-600">{a.turno}</td>
                    <td className="p-2 text-slate-600 font-medium">{a.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
