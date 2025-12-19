import { Router } from "express";
import { startScraping } from "../controllers/scrapper.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/scrape", authMiddleware, startScraping);

export default router;
