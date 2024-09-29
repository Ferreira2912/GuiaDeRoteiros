const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb'); // Importando ObjectId corretamente
const os = require('os');

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

app.get('/status', async (req, res) => {
  // Simulação do tempo de resposta (pode ser baseado em uma chamada real)
  const start = Date.now();
  const responseTime = Date.now() - start; // Simulação de tempo de resposta

  // Uso de CPU
  const cpuUsage = os.loadavg()[0]; // Média de carga da CPU nos últimos 1 minuto

  // Uso de Memória
  const totalMemory = os.totalmem(); // Total de memória
  const freeMemory = os.freemem(); // Memória livre
  const usedMemory = totalMemory - freeMemory; // Memória usada
  const memoryUsage = (usedMemory / totalMemory) * 100; // Porcentagem de uso de memória

  // Tempo de atividade (uptime) do sistema
  const uptime = process.uptime();

  // Verificar status do banco de dados
  let dbStatus = 'offline';
  try {
    await db.command({ ping: 1 }); // Comando ping para verificar conexão com o MongoDB
    dbStatus = 'online';
  } catch (error) {
    dbStatus = 'offline';
  }

  const serverStatus = {
    status: 'online', // Pode ser 'online', 'degraded', ou 'offline'
    load: cpuUsage * 100, // Convertendo para porcentagem
    memoryUsage: memoryUsage.toFixed(2), // Porcentagem de uso de memória
    uptime, // Tempo de atividade em segundos
    responseTime, // Tempo de resposta em milissegundos
    dbStatus // Status do banco de dados
  };

  // Simula o status baseado na carga
  if (serverStatus.load < 50 && memoryUsage < 80 && dbStatus === 'online') {
    serverStatus.status = 'online'; // Verde
  } else if (serverStatus.load < 80 && memoryUsage < 90) {
    serverStatus.status = 'degraded'; // Laranja
  } else {
    serverStatus.status = 'offline'; // Vermelho
  }

  res.json(serverStatus);
});

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

// Rota para adicionar novos usuários
app.post('/add-user', authenticateToken, authorizeRoles('dev'), async (req, res) => {
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
    res.status(201).json({ message: 'Usuário adicionado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar usuário', error });
  }
});

// Rota para buscar todos os usuários
app.get('/users', authenticateToken, authorizeRoles('dev'), async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários', error });
  }
});

// Rota para editar um usuário existente
app.put('/edit-user/:id', authenticateToken, authorizeRoles('dev'), async (req, res) => {
  const { id } = req.params; // ID do usuário a ser editado
  const { username, password, role } = req.body;

  try {
    // Converte o id para ObjectId
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const updatedUser = {
      username: username || user.username, // Se não houver um novo username, mantém o antigo
      role: role || user.role, // Se não houver um novo papel, mantém o antigo
    };

    if (password) {
      updatedUser.password = bcrypt.hashSync(password, 10); // Criptografa a nova senha se ela for fornecida
    }

    await db.collection('users').updateOne({ _id: new ObjectId(id) }, { $set: updatedUser });
    res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário', error });
  }
});

// Rota para excluir um usuário existente
app.delete('/delete-user/:id', authenticateToken, authorizeRoles('dev'), async (req, res) => {
  const { id } = req.params; // ID do usuário a ser excluído

  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: 'Usuário excluído com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir usuário', error });
  }
});
