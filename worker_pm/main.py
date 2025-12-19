"""
Worker de scraping - entry point único.

Responsável apenas por:
- Carregar env
- Validar Redis e MySQL
- Subir o worker RQ
"""

import os
from dotenv import load_dotenv

load_dotenv()

from rq import Worker, Queue
from redis_connection import redis_conn
from db.connection import connection_pool  # força init
import tasks  # necessário para o RQ encontrar as tasks


def main():
    queue_name = os.getenv("REDIS_QUEUE_NAME", "scrape-jobs")

    print("🚀 Worker de scraping iniciado")
    print(f"📥 Escutando fila: {queue_name}")

    queue = Queue(queue_name, connection=redis_conn)

    worker = Worker(
        [queue],
        connection=redis_conn,   # 👈 AQUI
        name="price-monitor-worker"
    )

    worker.work()



if __name__ == "__main__":
    main()
