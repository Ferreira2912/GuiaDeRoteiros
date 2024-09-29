import React, { useState, useEffect } from "react";
import "./UserManagement.css"; // Arquivo CSS para estilizar a página de gerenciamento de usuários
import axios from "axios";

function UserManagement() {
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user",
  });
  const [userMessage, setUserMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/add-user",
        newUser,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUserMessage(response.data.message);
      setNewUser({ username: "", password: "", role: "user" });
      fetchUsers();
    } catch (error) {
      setUserMessage("Erro ao adicionar usuário.");
      console.error(error.response?.data?.message || error.message);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewUser({ username: user.username, password: "", role: user.role });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/edit-user/${selectedUser._id}`,
        newUser,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUserMessage(response.data.message);
      setSelectedUser(null);
      setNewUser({ username: "", password: "", role: "user" });
      fetchUsers();
    } catch (error) {
      setUserMessage("Erro ao atualizar usuário.");
      console.error(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/delete-user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUserMessage(response.data.message);
      fetchUsers();
    } catch (error) {
      setUserMessage("Erro ao excluir usuário.");
      console.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="user-management-container">
      <h3>Gerenciamento de Usuários</h3>
      <form onSubmit={selectedUser ? handleUpdateUser : handleAddUser}>
        <input
          type="text"
          placeholder="Nome de Usuário"
          value={newUser.username}
          onChange={(e) =>
            e?.target
              ? setNewUser({ ...newUser, username: e.target.value })
              : null
          }
        />

        <input
          type="password"
          placeholder="Senha"
          value={newUser.password}
          onChange={(e) =>
            e?.target
              ? setNewUser({ ...newUser, password: e.target.value })
              : null
          }
        />

        <select
          value={newUser.role}
          onChange={(e) =>
            e?.target
              ? setNewUser({ ...newUser, role: e.target.value })
              : null
          }
        >
          <option value="user">Usuário</option>
          <option value="dev">Desenvolvedor</option>
          <option value="ceo">CEO</option>
        </select>
        <button type="submit">
          {selectedUser ? "Atualizar Usuário" : "Adicionar Usuário"}
        </button>
      </form>
      {userMessage && <p>{userMessage}</p>}

      <h4>Usuários Atuais:</h4>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.username} ({user.role})
            <button onClick={() => handleEditUser(user)}>Editar</button>
            <button onClick={() => handleDeleteUser(user._id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserManagement;
