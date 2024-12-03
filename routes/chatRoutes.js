const express = require('express');
const router = express.Router();

// Aqui você pode adicionar rotas para o chat, se necessário
router.get('/', (req, res) => {
  res.send('Chat routes');
});

module.exports = router;
