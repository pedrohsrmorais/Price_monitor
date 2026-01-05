import requests

url = "https://lista.mercadolivre.com.br/iphone"

proxies = {
    "http": "http://user:pass@host:port",
    "https": "http://user:pass@host:port",
}

headers = {
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "pt-BR,pt;q=0.9"
}

r = requests.get(url, headers=headers, proxies=proxies, timeout=30)

print(len(r.text))
print("poly-card" in r.text)
