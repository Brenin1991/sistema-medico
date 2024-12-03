const db = require('../config/db');
const path = require('path');

exports.getDoctorsByPatient = (req, res) => {
  const patientId = req.user.id; // Assume-se que o paciente está autenticado e o ID está em `req.user.id`

  db.all(`
    SELECT DISTINCT doctors.id, doctors.name, doctors.email
    FROM users AS doctors
    JOIN documents ON doctors.id = documents.doctor_id
    WHERE documents.patient_id = ?
  `, [patientId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar médicos' });
    res.json(rows);
  });
};

exports.getDocumentsByPatient = (req, res) => {
  const patientId = req.params.patientId;

  db.all(`
    SELECT * FROM documents WHERE patient_id = ?
  `, [patientId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar documentos' });
    res.json(rows);
  });
};


exports.uploadDocument = (req, res) => {
  const { doctor_id, patient_id } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo não enviado' });
  }

  const file_name = req.file.filename;
  const file_path = path.join('/uploads', file_name);
  const upload_date = new Date().toISOString();

  db.run(`
    INSERT INTO documents (file_name, file_path, doctor_id, patient_id, upload_date)
    VALUES (?, ?, ?, ?, ?)
  `, [file_name, file_path, doctor_id, patient_id, upload_date], function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao fazer upload' });
    res.status(201).json({ message: 'Documento enviado' });
  });
};
