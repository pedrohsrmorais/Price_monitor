from db.connection import connection_pool
from datetime import datetime


class ScrapeJobRepository:

    def get_by_id(self, job_id: int):
        conn = connection_pool.get_connection()
        cursor = None
        try:
            cursor = conn.cursor(dictionary=True)

            query = """
                SELECT
                    sj.id AS job_id,
                    sj.search_term,
                    sj.marketplace_id,
                    sj.max_items,
                    m.scraper_key
                FROM scrape_jobs sj
                JOIN marketplaces m ON m.id = sj.marketplace_id
                WHERE sj.id = %s
                LIMIT 1
            """

            cursor.execute(query, (job_id,))
            row = cursor.fetchone()

            if not row:
                raise ValueError(f"Job {job_id} não encontrado")

            max_items = row.get("max_items") or 10  # fallback defensivo

            return type("Job", (), {
                "id": row["job_id"],
                "search_term": row["search_term"],
                "marketplace_id": row["marketplace_id"],
                "max_items": max_items,
                "marketplace": type("Marketplace", (), {
                    "scraper_key": row["scraper_key"]
                })()
            })

        finally:
            if cursor:
                cursor.close()
            conn.close()

    def mark_running(self, job_id: int):
        self._update_status(job_id, status="running", started_at=datetime.utcnow())

    def mark_done(self, job_id: int):
        self._update_status(job_id, status="done", finished_at=datetime.utcnow())

    def mark_failed(self, job_id: int, reason: str):
        self._update_status(
            job_id,
            status="failed",
            finished_at=datetime.utcnow(),
            error_message=(reason or "")[:1000]
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
        cursor = None
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

            if error_message is not None and error_message != "":
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
            if cursor:
                cursor.close()
            conn.close()
