import { Router } from "express";
import {
  listMarketplaces,
  createMarketplace
} from "../controllers/marketplace.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/marketplaces", authMiddleware, listMarketplaces);
router.post("/marketplaces", authMiddleware, createMarketplace);

export default router;
