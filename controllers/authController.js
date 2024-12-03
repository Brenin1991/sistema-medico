const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const db = require('../config/db');
const secret = process.env.JWT_SECRET || 'your_jwt_secret';

// Função para registrar novos usuários (médicos e pacientes)
exports.register = (req, res) => {
  const { name, email, password, role } = req.body;

  // Verifica se todos os campos foram preenchidos
  if (!name || !email || !password || !role) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  // Verifica se o email já está cadastrado
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, existingUser) => {
    if (existingUser) {
      return res.status(409).send('Email já cadastrado');
    }

    // Criptografa a senha
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insere o novo usuário no banco de dados
    db.run(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, role],
      function (err) {
        if (err) {
          console.error(err); // Exibe erro no console para depuração
          return res.status(500).send('Erro ao registrar o usuário');
        }
        res.status(201).send('Usuário registrado com sucesso');
      }
    );
  });
};

// Função de login para autenticação de usuários
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Busca o usuário pelo email
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    // Verifica se o usuário existe e se a senha está correta
    if (err || !user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Credenciais inválidas');
    }

    // Gera o token JWT contendo o id e o role do usuário
    const token = jwt.encode({ id: user.id, role: user.role }, secret);
    console.log("Token gerado:", token);


    console.log("logado");
    // Retorna o token e o id do usuário para uso no front-end
    res.json({ token, userId: user.id, role: user.role });
  });
};
