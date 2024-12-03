const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middlewares/authMiddleware');
const documentController = require('../controllers/documentController');

// Configuração do armazenamento de arquivos com multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Rota para upload de documentos
router.post('/upload', authMiddleware, upload.single('file'), documentController.uploadDocument);

// Rota para listar médicos vinculados ao paciente
router.get('/doctors', authMiddleware, documentController.getDoctorsByPatient);


router.get('/:patientId', authMiddleware, documentController.getDocumentsByPatient);


module.exports = router;
