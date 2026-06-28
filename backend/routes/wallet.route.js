import express from "express";
import {
	getMyWallet,
	getStudentWallet,
	listStudentWallets,
	topUp,
	deduct,
	setBalance,
	getStudentOrders,
} from "../controllers/wallet.controller.js";
import { adminRoute, protectRoute, studentRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", protectRoute, studentRoute, getMyWallet);
router.get("/students", protectRoute, adminRoute, listStudentWallets);
router.get("/:userId", protectRoute, adminRoute, getStudentWallet);
router.get("/:userId/orders", protectRoute, adminRoute, getStudentOrders);
router.post("/:userId/topup", protectRoute, adminRoute, topUp);
router.post("/:userId/deduct", protectRoute, adminRoute, deduct);
router.put("/:userId/balance", protectRoute, adminRoute, setBalance);

export default router;
