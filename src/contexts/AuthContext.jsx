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
      console.log("Sem sessão de usuário ativa.");
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    console.log("Iniciando carregamento de perfil para UUID:", currentSession.user.id);

    try {
      // 1. Busca perfil base na tabela usuarios_perfis
      const { data: perfilData, error: perfilError } = await supabase
        .from('usuarios_perfis')
        .select('*')
        .eq('id', currentSession.user.id)
        .maybeSingle();

      if (perfilError) {
        console.error("Erro ao buscar em usuarios_perfis:", perfilError);
      }

      console.log("Dados brutos de perfil encontrados:", perfilData);

      // Normalização de chaves (Maiúsculas/Minúsculas)
      const matriculaRaw = perfilData?.matricula || perfilData?.Matricula || null;
      const matricula = matriculaRaw ? String(matriculaRaw) : null;
      const rolePrincipal = perfilData?.role || perfilData?.Role || 'Colaborador';
      const perfilSecundario = perfilData?.perfil_secundario || perfilData?.Perfil_Secundario || '';

      let nomeReal = currentSession.user.email;
      let cargoReal = rolePrincipal;

      // 2. Busca dados do colaborador usando a matrícula
      if (matricula) {
        console.log("Buscando colaborador para matrícula:", matricula);
        const { data: colabData, error: colabError } = await supabase
          .from('colaboradores')
          .select('*')
          .eq('matricula', matricula) 
          .maybeSingle();
          
        if (!colabError && colabData) {
          console.log("Dados do colaborador encontrados:", colabData);
          nomeReal = colabData.nome_completo || colabData.Nome_Completo || nomeReal;
          cargoReal = colabData.cargo || colabData.Cargo || cargoReal;
        } else {
          console.warn("Aviso: Matrícula encontrada no perfil mas não na tabela colaboradores.");
        }
      }

      // 3. Busca setores (Lógica de Cobertura)
      let setoresArray = [];
      let setoresDetalhesArray = [];

      if (matricula) {
        const { data: setoresData, error: setoresError } = await supabase
          .from('setores_unidades')
          .select('*');

        if (!setoresError && setoresData) {
          setoresDetalhesArray = setoresData.filter(s => {
            const matChefe = String(s.matricula_chefe || s.Matricula_Chefe || '').trim();
            const matDiretor = String(s.matricula_diretor || s.Matricula_Diretor || '').trim();
            const status = String(s.status || s.Status || '').toUpperCase();
            
            return (status === 'ATIVO') && (matChefe === matricula || matDiretor === matricula);
          });
          setoresArray = setoresDetalhesArray.map(s => s.nome_oficial || s.Nome_Oficial);
        }
      }

      const finalUser = {
        ...currentSession.user,
        matricula: matricula,
        nome: nomeReal,
        cargo: cargoReal,
        role: rolePrincipal,
        perfil_secundario: perfilSecundario,
        perfis: [rolePrincipal, perfilSecundario].filter(Boolean),
        setores: setoresArray,
        setores_detalhes: setoresDetalhesArray
      };

      console.log("Objeto de usuário final montado:", finalUser);
      setUser(finalUser);
      setSession(currentSession);
    } catch (error) {
      console.error("Erro fatal ao carregar perfil:", error);
      setUser({
        ...currentSession.user,
        role: 'Colaborador',
        perfis: ['Colaborador'],
        nome: currentSession.user.email
      });
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
