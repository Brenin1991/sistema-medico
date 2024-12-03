const jwt = require('jwt-simple');
const secret = process.env.JWT_SECRET || 'your_jwt_secret';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log("authHeader:", authHeader); // Para depuração

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ error: 'Token necessário' }); 
  }

  try {
    // Extrai o token após "Bearer "
    const token = authHeader.split(' ')[1];
    console.log("Token extraído:", token); // Para verificar o token extraído

    const decoded = jwt.decode(token, secret);
    req.user = decoded; // Coloca o usuário autenticado em `req.user`
    next();
  } catch (error) {
    console.error("Erro ao decodificar o token:", error); // Log do erro para depuração
    res.status(403).json({ error: 'Token inválido' });
  }
};

module.exports = authMiddleware;
