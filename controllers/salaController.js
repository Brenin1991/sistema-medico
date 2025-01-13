const db = require("../config/db");

exports.getSalas = (req, res) => {
  console.log("entrou lista");
  // Verifique se o usuário autenticado é um médico
  if (req.user.role !== "doctor") {
    return res
      .status(403)
      .send("Acesso negado. Apenas médicos podem acessar essa rota.");
  }

  const doctorId = req.user.id;
  db.all(
    `
      SELECT salas.*, users.name AS patient_name
      FROM salas
      JOIN users ON salas.patient_id = users.id
      WHERE salas.doctor_id = ?
    `,
    [doctorId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Erro ao buscar salas" });
      console.log(rows);
      res.json(rows);
    }
  );
};


exports.getSalasByPatient = (req, res) => {
  const patientId = req.user.id; // Assume-se que o paciente está autenticado e o ID está em `req.user.id`

  db.all(
    `
      SELECT salas.*, users.name AS doctor_name
      FROM salas
      JOIN users ON salas.doctor_id = users.id
      WHERE salas.patient_id = ?
    `,
    [patientId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Erro ao buscar salas" });
      console.log(rows);
      res.json(rows);
    }
  );
};


exports.create = (req, res) => {
  if (req.user.role !== "doctor") {
    return res
      .status(403)
      .send("Acesso negado. Apenas médicos podem acessar essa rota.");
  }
  const { name, patientId } = req.body;

  const doctorId = req.user.id;
  // Verifica se todos os campos foram preenchidos
  if (!name || !doctorId || !patientId) {
    return res.status(400).send("Todos os campos são obrigatórios.");
  }

  db.run(
    `INSERT INTO salas (sala_name, doctor_id, patient_id) VALUES (?, ?, ?)`,
    [name, doctorId, patientId],
    function (err) {
      if (err) {
        console.error(err); // Exibe erro no console para depuração
        return res.status(500).send("Erro ao registrar a sala");
      }
      res.status(201).send("Sala registrada com sucesso");
    }
  );
};
