const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:8080", // Defina a origem do seu front-end aqui
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
const cors = require('cors'); // Importa o CORS

// Configuração de CORS para requisições HTTP
app.use(cors({
  origin: "http://localhost:8080", // Defina a origem do seu front-end
  methods: ["GET", "POST"],
  credentials: true
}));

// Middlewares e rotas
app.use(express.json());
app.use('/auth', require('./routes/authRoutes'));
app.use('/documents', require('./routes/documentRoutes'));
app.use('/chat', require('./routes/chatRoutes'));
app.use('/patients', require('./routes/patientRoutes'));
app.use('/uploads', express.static('uploads'));

// WebSocket para chat em tempo real
io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  socket.on('joinRoom', ({ doctorId, patientId }) => {
    const roomName = `room-${doctorId}-${patientId}`;
    socket.join(roomName);
    console.log(`Cliente entrou na sala ${roomName}`);
  });

  socket.on('sendMessage', ({ doctorId, patientId, message }) => {
    const roomName = `room-${doctorId}-${patientId}`;
    // Envia a mensagem para todos os outros na sala, excluindo o remetente
    socket.broadcast.to(roomName).emit('receiveMessage', { message });
    console.log(`Mensagem enviada para sala ${roomName}: ${message}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});



// Inicia o servidor HTTP e Socket.IO
http.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
