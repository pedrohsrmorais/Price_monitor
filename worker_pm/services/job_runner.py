from db.repositories.scrape_job_repository import ScrapeJobRepository
from db.repositories.product_repository import ProductRepository
from services.scraper_factory import ScraperFactory


class JobRunner:
    def __init__(self):
        self.job_repo = ScrapeJobRepository()
        self.product_repo = ProductRepository()

    def run(self, job_id: int):
        print(f"\n🚀 Iniciando job de scrape | job_id={job_id}")

        try:
            job = self.job_repo.get_by_id(job_id)

            # clamp defensivo
            max_items = int(job.max_items or 10)
            max_items = max(1, min(max_items, 10))

            print(
                f"📦 Job carregado | "
                f"marketplace={job.marketplace.scraper_key} | "
                f"search_term='{job.search_term}' | "
                f"max_items={max_items}"
            )

            self.job_repo.mark_running(job_id)
            print(f"🟡 Job {job_id} RUNNING")

            scraper = ScraperFactory.create(
                scraper_key=job.marketplace.scraper_key,
                search_term=job.search_term
            )

            collected = 0

            for product in scraper.scrape(max_items=max_items):
                # defensivo: não deixa o job morrer por item inválido
                name = product.get("name")
                product_url = product.get("product_url")
                if not name or not product_url:
                    continue

                self.product_repo.create(
                    scrape_job_id=job.id,
                    marketplace_id=job.marketplace_id,
                    name=name,
                    price_value=product.get("price_value"),
                    price_text=product.get("price_text"),
                    product_url=product_url,
                    image_url=product.get("image_url"),
                )

                collected += 1
                print(f"💾 Produto salvo ({collected}/{max_items}): {name[:80]}")

            self.job_repo.mark_done(job_id)
            print(f"🟢 Job {job_id} DONE | produtos_coletados={collected}")

        except Exception as exc:
            self.job_repo.mark_failed(job_id, str(exc))
            print(f"🔴 Job {job_id} FAILED: {exc}")
            raise
