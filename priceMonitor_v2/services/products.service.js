import { db } from "../db/connection.js";

export async function getProducts(filters) {
  let sql = `
    SELECT
      p.id,
      p.name,
      p.price_value,
      p.price_text,
      p.product_url,
      p.image_url,
      p.scraped_at,
      m.name AS marketplace,
      sj.search_term,
      sj.id AS job_id
    FROM products p
    JOIN marketplaces m ON m.id = p.marketplace_id
    JOIN scrape_jobs sj ON sj.id = p.scrape_job_id
    WHERE 1 = 1
  `;

  const params = [];

  if (filters.executionId) {
    sql += " AND p.scrape_job_id = ?";
    params.push(filters.executionId);
  }

  if (filters.searchTerm) {
    sql += " AND sj.search_term LIKE ?";
    params.push(`%${filters.searchTerm}%`);
  }

  if (filters.site) {
    sql += " AND m.slug = ?";
    params.push(filters.site);
  }

  sql += " ORDER BY p.scraped_at DESC";

  const [rows] = await db.query(sql, params);
  return rows;
}
