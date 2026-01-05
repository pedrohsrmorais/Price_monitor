import requests
from typing import Dict, List, Optional
from urllib.parse import quote

try:
    from scrapers.base import BaseScraper
except ImportError:
    from base import BaseScraper


class AmericanasScraper(BaseScraper):
    BASE_URL = "https://www.americanas.com.br"
    SEARCH_API = (
        "https://www.americanas.com.br/api/catalog_system/"
        "pub/products/search/?ft={query}"
    )

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json",
        "Accept-Language": "pt-BR,pt;q=0.9",
        "Connection": "keep-alive",
    }

    # -------------------------------------------------
    # Utils (API)
    # -------------------------------------------------
    def _extract_price(self, product: Dict) -> Optional[float]:
        try:
            seller = product["items"][0]["sellers"][0]
            offer = seller["commertialOffer"]
            return offer.get("Price")
        except (KeyError, IndexError, TypeError):
            return None

    def _extract_image_url(self, product: Dict) -> Optional[str]:
        try:
            return product["items"][0]["images"][0]["imageUrl"]
        except (KeyError, IndexError, TypeError):
            return None

    def _extract_product_url(self, product: Dict) -> Optional[str]:
        link = product.get("link")
        if not link:
            return None
        return link if link.startswith("http") else f"{self.BASE_URL}{link}"

    # -------------------------------------------------
    # Main
    # -------------------------------------------------
    def scrape(self, max_items: int) -> List[Dict]:

        # 🔑 CORREÇÃO AQUI:
        # - tudo em minúsculo
        # - espaços viram %20 (não +)
        query = quote(self.search_term.strip().lower(), safe="")

        url = self.SEARCH_API.format(query=query)

        print(f"\n🔍 [AMERICANAS] Buscando: '{self.search_term}'")
        print(f"🌐 [AMERICANAS] API: {url}")

        try:
            resp = requests.get(url, headers=self.HEADERS, timeout=30)
            print(f"📡 [AMERICANAS] Status HTTP: {resp.status_code}")
            resp.raise_for_status()
        except Exception as e:
            print(f"❌ [AMERICANAS] Erro de conexão/API: {e}")
            return []

        try:
            data: List[Dict] = resp.json()
        except Exception as e:
            print(f"❌ [AMERICANAS] Erro ao parsear JSON: {e}")
            return []

        products: List[Dict] = []

        for idx, product in enumerate(data, start=1):
            if len(products) >= max_items:
                break

            name = product.get("productName")
            product_url = self._extract_product_url(product)
            price_value = self._extract_price(product)
            image_url = self._extract_image_url(product)

            if not name or not product_url:
                continue

            products.append(
                {
                    "name": name,
                    "price_value": price_value,
                    "price_text": (
                        f"R$ {price_value:.2f}" if price_value is not None else None
                    ),
                    "product_url": product_url,
                    "image_url": image_url,
                }
            )

        print(f"🏁 [AMERICANAS] Total coletado: {len(products)} produtos\n")
        return products
