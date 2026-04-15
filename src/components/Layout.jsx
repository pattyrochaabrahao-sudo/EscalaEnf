import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, PERFIS } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  ClipboardCheck,
  CalendarDays,
  TrendingUp,
  Building,
  LogOut,
  User,
  Activity,
  ShieldCheck,
} from 'lucide-react';

export default function Layout() {
  const { user, signOut, filtroGlobalSetor, setFiltroGlobalSetor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <Outlet />;

  // Mapeamento dinâmico de items de navegação por perfil
  const getMenuItems = () => {
    const items = [];
    if ([PERFIS.CHEFE_1, PERFIS.CHEFE_3, PERFIS.ADMIN].includes(user.role))
      items.push({ path: '/plantao',          label: 'Plantão Diário',        icon: ClipboardCheck });
    if ([PERFIS.CHEFE_2, PERFIS.CHEFE_3, PERFIS.ADMIN].includes(user.role))
      items.push({ path: '/planejamento', label: 'Planejamento', icon: CalendarDays, hideTab: true });
    if ([PERFIS.CHEFE_3, PERFIS.ADMIN].includes(user.role))
      items.push({ path: '/dashboard-global',  label: 'Dashboard Global',      icon: LayoutDashboard });
    if ([PERFIS.CHEFE_3, PERFIS.ADMIN].includes(user.role))
      items.push({ path: '/dashboard-admin',   label: 'Painel Admin',          icon: ShieldCheck     });
    if ([PERFIS.ADMIN].includes(user.role))
      items.push({ path: '/indicadores',       label: 'Indicadores RH',        icon: TrendingUp    });
    if ([PERFIS.ADMIN].includes(user.role))
      items.push({ path: '/configuracoes',     label: 'Configurações',         icon: Building      });
    if ([PERFIS.COLABORADOR, PERFIS.ADMIN].includes(user.role))
      items.push({ path: '/meu-painel',        label: 'Meu Painel',            icon: User          });
    return items;
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow">
              <Activity size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-black text-indigo-700 tracking-tight">
              Escala<span className="text-slate-400">Enf</span>
            </h1>
          </div>

          {/* Perfil + Unidade + Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <User size={14} />
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-xs font-black text-slate-800 leading-none">{user.nome || user.role}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {user.matricula && (
                    <p className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1 rounded">Mat: {user.matricula}</p>
                  )}
                  {user.unidadeLogada && (
                    <p className="text-[10px] text-slate-400 font-medium">{user.unidadeLogada}</p>
                  )}
                </div>
                {user.role === PERFIS.CHEFE_3 && user.setores_detalhes && (
                   <select 
                     className="mt-1 bg-transparent border-none outline-none text-[10px] font-bold text-indigo-700 cursor-pointer" 
                     value={filtroGlobalSetor} onChange={e => setFiltroGlobalSetor(e.target.value)}
                   >
                     <option value="">Todas as Áreas</option>
                     {user.setores_detalhes.map(s => {
                       const nomeSetor = s.nome_oficial || s.Nome_Oficial || s.nome_setor || s.nome;
                       return <option key={nomeSetor} value={nomeSetor}>{nomeSetor}</option>;
                     })}
                   </select>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-rose-50 text-rose-600 font-bold text-sm px-4 py-2 rounded-xl border border-rose-200 hover:bg-rose-100 active:scale-95 transition-all"
              title="Sair"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* ── NAV TABS (abaixo do header) ──────────────────────────────── */}
        {menuItems.length > 0 && (
          <nav className="flex items-center gap-1 px-6 pb-0 overflow-x-auto">
            {menuItems.filter(item => !item.hideTab).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto p-6 bg-slate-50/60">
        <Outlet />
      </main>
    </div>
  );
}
