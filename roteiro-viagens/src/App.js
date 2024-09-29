import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserHome from './pages/UserHome';
import CeoHome from './pages/CeoHome';
import DevHome from './pages/DevHome';
import UserManagement from './pages/UserManagement'; // Certifique-se de importar o componente
import Header from './pages/components/Header'; // Importando o Header

// Componente para condicionalmente exibir o Header
function AppWithHeader() {
  const location = useLocation(); // Hook useLocation dentro de um Router

  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

  // Verifica se o token e o papel do usuário estão salvos no localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    if (savedToken && savedRole) {
      setToken(savedToken);
      setRole(savedRole);
    }
  }, []);

  // Redireciona o usuário com base no papel após o login
  const redirectToHome = () => {
    if (role === 'ceo') {
      return <Navigate to="/ceo-home" />;
    } else if (role === 'dev') {
      return <Navigate to="/dev-home" />;
    } else {
      return <Navigate to="/user-home" />;
    }
  };

  // Se não houver token, redireciona para a página de login
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Verifica se a rota atual é de login ou registro
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {/* Exibe o Header se não estiver nas páginas de login ou registro */}
      {!isAuthPage && <Header role={role} />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Páginas específicas para cada papel */}
        <Route path="/user-home" element={<UserHome />} />
        <Route path="/ceo-home" element={<CeoHome />} />
        <Route path="/dev-home" element={<DevHome />} />
        {/* Adicionando a rota para o gerenciamento de usuários */}
        <Route path="/user-management" element={<UserManagement />} />
        {/* Redireciona para a página correta com base no papel */}
        <Route path="*" element={redirectToHome()} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWithHeader />
    </Router>
  );
}

export default App;
