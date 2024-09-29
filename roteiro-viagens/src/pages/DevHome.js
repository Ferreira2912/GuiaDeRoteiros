import React, { useState, useEffect } from "react";
import "./DevHome.css";
import axios from "axios";

function DevHome() {
  const [serverStatus, setServerStatus] = useState({
    status: "unknown",
    load: 0,
    memoryUsage: 0,
    uptime: 0,
    responseTime: 0,
    dbStatus: "unknown",
  });

  // Buscar o status do servidor a cada segundo
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get("http://localhost:5000/status");
        setServerStatus(response.data);
      } catch (error) {
        console.error("Erro ao buscar status do servidor:", error);
      }
    };

    // Executa a função imediatamente e depois a cada 1 segundo (1000 ms)
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(interval);
  }, []);

  // Definir a cor do status com base no status do servidor e banco de dados
  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "green";
      case "degraded":
        return "orange";
      case "offline":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div>
      <div className="dev-home-container">
        {/* Status do Sistema */}
        <div className="card">
          <h3>Status do Sistema</h3>
          <div className="status-container">
            <span>
              Status do Servidor:
              <span
                style={{
                  color: getStatusColor(serverStatus.status),
                  fontWeight: "bold",
                }}
              >
                {` ${serverStatus.status.toUpperCase()}`}
              </span>
            </span>
            <p>Carga do Servidor (CPU): {serverStatus.load.toFixed(2)}%</p>
            <p>Uso de Memória: {serverStatus.memoryUsage}%</p>
            <p>
              Tempo de Atividade: {Math.floor(serverStatus.uptime)} segundos
            </p>
            <p>Tempo de Resposta: {serverStatus.responseTime} ms</p>
            <p>
              Status do Banco de Dados:
              <span
                style={{
                  color: getStatusColor(serverStatus.dbStatus),
                  fontWeight: "bold",
                }}
              >
                {` ${serverStatus.dbStatus.toUpperCase()}`}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DevHome;
