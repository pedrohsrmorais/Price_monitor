# worker_pm/services/job_runner.py

from db.repositories.scrape_job_repository import ScrapeJobRepository
from db.repositories.product_repository import ProductRepository
from services.scraper_factory import ScraperFactory


class JobRunner:
    def __init__(self):
        self.job_repo = ScrapeJobRepository()
        self.product_repo = ProductRepository()

    def run(self, job_id: int):
        print(f"🚀 Iniciando job de scrape com ID {job_id}...")

        try:
            # 1️⃣ Busca job
            job = self.job_repo.get_by_id(job_id)

            # 2️⃣ Marca como running
            self.job_repo.mark_running(job_id)
            print(f"🟡 Job {job_id} RUNNING")

            # 3️⃣ Cria scraper correto
            scraper = ScraperFactory.create(
                scraper_key=job.marketplace.scraper_key,
                search_term=job.search_term
            )

            # 4️⃣ Scraping incremental (produto por produto)
            for product in scraper.scrape():
                self.product_repo.create(
                    scrape_job_id=job.id,
                    marketplace_id=job.marketplace_id,
                    name=product["name"],
                    price_value=product.get("price_value"),
                    price_text=product.get("price_text"),
                    product_url=product["product_url"],
                    image_url=product.get("image_url"),
                )

                print(f"💾 Produto salvo: {product['name']}")

            # 5️⃣ Finaliza job
            self.job_repo.mark_done(job_id)
            print(f"🟢 Job {job_id} DONE")

        except Exception as exc:
            # 6️⃣ Falha controlada
            self.job_repo.mark_failed(job_id, str(exc))
            print(f"🔴 Job {job_id} FAILED: {exc}")
            raise
