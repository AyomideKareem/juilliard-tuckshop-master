import express from "express";
import {
	loginStudent,
	loginAdmin,
	loginAdminWithCard,
	logout,
	refreshToken,
	getProfile,
	changePassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", loginStudent);
router.post("/login/admin", loginAdmin);
router.post("/login/admin/card", loginAdminWithCard);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.post("/change-password", protectRoute, changePassword);

export default router;
