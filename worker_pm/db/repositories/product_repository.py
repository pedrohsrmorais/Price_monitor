# worker_pm/db/repositories/product_repository.py

from typing import Optional
from db.connection import connection_pool


class ProductRepository:
    def create(
        self,
        scrape_job_id: int,
        marketplace_id: int,
        name: str,
        price_value: Optional[float],
        price_text: Optional[str],
        product_url: str,
        image_url: Optional[str],
    ):
        conn = connection_pool.get_connection()

        try:
            cursor = conn.cursor()

            query = """
                INSERT INTO products (
                    scrape_job_id,
                    marketplace_id,
                    name,
                    price_value,
                    price_text,
                    product_url,
                    image_url
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """

            cursor.execute(
                query,
                (
                    scrape_job_id,
                    marketplace_id,
                    name,
                    price_value,
                    price_text,
                    product_url,
                    image_url,
                )
            )

            conn.commit()

            print(f"💾 Produto salvo no banco: {name}")

        finally:
            cursor.close()
            conn.close()
