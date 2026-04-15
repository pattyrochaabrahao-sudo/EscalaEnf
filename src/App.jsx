import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, PERFIS } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import PlantaoDiario from './pages/PlantaoDiario';
import Planejamento from './pages/Planejamento';
import DashboardGlobal from './pages/DashboardGlobal';
import Indicadores from './pages/Indicadores';
import AdminConfig from './pages/AdminConfig';
import MeuPainel from './pages/MeuPainel';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardChefia from './pages/DashboardChefia';

function AppRoutes() {
  const { user } = useAuth();

  const getHomeRoute = () => {
    if (!user) return '/login';
    
    const role = user.role || '';

    if (role === 'Liderança 1') return '/chefia';
    if (role === 'Liderança 2') return '/planejamento';
    if (role === 'Supervisão' || role === 'Supervisão Plantonista') return '/dashboard-global';
    if (role === 'Administrador' || role === 'Diretor') return '/dashboard-admin';
    
    return '/meu-painel';
  };

  const ALL_ROLES = ['Administrador', 'Diretor', 'Supervisão', 'Supervisão Plantonista', 'Liderança 1', 'Liderança 2', 'Plantão Assistencial', 'Colaborador', 'Secretaria'];

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />
        
        <Route path="/chefia" element={
          <PrivateRoute allowedRoles={['Liderança 1', 'Liderança 2']}> 
            <DashboardChefia /> 
          </PrivateRoute>
        } />
        
        <Route path="/planejamento" element={
          <PrivateRoute allowedRoles={['Liderança 2', 'Supervisão', 'Supervisão Plantonista', 'Administrador', 'Diretor']}>
            <Planejamento />
          </PrivateRoute>
        } />
        
        <Route path="/dashboard-global" element={
          <PrivateRoute allowedRoles={['Supervisão', 'Supervisão Plantonista', 'Administrador', 'Diretor']}>
            <DashboardGlobal />
          </PrivateRoute>
        } />
        
        <Route path="/indicadores" element={
          <PrivateRoute allowedRoles={['Administrador', 'Diretor']}>
            <Indicadores />
          </PrivateRoute>
        } />

        <Route path="/configuracoes" element={
          <PrivateRoute allowedRoles={['Administrador', 'Diretor']}>
            <AdminConfig />
          </PrivateRoute>
        } />

        <Route path="/meu-painel" element={
          <PrivateRoute allowedRoles={ALL_ROLES}>
            <MeuPainel />
          </PrivateRoute>
        } />

        <Route path="/dashboard-admin" element={
          <PrivateRoute allowedRoles={['Administrador', 'Supervisão', 'Supervisão Plantonista', 'Diretor']}>
            <DashboardAdmin />
          </PrivateRoute>
        } />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}