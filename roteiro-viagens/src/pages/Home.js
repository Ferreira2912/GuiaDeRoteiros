import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

function Home({ role }) {
  const [roteiros, setRoteiros] = useState([]);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');

  // Função para buscar os roteiros do back-end
  useEffect(() => {
    axios.get('http://localhost:5000/roteiros')
      .then(response => {
        setRoteiros(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar roteiros:', error);
      });
  }, []);

  // Função para criar um novo roteiro
  const criarRoteiro = () => {
    const novoRoteiro = { nome, categoria, descricao };

    axios.post('http://localhost:5000/roteiros', novoRoteiro)
      .then(response => {
        setRoteiros([...roteiros, response.data]);
        setNome('');
        setCategoria('');
        setDescricao('');
      })
      .catch(error => {
        console.error('Erro ao criar roteiro:', error);
      });
  };

  return (
    <div className="container">
      <h1>Guia de Roteiros de Viagem</h1>

      {role === 'ceo' && <p>Você tem acesso às funcionalidades administrativas.</p>}
      {role === 'dev' && <p>Você tem acesso total ao sistema.</p>}
      {role === 'user' && <p>Você pode criar e visualizar seus roteiros.</p>}

      {/* Formulário para criar novo roteiro */}
      <form onSubmit={(e) => e.preventDefault()}>
        <h2>Criar Novo Roteiro</h2>
        <input
          type="text"
          placeholder="Nome do roteiro"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          type="text"
          placeholder="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        />
        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <button onClick={criarRoteiro}>Criar Roteiro</button>
      </form>

      {/* Lista de roteiros */}
      <h2>Roteiros Criados</h2>
      <ul>
        {roteiros.map((roteiro) => (
          <li key={roteiro.id}>
            <h3>{roteiro.nome}</h3>
            <p><strong>Categoria:</strong> {roteiro.categoria}</p>
            <p><strong>Descrição:</strong> {roteiro.descricao}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
