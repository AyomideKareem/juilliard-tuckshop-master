import mongoose from "mongoose";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import { ROLES } from "../lib/roles.js";
import {
	isTransactionUnsupportedError,
	processPurchase,
	WalletError,
} from "../services/wallet.service.js";

export const checkoutWithNFC = async (req, res) => {
	const session = await mongoose.startSession();

	try {
		const card = String(req.body.card || "").trim();

		if (!card) {
			return res.status(400).json({ success: false, message: "NFC card is required" });
		}

		let result;

		const runCheckout = async (activeSession = null) => {
			const userQuery = User.findById(req.user._id);
			if (activeSession) userQuery.session(activeSession);
			const user = await userQuery;
			if (!user || user.role !== ROLES.STUDENT) {
				throw new WalletError("Only students can checkout", 403);
			}
			if (!user.isActive) {
				throw new WalletError("Account is disabled", 403);
			}
			if (!user.cartItems.length) {
				throw new WalletError("Cart is empty", 400);
			}

			if (user.card !== card) {
				throw new WalletError("Card does not match logged-in account", 403);
			}

			const productIds = user.cartItems.map((item) => item.product);
			const productsQuery = Product.find({ _id: { $in: productIds } });
			if (activeSession) productsQuery.session(activeSession);
			const products = await productsQuery;

			let totalAmount = 0;
			const orderItems = [];

			for (const cartItem of user.cartItems) {
				const product = products.find(
					(p) => p._id.toString() === cartItem.product.toString()
				);
				if (!product) {
					throw new WalletError("A product in your cart no longer exists", 400);
				}
				if (product.stock < cartItem.quantity) {
					throw new WalletError(
						`Insufficient stock for ${product.name}. Available: ${product.stock}`,
						400
					);
				}
				totalAmount += product.price * cartItem.quantity;
				orderItems.push({
					product: product._id,
					quantity: cartItem.quantity,
					price: product.price,
				});
			}

			totalAmount = Math.round(totalAmount * 100) / 100;

			if (user.NFCunits < totalAmount) {
				throw new WalletError("Insufficient balance", 400);
			}

			for (const cartItem of user.cartItems) {
				const updated = await Product.findOneAndUpdate(
					{
						_id: cartItem.product,
						stock: { $gte: cartItem.quantity },
					},
					{ $inc: { stock: -cartItem.quantity } },
					activeSession ? { session: activeSession, new: true } : { new: true }
				);
				if (!updated) {
					throw new WalletError("Stock changed during checkout. Please try again.", 409);
				}
			}

			const orderPayload = {
				user: user._id,
				products: orderItems,
				totalAmount,
				paymentMethod: "nfc",
				status: "completed",
				nfcCard: card,
			};

			const [order] = activeSession
				? await Order.create([orderPayload], { session: activeSession })
				: [await Order.create(orderPayload)];

			const walletResult = await processPurchase({
				userId: user._id,
				amount: totalAmount,
				orderId: order._id,
				nfcCard: card,
				description: `Purchase of ${orderItems.length} item(s)`,
				session: activeSession,
			});

			user.cartItems = [];
			await user.save(activeSession ? { session: activeSession } : undefined);

			result = {
				orderId: order._id,
				totalAmount,
				newBalance: walletResult.balanceAfter,
				transaction: walletResult.transaction,
			};
		};

		try {
			await session.withTransaction(() => runCheckout(session));
		} catch (error) {
			if (!isTransactionUnsupportedError(error)) throw error;
			await runCheckout();
		}

		res.status(200).json({
			success: true,
			message: "Payment successful",
			...result,
		});
	} catch (error) {
		console.error("NFC checkout error:", error);
		const status = error instanceof WalletError ? error.statusCode : 500;
		res.status(status).json({
			success: false,
			message: error.message || "Server error",
			balance: error.balance,
		});
	} finally {
		session.endSession();
	}
};
