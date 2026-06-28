import mongoose from "mongoose";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import { ROLES } from "../lib/roles.js";

export class WalletError extends Error {
	constructor(message, statusCode = 400) {
		super(message);
		this.name = "WalletError";
		this.statusCode = statusCode;
	}
}

export const isTransactionUnsupportedError = (error) =>
	error?.message?.includes("Transaction numbers are only allowed on a replica set member or mongos");

const assertStudent = (user) => {
	if (!user) throw new WalletError("User not found", 404);
	if (user.role !== ROLES.STUDENT) throw new WalletError("Wallet operations apply to students only");
	if (!user.isActive) throw new WalletError("Account is disabled", 403);
};

export const getWalletBalance = async (userId, session = null) => {
	const query = User.findById(userId).select("NFCunits role isActive name email card");
	if (session) query.session(session);
	const user = await query;
	assertStudent(user);
	return user.NFCunits;
};

export const applyWalletChange = async ({
	userId,
	delta,
	type,
	description,
	performedBy = null,
	orderId = null,
	nfcCard = null,
	session = null,
}) => {
	if (typeof delta !== "number" || Number.isNaN(delta) || delta === 0) {
		throw new WalletError("Invalid wallet adjustment amount");
	}

	const run = async (sess) => {
		const query = User.findById(userId);
		if (sess) query.session(sess);
		const user = await query;
		assertStudent(user);

		const balanceBefore = user.NFCunits;
		const balanceAfter = Math.round((balanceBefore + delta) * 100) / 100;

		if (balanceAfter < 0) {
			throw new WalletError("Insufficient wallet balance", 400);
		}

		user.NFCunits = balanceAfter;
		await user.save(sess ? { session: sess } : undefined);

		const transactionPayload = {
			user: userId,
			order: orderId,
			type,
			amount: Math.abs(delta),
			balanceBefore,
			balanceAfter,
			nfcCard,
			description,
			performedBy,
			status: "completed",
		};

		const [transaction] = sess
			? await Transaction.create([transactionPayload], { session: sess })
			: [await Transaction.create(transactionPayload)];

		return { user, transaction, balanceBefore, balanceAfter };
	};

	if (session) return run(session);

	const ownSession = await mongoose.startSession();
	try {
		let result;
		await ownSession.withTransaction(async () => {
			result = await run(ownSession);
		});
		return result;
	} catch (error) {
		if (isTransactionUnsupportedError(error)) {
			return run(null);
		}
		throw error;
	} finally {
		ownSession.endSession();
	}
};

export const topUpWallet = async ({ userId, amount, description, performedBy }) => {
	if (!amount || amount <= 0) throw new WalletError("Top-up amount must be positive");
	return applyWalletChange({
		userId,
		delta: amount,
		type: "topup",
		description: description || "Wallet top-up",
		performedBy,
	});
};

export const deductWallet = async ({ userId, amount, description, performedBy }) => {
	if (!amount || amount <= 0) throw new WalletError("Deduction amount must be positive");
	return applyWalletChange({
		userId,
		delta: -amount,
		type: "deduction",
		description: description || "Wallet deduction",
		performedBy,
	});
};

export const setWalletBalance = async ({ userId, newBalance, description, performedBy }) => {
	if (newBalance < 0) throw new WalletError("Balance cannot be negative");

	const user = await User.findById(userId);
	assertStudent(user);

	const delta = newBalance - user.NFCunits;
	if (delta === 0) {
		return { user, transaction: null, balanceBefore: user.NFCunits, balanceAfter: user.NFCunits };
	}

	return applyWalletChange({
		userId,
		delta,
		type: "adjustment",
		description: description || "Balance adjustment",
		performedBy,
	});
};

export const processPurchase = async ({
	userId,
	amount,
	orderId,
	nfcCard,
	description,
	session,
}) => {
	if (!amount || amount <= 0) throw new WalletError("Invalid purchase amount");

	return applyWalletChange({
		userId,
		delta: -amount,
		type: "purchase",
		description: description || "Purchase",
		orderId,
		nfcCard,
		session,
	});
};
