import axios from "axios";
import { db } from "../db/connection.js";

const PY_WORKER_URL = process.env.PY_WORKER_URL;
const WORKER_API_KEY = process.env.WORKER_API_KEY;

/**
 * Cria scrape_jobs no banco e solicita enfileiramento ao worker Python.
 *
 * marketplaces: Array<{ scraper_key: string, max_items: number }>
 */
export async function createScrapeJobs(userId, searchTerm, marketplaces) {
  if (!Array.isArray(marketplaces) || marketplaces.length === 0) {
    throw new Error("marketplaces é obrigatório e deve conter ao menos 1 item");
  }

  const jobIds = [];

  for (const mp of marketplaces) {
    const scraperKey = mp?.scraper_key;
    const maxItemsRaw = mp?.max_items;

    if (!scraperKey) {
      // ignora entrada inválida
      continue;
    }

    const safeMaxItems = Math.min(Math.max(Number(maxItemsRaw) || 10, 1), 10);

    // Resolve marketplace_id pelo scraper_key (apenas ativos)
    const [rows] = await db.query(
      `
      SELECT id
      FROM marketplaces
      WHERE scraper_key = ? AND is_active = 1
      LIMIT 1
      `,
      [scraperKey]
    );

    if (!rows || rows.length === 0) {
      // marketplace não existe ou está inativo -> ignora
      continue;
    }

    const marketplaceId = rows[0].id;

    // Cria o job no banco
    const [result] = await db.query(
      `
      INSERT INTO scrape_jobs
        (user_id, marketplace_id, search_term, max_items)
      VALUES (?, ?, ?, ?)
      `,
      [userId, marketplaceId, searchTerm, safeMaxItems]
    );

    const jobId = result.insertId;
    jobIds.push(jobId);

    // Solicita enqueue ao worker Python
    await axios.post(
      `${PY_WORKER_URL}/enqueue/${jobId}`,
      {},
      {
        timeout: 5000,
        headers: WORKER_API_KEY ? { "x-api-key": WORKER_API_KEY } : {},
      }
    );
  }

  if (jobIds.length === 0) {
    throw new Error(
      "Nenhum job foi criado. Verifique se os marketplaces selecionados estão ativos e com scraper_key válido."
    );
  }

  return jobIds;
}
