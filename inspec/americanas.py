# inspect_americanas.py
import sys
import requests
from urllib.parse import quote_plus
from typing import List, Dict

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


def extract_price(product: Dict) -> float | None:
    try:
        seller = product["items"][0]["sellers"][0]
        offer = seller["commertialOffer"]
        return offer.get("Price")
    except (KeyError, IndexError, TypeError):
        return None


def extract_image(product: Dict) -> str | None:
    try:
        return product["items"][0]["images"][0]["imageUrl"]
    except (KeyError, IndexError, TypeError):
        return None


def main():
    search_term = "Celular" if len(sys.argv) < 2 else " ".join(sys.argv[1:])
    query = quote_plus(search_term.strip())

    url = SEARCH_API.format(query=query)

    print(f"\n🔍 [AMERICANAS API] Buscando: '{search_term}'")
    print(f"🌐 [AMERICANAS API] Endpoint: {url}")

    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        print(f"📡 [AMERICANAS API] Status HTTP: {resp.status_code}")
        resp.raise_for_status()
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return

    data: List[Dict] = resp.json()
    print(f"📦 [AMERICANAS API] Produtos retornados: {len(data)}")

    print("\n🎯 [INSPEÇÃO] Primeiros 3 produtos:\n")

    for idx, product in enumerate(data[:3], start=1):
        product_id = product.get("productId")
        name = product.get("productName")
        brand = product.get("brand")
        link = product.get("link")
        price = extract_price(product)
        image = extract_image(product)

        print(f"#{idx}")
        print(f"  🆔 productId : {product_id}")
        print(f"  🏷️ Nome      : {name}")
        print(f"  🏭 Marca     : {brand}")
        print(f"  💰 Preço     : {price}")
        print(f"  🔗 Link      : {link}")
        print(f"  🖼️ Imagem    : {image}")
        print("-" * 60)

    print("\n✅ [OK] Inspeção via API concluída.\n")


if __name__ == "__main__":
    main()
