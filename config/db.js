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
        role TEXT NOT NULL
        );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY,
      file_name TEXT,
      file_path TEXT,
      doctor_id INTEGER,
      patient_id INTEGER,
      sala_id INTEGER,
      upload_date TEXT,
      FOREIGN KEY(doctor_id) REFERENCES users(id),
      FOREIGN KEY(patient_id) REFERENCES users(id),
      FOREIGN KEY(sala_id ) REFERENCES salas(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS salas (
      sala_name TEXT,
      id INTEGER PRIMARY KEY,
      doctor_id INTEGER,
      patient_id INTEGER,
      invite_url TEXT,
      is_active INTEGER,
      FOREIGN KEY(doctor_id) REFERENCES users(id),
      FOREIGN KEY(patient_id) REFERENCES users(id)
    );
  `);
});

module.exports = db;
