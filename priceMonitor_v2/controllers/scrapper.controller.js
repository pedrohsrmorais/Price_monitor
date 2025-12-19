import { createScrapeJobs } from "../services/scrapper.service.js";

export async function startScraping(req, res) {
  const { search_term, marketplaces } = req.body;

  if (!search_term) {
    return res.status(400).json({
      error: "search_term é obrigatório"
    });
  }

  if (!Array.isArray(marketplaces) || marketplaces.length === 0) {
    return res.status(400).json({
      error: "marketplaces é obrigatório e deve conter ao menos 1 item"
    });
  }

  const jobIds = await createScrapeJobs(
    req.user.id,
    search_term,
    marketplaces
  );

  res.status(202).json({
    message: "Scraping iniciado",
    jobs: jobIds
  });
}
