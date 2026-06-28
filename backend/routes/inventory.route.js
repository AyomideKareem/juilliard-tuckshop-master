import express from "express";
import {
	getInventory,
	getLowStockAlerts,
	updateStock,
	restockProduct,
} from "../controllers/inventory.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getInventory);
router.get("/alerts", protectRoute, adminRoute, getLowStockAlerts);
router.patch("/:id", protectRoute, adminRoute, updateStock);
router.post("/:id/restock", protectRoute, adminRoute, restockProduct);

export default router;
