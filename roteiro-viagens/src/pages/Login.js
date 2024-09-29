import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });
      
      // Armazena o token JWT e o papel (role) no localStorage
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('role', response.data.role);

      setError('');

      // Redireciona o usuário com base no papel (role)
      if (response.data.role === 'ceo') {
        navigate('/ceo-home');
      } else if (response.data.role === 'dev') {
        navigate('/dev-home');
      } else {
        navigate('/user-home');
      }
    } catch (error) {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Entrar na sua conta</h2>
        <form onSubmit={login}>
          <input
            type="text"
            placeholder="Login"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="login-button" type="submit">Entrar</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {/* Botão de redirecionamento para a página de registro */}
        <button className="register-button" onClick={handleRegisterRedirect}>
          Registrar-se
        </button>
      </div>
    </div>
  );
}

export default Login;
