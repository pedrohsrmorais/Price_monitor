import { Router } from "express";
import { listProducts } from "../controllers/products.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/products", authMiddleware, listProducts);

export default router;
