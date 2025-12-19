# worker_pm/db/repositories/scrape_job_repository.py

from db.connection import connection_pool
from datetime import datetime


class ScrapeJobRepository:

    def get_by_id(self, job_id: int):
        conn = connection_pool.get_connection()
        try:
            cursor = conn.cursor(dictionary=True)

            query = """
                SELECT
                    id,
                    search_term,
                    marketplace_id
                FROM scrape_jobs
                WHERE id = %s
            """

            cursor.execute(query, (job_id,))
            row = cursor.fetchone()

            if not row:
                raise ValueError(f"Job {job_id} não encontrado")

            # 🔁 Mapeamento simples e seguro
            scraper_key = self._resolve_scraper_key(row["marketplace_id"])

            return type("Job", (), {
                "id": row["id"],
                "search_term": row["search_term"],
                "marketplace_id": row["marketplace_id"],
                "marketplace": type("Marketplace", (), {
                    "scraper_key": scraper_key
                })()
            })

        finally:
            cursor.close()
            conn.close()

    def _resolve_scraper_key(self, marketplace_id: int) -> str:
        # 🔥 Simplificado por enquanto
        if marketplace_id == 1:
            return "mercado_livre"

        raise ValueError(f"Marketplace não suportado: {marketplace_id}")

    def mark_running(self, job_id: int):
        self._update_status(
            job_id,
            status="running",
            started_at=datetime.utcnow()
        )

    def mark_done(self, job_id: int):
        self._update_status(
            job_id,
            status="done",
            finished_at=datetime.utcnow()
        )

    def mark_failed(self, job_id: int, reason: str):
        self._update_status(
            job_id,
            status="failed",
            finished_at=datetime.utcnow(),
            error_message=reason[:1000]
        )

    def _update_status(
        self,
        job_id: int,
        status: str,
        started_at=None,
        finished_at=None,
        error_message=None
    ):
        conn = connection_pool.get_connection()
        try:
            cursor = conn.cursor()

            fields = ["status = %s"]
            values = [status]

            if started_at:
                fields.append("started_at = %s")
                values.append(started_at)

            if finished_at:
                fields.append("finished_at = %s")
                values.append(finished_at)

            if error_message:
                fields.append("error_message = %s")
                values.append(error_message)

            values.append(job_id)

            query = f"""
                UPDATE scrape_jobs
                SET {", ".join(fields)}
                WHERE id = %s
            """

            cursor.execute(query, tuple(values))
            conn.commit()

            print(f"📌 Job {job_id} status atualizado para '{status}'")

        finally:
            cursor.close()
            conn.close()
