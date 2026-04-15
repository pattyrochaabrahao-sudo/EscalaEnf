import React, { useState, useEffect } from 'react';
import { Building, Save, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../supabase';

export default function AdminConfig() {
  const [setores, setSetores] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: setRes, error: setError } = await supabase.from('setores_unidades').select('*');
        if (!setError && setRes) setSetores(setRes);

        const { data: colRes, error: colError } = await supabase.from('colaboradores').select('*');
        if (!colError && colRes) setColaboradores(colRes);
      } catch (err) {
        console.error("Erro ao carregar dados", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function saveConfig() {
    // Por enquanto, não estamos fazendo atualização massiva dos setores no Supabase.
    // Opcionalmente você poderia iterar os setores alterados e faria o update.
    alert("Para edição real, você deve implementar o update de cada linha. Esta versão exibe apenas os dados do banco real!");
  }

  async function handleDeleteColaborador(matricula) {
     if(!window.confirm(`Deseja realmente remover o colaborador de matrícula ${matricula}?`)) return;
     const { error } = await supabase.from('colaboradores').delete().eq('matricula', String(matricula));
     if(error) {
        alert("Erro ao excluir!");
     } else {
        alert("Excluído com sucesso!");
        setColaboradores(colaboradores.filter(c => c.Matricula !== matricula));
     }
  }

  if (loading) return <div className="p-8 text-center">Carregando dados do servidor...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
         <Building className="text-indigo-600"/> Gestão de Setores e Parâmetros
      </h2>
      <p className="mb-6 text-slate-600 font-medium bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm">
         Visualização dos Setores e Unidades cadastrados (Configurações detalhadas em breve).
      </p>
      
      <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <th className="p-4 py-3">Sigla / Local</th>
              <th className="p-4 py-3">Nome Oficial</th>
              <th className="p-4 py-3">Bloco / Prédio</th>
              <th className="p-4 py-3">Enf. Chefe</th>
              <th className="p-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {setores.map((s, idx) => (
               <tr key={s.ID_Setor || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{s.Sigla_Localizacao}</td>
                  <td className="p-4 text-sm text-slate-500 font-medium">{s.nome_oficial}</td>
                  <td className="p-4">{s.Bloco_Predio}</td>
                  <td className="p-4">{s.Enf_Chefe}</td>
                  <td className="p-4 text-center">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 font-bold rounded-lg">{s.Status}</span>
                  </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end pt-2 mb-12">
         <button onClick={saveConfig} className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 shadow-md flex items-center gap-2">
            <Save size={18} /> Salvar Parâmetros
         </button>
      </div>

      <div className="border-t border-slate-200 pt-8">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Banco de Colaboradores</h2>
               <p className="text-slate-500 text-sm mt-1">Gerenciamento global de Colaboradores reais no banco de dados.</p>
            </div>
            <button className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-md flex items-center gap-2">
               <UserPlus size={18} /> Cadastrar
            </button>
         </div>
         <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-sm">
               <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b">
                     <th className="p-4 py-3 w-28">Matrícula</th>
                     <th className="p-4 py-3">Nome / Cargo</th>
                     <th className="p-4 py-3 text-center">Contrato & Turno</th>
                     <th className="p-4 py-3 w-56">Status</th>
                     <th className="p-4 py-3 text-center w-24">Ação</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {colaboradores.map(c => (
                     <tr key={c.Matricula} className="hover:bg-slate-50/50 group">
                        <td className="p-4 font-mono text-slate-600 font-bold">{c.Matricula}</td>
                        <td className="p-4">
                           <div className="font-bold text-slate-800 flex items-center gap-2">{c.Nome_Completo}</div>
                           <div className="text-xs text-slate-500 mt-1">{c.Categoria_Profissional} • <span className="opacity-70">{c.Vinculo}</span></div>
                        </td>
                        <td className="p-4 text-center">
                           <div className="flex flex-col gap-1 items-center">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold border">CH: {c.Carga_Horaria_Mensal}</span>
                              <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">{c.Turno_Padrao}</span>
                           </div>
                        </td>
                        <td className="p-4">
                           <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700">{c.Status_Atual || "Ativo"}</span>
                        </td>
                        <td className="p-4 text-center">
                           <div className="flex gap-2">
                              <button className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg border hover:bg-indigo-100 transition-colors" title="Editar (WIP)"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteColaborador(c.Matricula)} className="text-rose-600 bg-rose-50 p-1.5 rounded-lg border hover:bg-rose-100 transition-colors" title="Excluir"><Trash2 size={16} /></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
