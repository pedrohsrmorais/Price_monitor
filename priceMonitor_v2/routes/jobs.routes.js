import { Router } from "express";
import { listJobs } from "../controllers/jobs.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/jobs", authMiddleware, listJobs);

export default router;
