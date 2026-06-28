import express from "express";
import { getStudentByCard } from "../controllers/admin.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/students/:card", protectRoute, adminRoute, getStudentByCard);

export default router;
