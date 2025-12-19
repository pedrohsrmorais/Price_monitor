# worker_pm/scrapers/mercado_livre.py

from typing import List, Dict
from scrapers.base import BaseScraper

class MercadoLivreScraper(BaseScraper):

    def scrape(self) -> List[Dict]:
        products = []

        products.append({
            "name": "iPhone 13",
            "price_value": 3500.00,
            "price_text": "R$ 3.500",
            "product_url": "https://...",
            "image_url": "https://..."
        })

        return products
