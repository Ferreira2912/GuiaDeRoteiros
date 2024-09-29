const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = 5000;
const secret = '124151223'; // Em produção, use uma chave mais segura
const uri = "mongodb+srv://usuario:senha@bdguia.mtldo.mongodb.net/?retryWrites=true&w=majority&appName=bdguia";
let db; // Declarando a variável db aqui para que possa ser usada nas rotas

app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db('bdguia'); // Agora a variável db é atualizada corretamente
    console.log('Conectado ao MongoDB com sucesso');
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
  });

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
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const userExists = await db.collection('users').findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
      username,
      password: hashedPassword,
      role
    };

    await db.collection('users').insertOne(newUser);
    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar usuário', error });
  }
});

// Rota de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db.collection('users').findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    const accessToken = jwt.sign({ username: user.username, role: user.role }, secret, { expiresIn: '1h' });
    res.json({ accessToken, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao realizar login', error });
  }
});

// Rotas protegidas para cada tipo de papel (role)
app.get('/user-home', authenticateToken, authorizeRoles('user'), (req, res) => {
  res.json({ message: 'Bem-vindo, usuário!' });
});

app.get('/ceo-home', authenticateToken, authorizeRoles('ceo'), (req, res) => {
  res.json({ message: 'Bem-vindo, CEO!' });
});

app.get('/dev-home', authenticateToken, authorizeRoles('dev'), (req, res) => {
  res.json({ message: 'Bem-vindo, desenvolvedor!' });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
