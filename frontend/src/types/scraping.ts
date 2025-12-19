export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ScrapingExecution {
  id: string;
  searchTerm: string;
  site: string;
  status: ExecutionStatus;
  createdAt: Date;
  completedAt?: Date;
  productsCount?: number;
}

export type Product = {
  id: number;
  name: string;
  price_value: number | null;
  price_text: string | null;
  product_url: string;
  image_url: string | null;
  scraped_at: string;
  marketplace: string;
  job_id: number;
};

export const SUPPORTED_SITES = [
  { id: 'todos', name: 'Todos', icon: '🛒' },
  { id: 'mercadolivre', name: 'Mercado Livre', icon: '📦' },
  { id: 'magazineluiza', name: 'Magazine Luiza', icon: '🏪' },
  { id: 'americanas', name: 'Americanas', icon: '🏬' },
] as const;

export type SupportedSite = typeof SUPPORTED_SITES[number]['id'];

export interface Marketplace {
  id: number;
  name: string;
  scraper_key: string;
  is_active: number;
}

