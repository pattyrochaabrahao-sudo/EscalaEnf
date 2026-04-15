import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Validando acessos...</p>
      </div>
    );
  }

  if (!user) {
    if (location.pathname === '/login') return <Outlet />;
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // Busca em todos os perfis do usuário (base e secundário)
    const userRoles = user.perfis || [user.role];
    const temPermissao = allowedRoles.some(rolePermitido => 
      userRoles.some(p => p?.includes(rolePermitido) || rolePermitido?.includes(p))
    );

    if (!temPermissao) {
      console.warn(`Acesso bloqueado: Rota exige ${allowedRoles}, mas usuário é ${user.role}`);
      // NUNCA REDIRECIONAR AQUI. Apenas mostrar o ecrã.
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
           <div className="p-8 bg-white rounded-lg shadow-md text-center max-w-md w-full">
             <h2 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h2>
             <p className="text-gray-700 mb-6">
               O seu perfil (<strong>{user.role}</strong>) não tem permissão para visualizar esta página.
             </p>
             <Link 
               to="/meu-painel" 
               className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
             >
               Ir para Meu Painel
             </Link>
           </div>
        </div>
      );
    }
  }

  return children ? children : <Outlet />;
}