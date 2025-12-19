import re
import requests
from typing import Dict, List, Optional
from urllib.parse import quote_plus, urlencode
from bs4 import BeautifulSoup
from datetime import datetime

# Ajuste conforme sua estrutura de pastas
try:
    from scrapers.base import BaseScraper
except ImportError:
    from base import BaseScraper


class MercadoLivreScraper(BaseScraper):
    BASE_URL = "https://lista.mercadolivre.com.br"
    DEFAULT_MAX_ITEMS = 5

    DEBUG_HTML_FILE = "ml_html_google_proxy.html"

    HEADERS = {
        # UA simples — quem manda aqui é o IP do Google
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "pt-BR,pt;q=0.9",
    }

    # -------------------------------------------------
    # Utils
    # -------------------------------------------------
    def _parse_price(self, text: Optional[str]) -> Optional[float]:
        if not text:
            return None

        t = text.replace("R$", "").strip()
        t = re.sub(r"[^\d\.,]", "", t)

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

        for attr in ("data-src", "src", "srcset"):
            val = img_el.get(attr)
            if val and not val.startswith("data:image"):
                if attr == "srcset":
                    return val.split(",")[0].split()[0]
                return val
        return None

    def _build_google_translate_url(self, target_url: str) -> str:
        """
        Google Translate proxy (o 'proxy dos pobres')
        """
        params = {
            "sl": "auto",
            "tl": "pt",
            "u": target_url,
        }
        return (
            "https://translate.googleusercontent.com/translate?"
            + urlencode(params)
        )

    # -------------------------------------------------
    # Main
    # -------------------------------------------------
    def scrape(self, max_items: int = DEFAULT_MAX_ITEMS) -> List[Dict]:
        query = quote_plus(self.search_term.strip().lower())
        original_url = f"{self.BASE_URL}/?q={query}"
        proxy_url = self._build_google_translate_url(original_url)

        print(f"\n🔍 [ML] Busca: '{self.search_term}'")
        print(f"🌐 [ML] URL original: {original_url}")
        print(f"🛰️ [ML] Via Google Translate")

        try:
            resp = requests.get(proxy_url, headers=self.HEADERS, timeout=40)
        except Exception as e:
            print(f"❌ [ML] Erro de conexão: {e}")
            return []

        print(f"📡 [ML] Status HTTP: {resp.status_code}")
        print(f"📦 [ML] HTML recebido: {len(resp.text)} bytes")

        # 🔥 Salva HTML REAL recebido
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        debug_file = f"{ts}_{self.DEBUG_HTML_FILE}"
        with open(debug_file, "w", encoding="utf-8") as f:
            f.write(resp.text)

        print(f"🧪 [DEBUG] HTML salvo em: {debug_file}")

        html_lower = resp.text.lower()

        if "captcha" in html_lower:
            print("🚫 [ML] CAPTCHA detectado (Google bloqueou)")
            return []

        soup = BeautifulSoup(resp.text, "html.parser")

        cards = soup.select("div.poly-card")
        print(f"🧩 [ML] Cards encontrados: {len(cards)}")

        if not cards:
            print(
                "⚠️ [ML] Nenhum card encontrado.\n"
                "⚠️ Abra o HTML salvo para ver o conteúdo real."
            )
            return []

        products: List[Dict] = []

        for idx, card in enumerate(cards, start=1):
            if len(products) >= max_items:
                break

            title_el = card.select_one("a.poly-component__title")
            price_el = card.select_one("span.andes-money-amount")
            img_el = card.select_one("img")

            if not title_el:
                continue

            name = title_el.get_text(strip=True)
            product_url = title_el.get("href")
            price_text = price_el.get_text(strip=True) if price_el else None
            image_url = self._extract_image_url(img_el)

            print(f"   ✅ #{idx} {name[:60]} | {price_text}")

            products.append(
                {
                    "name": name,
                    "price_value": self._parse_price(price_text),
                    "price_text": price_text,
                    "product_url": product_url,
                    "image_url": image_url,
                }
            )

        print(f"🏁 [ML] Total coletado: {len(products)} produtos\n")
        return products
