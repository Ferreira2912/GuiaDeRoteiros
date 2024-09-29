import React, { useState } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    try {
      // O papel é sempre "user" por padrão
      const role = 'user';
      await axios.post('http://localhost:5000/register', { username, password, role });
      setSuccess('Usuário registrado com sucesso!');
      setError('');
      setUsername('');
      setPassword('');
      
      // Redirecionar para a página do usuário após o registro
      navigate('/user-home');
    } catch (error) {
      setError('Erro ao registrar. Tente novamente.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registrar-se</h2>
        <form onSubmit={register}>
          <input
            type="text"
            placeholder="E-mail"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="register-button" type="submit">Registrar</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </div>
    </div>
  );
}

export default Register;
