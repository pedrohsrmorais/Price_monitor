# worker_pm/services/scraper_factory.py

from scrapers.mercado_livre import MercadoLivreScraper
from scrapers.magazine_luiza import MagazineLuizaScraper
from scrapers.americanas import AmericanasScraper


class ScraperFactory:
    SCRAPERS = {
        "mercado_livre": MercadoLivreScraper,
        "magazine_luiza": MagazineLuizaScraper,
        "americanas": AmericanasScraper,
    }

    @staticmethod
    def create(scraper_key: str, search_term: str):
        if not scraper_key:
            raise ValueError("scraper_key não informado")

        scraper_cls = ScraperFactory.SCRAPERS.get(scraper_key)

        if not scraper_cls:
            raise ValueError(f"Scraper não encontrado: {scraper_key}")

        return scraper_cls(search_term)
