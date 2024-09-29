import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();

    // Verificando os dados que estão sendo enviados
    console.log({
      username,
      password,
      role: 'user', // Verificando os dados enviados
    });

    try {
      const response = await axios.post('http://localhost:5000/register', {
        username,
        password,
        role: 'user' // Definir o papel como 'user' por padrão
      });

      setSuccess('Usuário registrado com sucesso!');
      setError('');
      setUsername('');
      setPassword('');

      // Redireciona para a página de login após o registro
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error(error.response.data); // Exibe o erro detalhado no console
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
