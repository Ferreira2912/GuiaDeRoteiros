import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

function Header({ role }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Lógica de logout (excluir token, redirecionar para login, etc.)
    localStorage.removeItem("token");
    window.location.href = "/login"; // Redireciona para a página de login
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src="/path-to-your-logo.png" alt="Logo" className="logo" />
      </div>

      <div className="header-center">
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/settings">Configurações</Link>
          <Link to="/support">Suporte</Link>

          {/* Mostrar o link de gerenciamento de usuários apenas para desenvolvedores */}
          {role === "dev" && (
            <Link to="/user-management">Gerenciamento de Usuários</Link>
          )}
        </nav>
      </div>

      <div className="header-right">
        <img
          src="/path-to-profile-picture.jpg"
          alt="Perfil"
          className="profile-pic"
          onClick={toggleMenu}
        />
        {isMenuOpen && (
          <div className="profile-menu">
            <ul>
              <li onClick={() => alert("Editar Perfil")}>Editar Perfil</li>
              <li onClick={() => alert("Ajuda")}>Ajuda</li>
              <li onClick={handleLogout}>Logout</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
