const db = require('../config/db');
const path = require('path');

exports.getDocumentsByPatient = (req, res) => {
  const patientId = req.params.patientId;

  db.all(`
    SELECT * FROM documents WHERE patient_id = ?
  `, [patientId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar documentos' });
    res.json(rows);
  });
};

exports.getDocumentsBySala = (req, res) => {
  const salaId = req.params.salaId;

  db.all(`
    SELECT * FROM documents WHERE sala_id = ?
  `, [salaId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar documentos' });
    res.json(rows);
  });
};


exports.uploadDocument = (req, res) => {
  const { doctor_id, file_description, patient_id, sala_id } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo não enviado' });
  }

  const file_name = req.file.filename;
  const file_path = path.join('/uploads', file_name);
  const upload_date = new Date().toISOString();

  db.run(`
    INSERT INTO documents (file_name, file_path, doctor_id, patient_id, sala_id, upload_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [file_description, file_path, doctor_id, patient_id, sala_id, upload_date], function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao fazer upload' });
    res.status(201).json({ message: 'Documento enviado' });
  });
};

exports.deleteDocument = (req, res) => {
  const documentId = req.params.documentId; // ID do documento a ser deletado

  // Primeiro, busque o documento para garantir que ele exista
  db.get('SELECT * FROM documents WHERE id = ?', [documentId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro ao verificar o documento' });
    if (!row) return res.status(404).json({ error: 'Documento não encontrado' });

    // Agora, deletamos o documento
    db.run('DELETE FROM documents WHERE id = ?', [documentId], function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao deletar o documento' });
      res.status(200).json({ message: 'Documento deletado com sucesso' });
    });
  });
};



