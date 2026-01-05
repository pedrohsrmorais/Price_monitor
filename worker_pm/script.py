import re
import requests
from typing import Optional
from urllib.parse import urlencode
from bs4 import BeautifulSoup


# =========================
# CONFIGURAÇÕES
# =========================

URLS = [
    "https://lista.mercadolivre.com.br/iphone",
    "https://lista.mercadolivre.com.br/?q=iphone",
]

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


# =========================
# FUNÇÕES
# =========================

def build_google_translate_url(target_url: str) -> str:
    params = {
        "sl": "auto",
        "tl": "pt",
        "u": target_url,
    }
    return (
        "https://translate.google.com/translate?"
        + urlencode(params)
    )



def parse_price(text: Optional[str]) -> Optional[float]:
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


def test_url(url: str) -> None:
    proxy_url = build_google_translate_url(url)

    print("\n" + "=" * 80)
    print("🌐 Testando URL via Google Translate:")
    print("➡️ Original:", url)
    print("🛰️ Proxy:", proxy_url)

    resp = requests.get(
        proxy_url,
        headers=HEADERS,
        timeout=40
    )
    resp.raise_for_status()

    print("📡 Status HTTP:", resp.status_code)
    print("📦 Tamanho do HTML:", len(resp.text), "bytes")

    html_lower = resp.text.lower()

    if "captcha" in html_lower:
        print("🚫 CAPTCHA detectado (Google bloqueou)")
        return

    soup = BeautifulSoup(resp.text, "html.parser")

    cards = soup.select("div.poly-card")
    print("🧩 Cards encontrados:", len(cards))

    if not cards:
        print("⚠️ Nenhum card encontrado — abra o HTML para debug")
        with open("debug_google_translate.html", "w", encoding="utf-8") as f:
            f.write(resp.text)
        print("🧪 HTML salvo em debug_google_translate.html")
        return

    print("\n📌 Exemplos de produtos extraídos:\n")

    for idx, card in enumerate(cards[:5], start=1):
        title_el = card.select_one("a.poly-component__title")
        price_el = card.select_one("span.andes-money-amount")
        img_el = card.select_one("img")

        name = title_el.get_text(strip=True) if title_el else None
        product_url = title_el.get("href") if title_el else None
        price_text = price_el.get_text(strip=True) if price_el else None
        price_value = parse_price(price_text)

        image_url = None
        if img_el:
            image_url = (
                img_el.get("data-src")
                or img_el.get("src")
            )

        print(f"🔹 Produto #{idx}")
        print("   Nome:", name)
        print("   Preço (texto):", price_text)
        print("   Preço (valor):", price_value)
        print("   URL:", product_url)
        print("   Imagem:", image_url)
        print("-" * 60)


# =========================
# MAIN
# =========================

if __name__ == "__main__":
    for url in URLS:
        try:
            test_url(url)
        except Exception as e:
            print(f"❌ Erro ao testar {url}: {e}")
