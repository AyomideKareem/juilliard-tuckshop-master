import express from "express";
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from "../controllers/cart.controller.js";
import { protectRoute, studentRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, studentRoute, getCartProducts);
router.post("/", protectRoute, studentRoute, addToCart);
router.delete("/", protectRoute, studentRoute, removeAllFromCart);
router.put("/:id", protectRoute, studentRoute, updateQuantity);

export default router;
