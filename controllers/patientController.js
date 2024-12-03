const db = require('../config/db');

exports.getPatients = (req, res) => {
  console.log("entrou lista");
  // Verifique se o usuário autenticado é um médico
  if (req.user.role !== 'doctor') {
    return res.status(403).send('Acesso negado. Apenas médicos podem acessar essa rota.');
  }

  const doctorId = req.user.id; // ID do médico autenticado
  console.log(doctorId);
  // Busca todos os pacientes associados ao médico
  db.all(`SELECT * FROM users WHERE role = 'patient' AND doctor_id = ?`, [doctorId], (err, rows) => {
    if (err) {
      return res.status(500).send('Erro ao buscar pacientes');
    }
    res.json(rows);
  });
};
