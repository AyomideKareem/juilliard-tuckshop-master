import express from "express";
import { checkoutWithNFC } from "../controllers/nfcPayment.controller.js";
import { protectRoute, studentRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/checkout", protectRoute, studentRoute, checkoutWithNFC);

export default router;
