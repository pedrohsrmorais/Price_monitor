import re
import requests
from typing import Dict, List, Optional
from urllib.parse import quote_plus, urlencode
from bs4 import BeautifulSoup
from datetime import datetime

try:
    from scrapers.base import BaseScraper
except ImportError:
    from base import BaseScraper


class MagazineLuizaScraper(BaseScraper):
    BASE_URL = "https://www.magazineluiza.com.br"


    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "pt-BR,pt;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Connection": "keep-alive",
    }

    # -------------------------------------------------
    # Utils
    # -------------------------------------------------
    def _build_google_translate_url(self, target_url: str) -> str:
        params = {"sl": "auto", "tl": "pt", "u": target_url}
        return "https://translate.google.com/translate?" + urlencode(params)

    def _parse_price(self, text: Optional[str]) -> Optional[float]:
        if not text:
            return None

        t = text.replace("R$", "").replace("\xa0", " ").strip()
        t = re.sub(r"[^\d,\.]", "", t)

        if "," in t:
            t = t.replace(".", "").replace(",", ".")
        else:
            t = t.replace(".", "")

        try:
            return float(t)
        except ValueError:
            return None

    def _extract_image_url(self, img_el) -> Optional[str]:
        if not img_el:
            return None

        for attr in ("src", "data-src", "srcset"):
            val = img_el.get(attr)
            if val and not val.startswith("data:image"):
                if attr == "srcset":
                    return val.split(",")[0].split()[0]
                return val
        return None

    # -------------------------------------------------
    # Main
    # -------------------------------------------------
    def scrape(self, max_items: int) -> List[Dict]:

        query = quote_plus(self.search_term.strip().lower())
        original_url = f"{self.BASE_URL}/busca/{query}/"
        proxy_url = self._build_google_translate_url(original_url)

        print(f"\n🔍 [MAGALU] Buscando: '{self.search_term}'")
       
  

        try:
            resp = requests.get(proxy_url, headers=self.HEADERS, timeout=40)
            resp.raise_for_status()
        except Exception as e:
            print(f"❌ [MAGALU] Erro de conexão: {e}")
            return []

    

        

        if "captcha" in resp.text.lower():
            print("🚫 [MAGALU] CAPTCHA detectado")
            

        soup = BeautifulSoup(resp.text, "html.parser")

        # Card real da Magalu
        cards = soup.select("div[data-testid='product-card-content']")

        if not cards:
            print("⚠️ [MAGALU] Nenhum card encontrado")
            return []


        products: List[Dict] = []

        for idx, card in enumerate(cards, start=1):
            if len(products) >= max_items:
                break

            # Título
            title_el = card.select_one("h2[data-testid='product-title']")
            if not title_el:
                continue

            # Link (é o PAI do card)
            link_el = card.find_parent("a", href=True)
            if not link_el:
                if idx == 1:
                    print("⚠️ [MAGALU] Link não encontrado no card")
                continue

            # Preço (fallbacks reais)
            price_el = (
                card.select_one("p[data-testid='price-value']")
                or card.select_one("p[data-testid='price-default']")
            )

            # Imagem
            img_el = card.select_one("img[data-testid='image']")

            name = title_el.get_text(strip=True)

            product_url = link_el.get("href")
            if product_url and product_url.startswith("/"):
                product_url = self.BASE_URL + product_url

            price_text = price_el.get_text(strip=True) if price_el else None
            image_url = self._extract_image_url(img_el)



            products.append(
                {
                    "name": name,
                    "price_value": self._parse_price(price_text),
                    "price_text": price_text,
                    "product_url": product_url,
                    "image_url": image_url,
                }
            )

        return products
