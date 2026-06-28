import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import fs from "fs";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import nfcPaymentRoutes from "./routes/nfcPayment.route.js";
import adminRoutes from "./routes/admin.route.js";
import transactionRoutes from "./routes/transaction.route.js";
import inventoryRoutes from "./routes/inventory.route.js";
import walletRoutes from "./routes/wallet.route.js";
import userManagementRoutes from "./routes/userManagement.route.js";

import { connectDB } from "./lib/db.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const __dirname = path.resolve();

const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
	fs.mkdirSync(uploadsPath, { recursive: true });
}

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
	.split(",")
	.map((o) => o.trim());

app.use(express.json({ limit: "2mb" }));
app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else if (process.env.ALLOW_LAN === "true") {
				const isLan =
					/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(
						origin
					);
				callback(null, isLan);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
	})
);
app.use(cookieParser());

app.use("/uploads", express.static(uploadsPath));

app.get("/api/health", (_req, res) => {
	res.json({
		status: "ok",
		mode: "offline-local",
		timestamp: new Date().toISOString(),
	});
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/nfc", nfcPaymentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/users", userManagementRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
			return notFoundHandler(req, res);
		}
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.use(notFoundHandler);
app.use(errorHandler);

connectDB()
	.then(() => {
		app.listen(PORT, HOST, () => {
			console.log(`Tuckshop server running at http://${HOST}:${PORT}`);
			console.log(`LAN access: http://<server-ip>:${PORT}`);
			// console.log(`Mode: offline-first local network`);
		});
	})
	.catch((err) => {
		console.error("Failed to connect to DB:", err);
		process.exit(1);
	});
