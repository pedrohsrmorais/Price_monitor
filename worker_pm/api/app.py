import os
from typing import Optional

from fastapi import FastAPI, HTTPException, Header, status
from rq import Queue

from redis_connection import redis_conn


# -------------------------
# App
# -------------------------
app = FastAPI(
    title="Scraper Enqueue API",
    version="1.0.0"
)

# -------------------------
# Config
# -------------------------
QUEUE_NAME = os.getenv("REDIS_QUEUE_NAME", "scrape-jobs")
API_KEY = os.getenv("WORKER_API_KEY")

# -------------------------
# Queue
# -------------------------
queue = Queue(QUEUE_NAME, connection=redis_conn)


# -------------------------
# Healthcheck
# -------------------------
@app.get("/health", status_code=status.HTTP_200_OK)
def health():
    return {
        "status": "ok",
        "service": "scraper-enqueue-api"
    }


# -------------------------
# Ping (TESTE DE CONEXÃO)
# -------------------------
@app.get("/ping", status_code=status.HTTP_200_OK)
def ping():
    print("🔔 PING recebido do backend Node.js")
    return {
        "pong": True,
        "message": "FastAPI está acessível"
    }


# -------------------------
# Enqueue endpoint
# -------------------------
@app.post("/enqueue/{job_id}", status_code=status.HTTP_202_ACCEPTED)
def enqueue_job(
    job_id: int,
    x_api_key: Optional[str] = Header(default=None)
):
    print(f"📥 Requisição /enqueue recebida | job_id={job_id}")

    # 🔐 Proteção simples entre serviços
    if API_KEY:
        if not x_api_key or x_api_key != API_KEY:
            print("❌ API KEY inválida ou ausente")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized"
            )

    try:
        print("Tentando enfileirar job...")
        queue.enqueue(
            "tasks.run_scraper",
            job_id,
            job_timeout="30m",
            result_ttl=0,
            failure_ttl=86400
        )


        print(f"✅ Job {job_id} enfileirado com sucesso")

        return {
            "status": "queued",
            "job_id": job_id,
            "queue": QUEUE_NAME
        }

    except Exception as exc:
        print(f"🔥 Erro ao enfileirar job {job_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc)
        )
