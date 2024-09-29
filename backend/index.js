const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 5000;
const secret = 'sua_chave_secreta'; // Em produção, use uma chave mais segura

app.use(cors());
app.use(express.json());

// Armazenamento temporário de usuários (para um banco de dados, isso seria substituído)
let users = [
  { id: 2, username: 'ceo', password: bcrypt.hashSync('password2', 10), role: 'ceo' },
  { id: 1, username: 'dev', password: bcrypt.hashSync('password3', 10), role: 'dev' },
];

// Middleware para autenticar o usuário e verificar o token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Middleware para autorizar usuários com base no papel (role)
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    next();
  };
}

// Rota de registro de novos usuários
app.post('/register', (req, res) => {
  const { username, password, role } = req.body;

  // Verifica se o usuário já existe
  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'Usuário já existe' });
  }

  // Criptografar a senha e adicionar o novo usuário
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = { id: users.length + 1, username, password: hashedPassword, role };
  users.push(newUser);

  res.status(201).json({ message: 'Usuário registrado com sucesso!' });
});

// Rota de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verifica se o usuário existe
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'Credenciais inválidas' });
  }

  // Gerar o token JWT com o papel do usuário
  const accessToken = jwt.sign({ username: user.username, role: user.role }, secret, { expiresIn: '1h' });
  res.json({ accessToken, role: user.role });
});

// Rotas protegidas para cada tipo de papel (role)

// Rota para usuários comuns
app.get('/user-home', authenticateToken, authorizeRoles('user'), (req, res) => {
  res.json({ message: 'Bem-vindo, usuário!' });
});

// Rota para o CEO
app.get('/ceo-home', authenticateToken, authorizeRoles('ceo'), (req, res) => {
  res.json({ message: 'Bem-vindo, CEO!' });
});

// Rota para desenvolvedores
app.get('/dev-home', authenticateToken, authorizeRoles('dev'), (req, res) => {
  res.json({ message: 'Bem-vindo, desenvolvedor!' });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
