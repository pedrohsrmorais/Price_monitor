import { db } from "../db/connection.js";

export async function listMarketplaces(req, res) {

  const [rows] = await db.query(
    "SELECT id, name, base_url, scraper_key FROM marketplaces WHERE is_active = 1"
  );

  res.json(rows);
}

export async function createMarketplace(req, res) {
  const { name, base_url, scraper_key } = req.body;

  if (!name || !base_url || !scraper_key) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  await db.query(
    `INSERT INTO marketplaces (name, base_url, scraper_key)
     VALUES (?, ?, ?)`,
    [name, base_url, scraper_key]
  );

  res.status(201).json({ message: "Marketplace cadastrado" });
}
