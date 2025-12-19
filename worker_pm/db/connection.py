# worker_pm/db/connection.py
import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import pooling

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "pool_name": "worker_pool",
    "pool_size": 10,
    "pool_reset_session": True
}

try:
    connection_pool = pooling.MySQLConnectionPool(**DB_CONFIG)

    conn = connection_pool.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1")
    cursor.fetchone()
    cursor.close()
    conn.close()

    print("✅ Worker conectado ao banco de dados MySQL")

except mysql.connector.Error as err:
    print(f"❌ Erro ao conectar ao MySQL: {err}")
    raise
