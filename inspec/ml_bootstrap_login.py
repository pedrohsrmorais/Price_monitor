import os
from playwright.sync_api import sync_playwright

COOKIES_PATH = "cookies/mercado_livre_state.json"
os.makedirs("cookies", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)  # precisa ser visível pra você logar
    context = browser.new_context(
        locale="pt-BR",
        timezone_id="America/Sao_Paulo",
        viewport={"width": 1366, "height": 768},
    )
    page = context.new_page()

    page.goto("https://www.mercadolivre.com.br/", timeout=60000)

    print("✅ Faça login manualmente no Mercado Livre (e passe qualquer verificação).")
    print("✅ Quando terminar e estiver logado, volte aqui e pressione ENTER no terminal...")
    input()

    # Salva cookies + localStorage + etc
    context.storage_state(path=COOKIES_PATH)
    print(f"💾 Estado salvo em: {COOKIES_PATH}")

    context.close()
    browser.close()
