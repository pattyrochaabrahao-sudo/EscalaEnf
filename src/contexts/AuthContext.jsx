import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase'; 

const AuthContext = createContext({});

export const PERFIS = {
  ADMIN: "Administrador",
  DIRETOR: "Diretor",
  SUPERVISAO: "Supervisão",
  SUPERVISAO_PLANTONISTA: "Supervisão Plantonista",
  LIDERANCA_1: "Liderança 1",
  LIDERANCA_2: "Liderança 2",
  PLANTAO_ASSISTENCIAL: "Plantão Assistencial",
  COLABORADOR: "Colaborador",
  SECRETARIA: "Secretaria"
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [filtroGlobalSetor, setFiltroGlobalSetor] = useState("");
  const [pedidosFolga, setPedidosFolga] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pedidosFolga')) || []; } catch(e) { return []; }
  });

  useEffect(() => {
    localStorage.setItem('pedidosFolga', JSON.stringify(pedidosFolga));
  }, [pedidosFolga]);

  const loadUserProfile = async (currentSession) => {
    if (!currentSession?.user) {
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    try {
      // 1. Busca perfil base na tabela usuarios_perfis usando o ID do Auth
      const { data: perfilData, error: perfilError } = await supabase
        .from('usuarios_perfis')
        .select('*')
        .eq('id', currentSession.user.id)
        .maybeSingle();

      if (perfilError) throw perfilError;

      let nomeReal = currentSession.user.email;
      let cargoReal = 'Colaborador';
      
      const matricula = perfilData?.matricula ? String(perfilData.matricula) : null;
      const rolePrincipal = perfilData?.role || 'Colaborador';
      const perfilSecundario = perfilData?.perfil_secundario || '';

      // 2. Busca dados do colaborador usando a matrícula (Chave Universal)
      if (matricula) {
        const { data: colabData, error: colabError } = await supabase
          .from('colaboradores')
          .select('nome_completo, cargo')
          .eq('matricula', matricula) 
          .maybeSingle();
          
        if (!colabError && colabData) {
          nomeReal = colabData.nome_completo || nomeReal;
          cargoReal = colabData.cargo || cargoReal;
        }
      }

      // 3. Busca setores onde a matrícula é chefe ou diretor (Lógica de Cobertura)
      let setoresArray = [];
      let setoresDetalhesArray = [];

      if (matricula) {
        const { data: setoresData, error: setoresError } = await supabase
          .from('setores_unidades')
          .select('*')
          .or(`matricula_chefe.eq.${matricula},matricula_diretor.eq.${matricula}`)
          .eq('status', 'ativo');

        if (!setoresError && setoresData) {
          setoresDetalhesArray = setoresData;
          setoresArray = setoresData.map(s => s.nome_oficial);
        }
      }

      // Monta o objeto de usuário final conforme o Dossiê
      setUser({
        ...currentSession.user,
        matricula: matricula,
        nome: nomeReal,
        cargo: cargoReal,
        role: rolePrincipal,
        perfil_secundario: perfilSecundario,
        perfis: [rolePrincipal, perfilSecundario].filter(Boolean),
        setores: setoresArray,
        setores_detalhes: setoresDetalhesArray
      });
      
      setSession(currentSession);
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
      // Fallback para manter a sessão ativa mesmo com erro no perfil
      setUser(currentSession.user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserProfile(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true); 
      loadUserProfile(session); 
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    signIn,
    signOut,
    filtroGlobalSetor,
    setFiltroGlobalSetor,
    pedidosFolga,
    setPedidosFolga
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
