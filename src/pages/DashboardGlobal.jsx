import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, CheckCircle, UserMinus, AlertTriangle, Building, Activity, X, ChevronRight, Phone, User, UserCheck, MapPin } from 'lucide-react';
import { supabase } from '../supabase';

export default function DashboardGlobal() {
  const percentAdesao = 0; 
  const [modalPendentesAberto, setModalPendentesAberto] = useState(false);
  const [unidadeDetalhe, setUnidadeDetalhe] = useState(null);

  const [setores, setSetores] = useState([]);
  const [totalColabs, setTotalColabs] = useState(0);
  const [leitos, setLeitos] = useState(0);

  const pendentes = [];

  useEffect(() => {
    async function loadDash() {
      // Setores
      const { data: setRes } = await supabase.from('setores_unidades').select('*');
      if (setRes) {
        setSetores(setRes);
        setLeitos(setRes.reduce((acc, curr) => acc + (parseInt(curr.Leitos_Operacionais || curr.leitos_operacionais) || 0), 0));
      }

      // Colaboradores escalados (Total)
      const { count } = await supabase.from('colaboradores').select('*', { count: 'exact', head: true }).or('Status_Atual.ilike.%Ativo%,Status.ilike.%Ativo%');
      if (count !== null) setTotalColabs(count);
    }
    loadDash();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><LayoutDashboard className="text-indigo-600"/> Dashboard Global (Supervisão)</h2>
        <p className="text-sm font-medium text-slate-500">Acompanhamento e suporte da operação no turno vigente.</p>
      </div>

      <div className="bg-indigo-700 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between mb-8">
         <div>
            <p className="text-indigo-200 text-xs font-bold uppercase mb-1 flex items-center gap-1.5"><Activity size={14}/> Status de Operação do Plantão</p>
            <p className="text-2xl font-black">Turno Vigente <span className="text-sm font-normal text-indigo-200">(Dados Integrados)</span></p>
         </div>
         <div className="flex items-center gap-6 mt-4 md:mt-0">
            <div className="text-right">
               <p className="text-4xl font-black">{percentAdesao}%</p>
               <p className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Adesão Atual</p>
            </div>
            <button 
              onClick={() => setModalPendentesAberto(true)}
              className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-indigo-50 transition-all flex items-center gap-2"
            >
               <CheckCircle size={18}/> Ver Pendentes
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500">
          <p className="text-gray-500 text-sm font-medium mb-2">Equipe Escalada</p>
          <div className="flex justify-between items-end mt-1"><p className="text-4xl font-extrabold text-blue-600">{totalColabs}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-500">
          <p className="text-gray-500 text-sm font-medium mb-2">Equipe Presente</p>
          <div className="flex justify-between items-end mt-1"><p className="text-4xl font-extrabold text-green-600">0</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-purple-500">
          <p className="text-gray-500 text-sm font-medium mb-2">Equipe Ajustada (Rem)</p>
          <div className="flex justify-between items-end mt-1"><p className="text-2xl font-bold text-gray-800"><span className="text-green-600">+0</span> / <span className="text-red-600">-0</span></p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-orange-500">
          <p className="text-gray-500 text-sm font-medium mb-2">Panorama de Leitos</p>
          <div className="grid grid-cols-3 gap-1 text-center mt-1">
            <div className="bg-gray-50 rounded p-1"><p className="text-xl font-bold text-gray-700">{leitos}</p><p className="text-[10px] text-gray-500 uppercase">Op</p></div>
            <div className="bg-blue-50 rounded p-1"><p className="text-xl font-bold text-blue-700">0</p><p className="text-[10px] text-gray-500 uppercase">Ocup</p></div>
            <div className="bg-red-50 rounded p-1"><p className="text-xl font-bold text-red-600">0</p><p className="text-[10px] text-gray-500 uppercase">Bloq</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center"><h3 className="text-base font-bold text-slate-800 flex items-center gap-2"><Building size={18} className="text-indigo-600"/> Resumo das Unidades (Geral)</h3></div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
               <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                     <th className="p-4 py-3">Unidade</th>
                     <th className="p-4 py-3 text-center">Status Operacional</th>
                     <th className="p-4 py-3 text-center">Enfermeiro Chefe</th>
                     <th className="p-4 py-3 text-center">Contato (Ramal)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {setores.length === 0 && <tr><td colSpan="4" className="text-center p-4 text-slate-500">Carregando setores via Supabase...</td></tr>}
                  {setores.map((row, i) => (
                     <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                           <div className="font-bold text-slate-800 text-base mb-1">{row.Sigla_Localizacao || row.sigla_localizacao}</div>
                           <div className="text-xs text-slate-500 truncate max-w-[200px]">{row.Nome_Oficial || row.nome_oficial}</div>
                        </td>
                        <td className="p-4 text-center">
                           <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase"><CheckCircle size={10}/> {row.Status || row.status || 'Ativo'}</span>
                        </td>
                        <td className="p-4 text-center text-slate-700 font-medium">{row.Enf_Chefe || row.enf_chefe || 'Não Atribuído'}</td>
                        <td className="p-4 text-center text-slate-600 font-mono">{row.Ramal || row.ramal || '-'}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {modalPendentesAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-indigo-600 p-5 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2 text-lg"><AlertTriangle size={22}/> Unidades com Pendências</h3>
              <button 
                onClick={() => { setModalPendentesAberto(false); setUnidadeDetalhe(null); }} 
                className="hover:bg-indigo-700 p-1.5 rounded-full transition-colors"
              ><X size={20}/></button>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[400px]">
              {/* Lista de Unidades */}
              <div className="w-full md:w-[45%] border-r border-slate-100 bg-slate-50 overflow-y-auto p-4 flex flex-col gap-2">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Pendências de Preenchimento</p>
                {pendentes.length === 0 && <p className="text-xs text-slate-400 p-4 italic">Nenhuma pendência crítica encontrada.</p>}
                {pendentes.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setUnidadeDetalhe(p)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center ${unidadeDetalhe?.id === p.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                  >
                    <div className="pr-4">
                      <p className={`font-bold text-sm leading-tight ${unidadeDetalhe?.id === p.id ? 'text-indigo-800' : 'text-slate-700'}`}>{p.unidade}</p>
                    </div>
                    <ChevronRight size={16} className={unidadeDetalhe?.id === p.id ? 'text-indigo-600' : 'text-slate-300'} />
                  </button>
                ))}
              </div>

              {/* Detalhes da Unidade */}
              <div className="w-full md:w-[55%] p-8 bg-white overflow-y-auto flex flex-col justify-center">
                {unidadeDetalhe ? (
                  <div className="animate-fade-in flex flex-col gap-6">
                    <div>
                        <div className="bg-indigo-100 text-indigo-800 inline-block px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg mb-3">Detalhes de Contato</div>
                        <h4 className="text-2xl font-black text-slate-800 leading-tight">{unidadeDetalhe.unidade}</h4>
                    </div>
                    
                    <div className="flex flex-col gap-4 mt-2">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                        <div className="bg-white p-3 border border-slate-200 rounded-xl text-indigo-600 shadow-sm"><Phone size={20}/></div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ramal da Unidade</p>
                          <p className="font-bold text-slate-800 text-lg">{unidadeDetalhe.ramal}</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                        <div className="bg-white p-3 border border-slate-200 rounded-xl text-indigo-600 shadow-sm"><UserCheck size={20}/></div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Enfermeiro(a) Chefe</p>
                          <p className="font-bold text-slate-800">{unidadeDetalhe.enfermeiroChefe}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                        <div className="bg-white p-3 border border-slate-200 rounded-xl text-indigo-600 shadow-sm"><User size={20}/></div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Diretor de Serviço</p>
                          <p className="font-bold text-slate-800">{unidadeDetalhe.diretor}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center animate-fade-in">
                    <MapPin size={48} className="mb-4 text-slate-200"/>
                    <p className="font-bold text-slate-500 mb-1">Nenhuma unidade selecionada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
