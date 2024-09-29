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

  const [eventLogs, setEventLogs] = useState([]); // Estado para armazenar logs de eventos
  const [loadingLogs, setLoadingLogs] = useState(false); // Estado para exibir o status de carregamento
  const [logError, setLogError] = useState(null); // Estado para erros na obtenção dos logs
  const [startDate, setStartDate] = useState(""); // Estado para armazenar a data de início
  const [endDate, setEndDate] = useState(""); // Estado para armazenar a data de fim

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

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  // Função para buscar logs de eventos com filtro de data
  const fetchEventLogs = async () => {
    setLoadingLogs(true);
    setLogError(null); // Resetando erro anterior, se houver

    try {
      const response = await axios.get("http://localhost:5000/event-logs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          startDate,
          endDate,
        },
      });
      setEventLogs(response.data); // Define os logs recebidos
    } catch (error) {
      console.error("Erro ao buscar logs de eventos:", error);
      setLogError("Erro ao carregar logs de eventos.");
    } finally {
      setLoadingLogs(false);
    }
  };

  // Função para lidar com a submissão do filtro de datas
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchEventLogs();
  };

  // Função para exportar logs para CSV
  const exportToCSV = () => {
    const csvRows = [];
    const headers = ["Date", "Event", "Details"];
    csvRows.push(headers.join(","));
    
    // Adiciona os dados de logs em formato CSV
    eventLogs.forEach(log => {
      const row = [log.date, log.event, log.details];
      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "logs_eventos.csv");
    document.body.appendChild(link);
    link.click();
  };

  // Função para exportar logs para JSON
  const exportToJSON = () => {
    const jsonContent = JSON.stringify(eventLogs, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "logs_eventos.json");
    document.body.appendChild(link);
    link.click();
  };

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

        {/* Card de Logs de Detalhes de Eventos */}
        <div className="card">
          <h3>Logs de Detalhes de Eventos</h3>

          {/* Filtro de Data e Hora dentro do Card */}
          <div className="log-filter">
            <form onSubmit={handleFilterSubmit}>
              <div>
                <label htmlFor="startDate">Data de Início:</label>
                <input
                  type="datetime-local"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="endDate">Data de Fim:</label>
                <input
                  type="datetime-local"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button type="submit">Filtrar</button>
            </form>
          </div>

          {/* Exibir Logs de Detalhes de Eventos */}
          {loadingLogs ? (
            <p>Carregando logs de eventos...</p>
          ) : logError ? (
            <p>{logError}</p>
          ) : (
            <div className="log-content">
              <ul>
                {eventLogs.map((log, index) => (
                  <li key={index}>
                    <p><strong>Data:</strong> {log.date}</p>
                    <p><strong>Evento:</strong> {log.event}</p>
                    <p><strong>Detalhes:</strong> {log.details}</p>
                  </li>
                ))}
              </ul>

              {/* Botões para exportar */}
              <div className="export-buttons">
                <button onClick={exportToCSV}>Exportar para CSV</button>
                <button onClick={exportToJSON}>Exportar para JSON</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DevHome;
