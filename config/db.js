const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
  } else {
    console.log("Banco de dados conectado.");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL, -- "doctor" ou "patient"
        doctor_id INTEGER, -- Armazena o ID do médico para pacientes
        FOREIGN KEY (doctor_id) REFERENCES users(id)
        );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY,
      file_name TEXT,
      file_path TEXT,
      doctor_id INTEGER,
      patient_id INTEGER,
      upload_date TEXT,
      FOREIGN KEY(doctor_id) REFERENCES users(id),
      FOREIGN KEY(patient_id) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS channels (
      id INTEGER PRIMARY KEY,
      doctor_id INTEGER,
      patient_id INTEGER,
      invite_url TEXT,
      is_active INTEGER,
      FOREIGN KEY(doctor_id) REFERENCES users(id),
      FOREIGN KEY(patient_id) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY,
      channel_id INTEGER,
      sender_id INTEGER,
      receiver_id INTEGER,
      message TEXT,
      timestamp TEXT,
      FOREIGN KEY(channel_id) REFERENCES channels(id)
    );
  `);
});

module.exports = db;
