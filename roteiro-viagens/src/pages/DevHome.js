import React, { useState, useEffect } from "react";
import "./DevHome.css";
import Header from "./components/Header";

function DevHome() {
  // Estados para gerenciar dados do sistema, logs e usuários
  const [systemStatus, setSystemStatus] = useState({});
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);

  // Função para simular a obtenção de dados (pode ser substituída por APIs reais)
  useEffect(() => {
    // Simular a recuperação de status do sistema
    setSystemStatus({
      server: "Online",
      database: "Conectado",
      api: "Responsiva",
    });

    // Simular logs de sistema
    setLogs([
      { id: 1, type: "info", message: "Sistema iniciado com sucesso" },
      { id: 2, type: "error", message: "Erro de conexão com a API" },
    ]);

    // Simular usuários
    setUsers([
      { id: 1, name: "John Doe", role: "user" },
      { id: 2, name: "Jane Smith", role: "dev" },
    ]);
  }, []);

  return (
    <div>
      <Header />
      <div className="dev-home-container">
        {/* Painel de Status do Sistema */}
        <div className="card">
          <h3>Status do Sistema</h3>
          <p>Servidor: {systemStatus.server}</p>
          <p>Banco de Dados: {systemStatus.database}</p>
          <p>API: {systemStatus.api}</p>
        </div>

        {/* Logs do Sistema */}
        <div className="card">
          <h3>Logs do Sistema</h3>
          <ul>
            {logs.map((log) => (
              <li key={log.id} className={`log-${log.type}`}>
                {log.message}
              </li>
            ))}
          </ul>
        </div>

        {/* Gerenciamento de Usuários */}
        <div className="card">
          <h3>Gerenciamento de Usuários</h3>
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                {user.name} ({user.role})
              </li>
            ))}
          </ul>
        </div>

        {/* Gráficos de Métricas */}
        <div className="metric-box">
          <h3>Métricas de Desempenho</h3>
          <p>Desempenho geral do sistema: 98%</p>
          <p>Tempo de resposta da API: 120ms</p>
        </div>
      </div>
    </div>
  );
}

export default DevHome;
