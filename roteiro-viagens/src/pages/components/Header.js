import React, { useState } from "react";
import "./Header.css";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Lógica de logout (excluir token, redirecionar para login, etc.)
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src="/path-to-your-logo.png" alt="Logo" className="logo" />
      </div>
      <div className="header-center">
        <nav>
          <a href="#dashboard">Dashboard</a>
          <a href="#settings">Configurações</a>
          <a href="#support">Suporte</a>
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
