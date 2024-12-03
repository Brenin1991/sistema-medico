const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rota para listar os pacientes de um médico autenticado
router.get('/', authMiddleware, patientController.getPatients);

module.exports = router;
