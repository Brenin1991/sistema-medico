const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const cors = require('cors'); // Importa o CORS

// Configuração de CORS para requisições HTTP
app.use(cors({
  origin: "*", // Permite todas as origens
  methods: ["GET", "POST"],
  credentials: true
}));

// Middlewares e rotas
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/auth', require('./routes/authRoutes'));
app.use('/documents', require('./routes/documentRoutes'));
app.use('/patients', require('./routes/patientRoutes'));
app.use('/salas', require('./routes/salaRoutes'));

// Inicia o servidor HTTP e Socket.IO
http.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
