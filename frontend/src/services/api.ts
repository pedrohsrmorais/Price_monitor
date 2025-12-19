const API_BASE_URL = "https://scrapper.prometio.com.br/api";

/* =========================
   Types
========================= */
export interface SelectedMarketplace {
  scraper_key: string;
  max_items: number;
}

/* =========================
   Helpers
========================= */
function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    let message = "Erro na requisição";

    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      // ignore
    }

    throw new Error(message);
  }

  return response.json();
}

function buildQuery(params?: Record<string, string>) {
  if (!params) return "";
  const query = new URLSearchParams(params).toString();
  return query ? `?${query}` : "";
}

/* =========================
   API
========================= */
export const api = {
  /* =========================
     Auth
  ========================= */
  login(email: string, password: string) {
    return fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    }).then(handleResponse);
  },

  /* =========================
     Scraping
  ========================= */
  startScraping(
    searchTerm: string,
    marketplaces: SelectedMarketplace[]
  ) {
    return fetch(`${API_BASE_URL}/scrape`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        search_term: searchTerm,
        marketplaces,
      }),
    }).then(handleResponse);
  },

  /* =========================
     Products
  ========================= */
  getProducts(params?: {
    execution?: string;
    search_term?: string;
    site?: string;
  }) {
    const query = buildQuery(params as Record<string, string>);

    return fetch(`${API_BASE_URL}/products${query}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse);
  },

  /* =========================
     Jobs / Executions
  ========================= */
  getJobs() {
    return fetch(`${API_BASE_URL}/jobs`, {
      headers: getAuthHeaders(),
    }).then(handleResponse);
  },

  /* =========================
     Marketplaces
  ========================= */
  getMarketplaces() {
    return fetch(`${API_BASE_URL}/marketplaces`, {
      headers: getAuthHeaders(),
    }).then(handleResponse);
  },
};
