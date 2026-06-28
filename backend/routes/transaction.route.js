import express from "express";
import {
	getAllTransactions,
	getMyTransactions,
	getMyOrders,
	getAllOrders,
} from "../controllers/transaction.controller.js";
import { adminRoute, protectRoute, studentRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/mine", protectRoute, studentRoute, getMyTransactions);
router.get("/orders/mine", protectRoute, studentRoute, getMyOrders);
router.get("/", protectRoute, adminRoute, getAllTransactions);
router.get("/orders", protectRoute, adminRoute, getAllOrders);

export default router;
