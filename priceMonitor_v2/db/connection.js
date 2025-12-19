// db/connection.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Teste de conexão
try {
  await pool.query("SELECT 1");
  console.log("✅ Conectado ao banco de dados MySQL");
} catch (err) {
  console.error("❌ Erro ao conectar com o banco de dados:", err.message);
}

export const db = pool;
export default pool;
