import express from "express";
import {
	listUsers,
	createUser,
	updateUser,
	toggleUserActive,
	resetUserPassword,
	deleteUser,
} from "../controllers/userManagement.controller.js";
import { protectRoute, superAdminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, superAdminRoute, listUsers);
router.post("/", protectRoute, superAdminRoute, createUser);
router.put("/:id", protectRoute, superAdminRoute, updateUser);
router.patch("/:id/toggle-active", protectRoute, superAdminRoute, toggleUserActive);
router.post("/:id/reset-password", protectRoute, superAdminRoute, resetUserPassword);
router.delete("/:id", protectRoute, superAdminRoute, deleteUser);

export default router;
