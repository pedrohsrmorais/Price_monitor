import { getProducts } from "../services/products.service.js";

export async function listProducts(req, res) {

  
  const filters = {
    executionId: req.query.execution,
    searchTerm: req.query.search_term,
    site: req.query.site
  };

  const products = await getProducts(filters);

  res.json(products);
}
