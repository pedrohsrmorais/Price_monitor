# 🕷️ Price Monitor – Plataforma de Monitoramento de Preços

## 1. Visão Geral

O **Price Monitor** é uma plataforma para **coleta, monitoramento e comparação de preços** em múltiplos marketplaces brasileiros. O sistema utiliza **scraping assíncrono**, **processamento desacoplado por jobs** e uma **arquitetura orientada a serviços**, garantindo escalabilidade, manutenibilidade e isolamento de responsabilidades.

A aplicação permite que usuários criem coletas de preços a partir de um termo de busca, selecionem marketplaces específicos e acompanhem a execução e os resultados de cada coleta.

**URL do Projeto**  
https://scrapper.prometio.com.br

---

## 2. Funcionalidades Principais

- Criar coletas de preços a partir de um **termo de busca**
- Selecionar **um ou mais marketplaces** por coleta
- Definir **quantidade máxima de produtos** por marketplace
- Acompanhar o **status de execução** dos jobs
- Visualizar **produtos coletados** com preços normalizados

---

## 3. Arquitetura Geral

A plataforma é dividida em **três camadas independentes**, cada uma com responsabilidades bem definidas:

```
Frontend (React)
   ↓ REST API
Backend (Node.js / Express)
   ↓ HTTP + Redis Queue
Worker (Python + RQ)
   ↓
Scrapers (Mercado Livre, Magazine Luiza, Americanas, etc.)
```

### Princípios adotados

- Desacoplamento entre UI, API e scraping
- Processamento assíncrono via filas
- Jobs isolados por marketplace
- Banco de dados como fonte única da verdade

---

## 4. Frontend (React)

### 4.1 Responsabilidades

- Interface do usuário
- Coleta de inputs (termo de busca, marketplaces, quantidade)
- Exibição de execuções e produtos coletados
- Comunicação **exclusiva** com o Backend via API REST

⚠️ O frontend **não executa scraping**, **não acessa o banco de dados** e **não se comunica diretamente com o worker**.

---

### 4.2 Tela: Nova Coleta

Na tela **Nova Coleta**, o usuário informa:

- Termo de busca
- Marketplaces desejados
- Quantidade de produtos por marketplace (1 a 10)

#### Payload enviado ao backend

```json
{
  "search_term": "notebook",
  "marketplaces": [
    { "scraper_key": "mercado_livre", "max_items": 5 },
    { "scraper_key": "magazine_luiza", "max_items": 3 }
  ]
}
```

---

### 4.3 Carregamento de Marketplaces

Os marketplaces exibidos na interface **não são mockados** no frontend.

Eles são carregados dinamicamente através da API:

```
GET /api/marketplaces
```

Isso garante que a UI reflita exatamente os scrapers disponíveis e ativos no sistema.

---

## 5. Backend API (Node.js + Express)

### 5.1 Responsabilidades

- Autenticação de usuários (JWT)
- Validação de payloads
- Criação e persistência de jobs de scraping
- Comunicação com o worker Python
- Exposição de dados para o frontend

---

### 5.2 Principais Rotas

```
POST /api/auth/login
GET  /api/marketplaces
POST /api/marketplaces
POST /api/scrape
GET  /api/jobs
GET  /api/products
```

---

### 5.3 Fluxo de Criação de Jobs

1. O frontend envia uma requisição para `POST /api/scrape`
2. O backend valida o payload
3. Para cada marketplace, um **job independente** é criado no banco
4. O backend envia o job para o worker via Redis Queue

Fluxo resumido:

```
Backend
 → POST /enqueue/{job_id}
 → Redis Queue
 → tasks.run_scraper(job_id)
```

---

## 6. Worker (Python + RQ)

O worker é responsável por executar o scraping de forma assíncrona e desacoplada do backend.

---

### 6.0.1 API

O worker expõe uma **API HTTP em FastAPI** responsável por receber requisições do backend Node.js e **enfileirar jobs de scraping no Redis (RQ)**.

Essa API atua como uma camada intermediária entre o backend e o sistema de filas, garantindo desacoplamento e permitindo validações, versionamento e observabilidade.

**Responsabilidades da API do Worker:**

- Receber requisições HTTP do backend
- Validar o `job_id` recebido
- Publicar o job na fila Redis (RQ)
- Retornar confirmação de enfileiramento


### 6.1 JobRunner

O **JobRunner** é o orquestrador central do worker. Suas responsabilidades incluem:

- Buscar o job no banco de dados
- Atualizar o status para `running`
- Criar o scraper correto a partir do `scraper_key`
- Executar o scraping respeitando o limite de itens (`max_items`)
- Persistir os produtos coletados
- Atualizar o status final (`done` ou `failed`)

---

### 6.2 ScraperFactory

A criação dos scrapers é feita através de uma fábrica baseada em chave:

```python
scraper_factory = {
  "mercado_livre": MercadoLivreScraper,
  "magazine_luiza": MagazineLuizaScraper,
  "americanas": AmericanasScraper
}
```

⚠️ Caso o `scraper_key` não esteja registrado, o job é automaticamente marcado como `failed`.

---

## 7. Scrapers

Cada scraper:

- Herda de `BaseScraper`
- Implementa o método `scrape(max_items)`
- Retorna uma lista de produtos **normalizados**

### 7.1 Formato padrão de produto

```json
{
  "name": "Notebook Gamer",
  "price_value": 3499.90,
  "price_text": "R$ 3.499,90",
  "product_url": "https://...",
  "image_url": "https://..."
}
```

---

## 8. Banco de Dados (MySQL)

### 8.1 Tabela: marketplaces

| Campo        | Descrição              |
|-------------|------------------------|
| id          | Identificador          |
| name        | Nome exibido           |
| scraper_key | Chave técnica          |
| is_active   | Controle de ativação   |

---

### 8.2 Tabela: scrape_jobs

| Campo         | Descrição                         |
|--------------|-----------------------------------|
| id           | Identificador                     |
| user_id      | Usuário                           |
| marketplace_id | Marketplace                    |
| search_term  | Termo buscado                     |
| max_items    | Limite de produtos                |
| status       | queued / running / done / failed  |
| started_at   | Data de início                    |
| finished_at  | Data de finalização               |

---

### 8.3 Tabela: products

| Campo           | Descrição           |
|-----------------|---------------------|
| scrape_job_id   | Job relacionado     |
| marketplace_id  | Marketplace         |
| name            | Nome do produto     |
| price_value     | Valor numérico      |
| price_text      | Preço formatado     |
| product_url     | URL do produto      |
| image_url       | URL da imagem       |

---

## 9. Decisões Arquiteturais

- Jobs isolados por marketplace para maior controle e paralelismo
- Scrapers totalmente desacoplados do backend
- Worker independente e escalável
- Banco de dados como fonte única da verdade
- Frontend 100% dinâmico, baseado em dados da API


---

## 10. Considerações Finais

Essa arquitetura permite escalar scraping, adicionar novos marketplaces com baixo acoplamento e manter a aplicação organizada, previsível e fácil de evoluir.

