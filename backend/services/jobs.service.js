import { db } from "../db/connection.js";

export async function getJobs(userId) {

  const [rows] = await db.query(`
    SELECT
      sj.id,
      sj.search_term,
      sj.status,
      sj.error_message,
      sj.created_at,
      sj.started_at,
      sj.finished_at,
      m.name AS marketplace,
      COUNT(p.id) AS products_count
    FROM scrape_jobs sj
    JOIN marketplaces m ON m.id = sj.marketplace_id
    LEFT JOIN products p ON p.scrape_job_id = sj.id
    WHERE sj.user_id = ?
    GROUP BY sj.id
    ORDER BY sj.created_at DESC
  `, [userId]);

  return rows;
}
