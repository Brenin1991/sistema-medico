const express = require('express');
const router = express.Router();
const salaController = require('../controllers/salaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rota para listar os pacientes de um médico autenticado
router.get('/', authMiddleware, salaController.getSalas);

// Rota para listar médicos vinculados ao paciente
router.get('/salasByPatient', authMiddleware, salaController.getSalasByPatient);

router.post('/create', authMiddleware, salaController.create);

module.exports = router;
