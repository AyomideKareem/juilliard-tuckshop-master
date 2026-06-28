import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import Order from "../models/order.model.js";
import { ROLES } from "../lib/roles.js";
import {
	topUpWallet,
	deductWallet,
	setWalletBalance,
	getWalletBalance,
	WalletError,
} from "../services/wallet.service.js";
import { logAudit } from "../services/audit.service.js";

export const getMyWallet = async (req, res) => {
	try {
		const balance = await getWalletBalance(req.user._id);
		const transactions = await Transaction.find({ user: req.user._id })
			.sort({ createdAt: -1 })
			.limit(50);

		res.json({
			success: true,
			wallet: {
				balance,
				card: req.user.card,
				name: req.user.name,
			},
			transactions,
		});
	} catch (error) {
		const status = error instanceof WalletError ? error.statusCode : 500;
		res.status(status).json({ message: error.message });
	}
};

export const getStudentWallet = async (req, res) => {
	try {
		const student = await User.findById(req.params.userId).select("-password");
		if (!student || student.role !== ROLES.STUDENT) {
			return res.status(404).json({ message: "Student not found" });
		}

		const transactions = await Transaction.find({ user: student._id })
			.sort({ createdAt: -1 })
			.limit(50)
			.populate("performedBy", "name email role");

		res.json({
			success: true,
			wallet: {
				balance: student.NFCunits,
				student: {
					_id: student._id,
					name: student.name,
					email: student.email,
					card: student.card,
					isActive: student.isActive,
				},
			},
			transactions,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const listStudentWallets = async (req, res) => {
	try {
		const { search } = req.query;
		const filter = { role: ROLES.STUDENT };

		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
				{ card: { $regex: search, $options: "i" } },
			];
		}

		const students = await User.find(filter)
			.select("name email card NFCunits isActive createdAt")
			.sort({ name: 1 });

		res.json({ success: true, students });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const topUp = async (req, res) => {
	try {
		const { amount, reason } = req.body;
		const result = await topUpWallet({
			userId: req.params.userId,
			amount: Number(amount),
			description: reason || "Admin top-up",
			performedBy: req.user._id,
		});

		await logAudit({
			action: "WALLET_TOPUP",
			performedBy: req.user._id,
			targetUser: req.params.userId,
			details: { amount: Number(amount), reason },
			ipAddress: req.ip,
		});

		res.json({
			success: true,
			message: "Wallet topped up",
			balance: result.balanceAfter,
			transaction: result.transaction,
		});
	} catch (error) {
		const status = error instanceof WalletError ? error.statusCode : 500;
		res.status(status).json({ message: error.message });
	}
};

export const deduct = async (req, res) => {
	try {
		const { amount, reason } = req.body;
		const result = await deductWallet({
			userId: req.params.userId,
			amount: Number(amount),
			description: reason || "Admin deduction",
			performedBy: req.user._id,
		});

		await logAudit({
			action: "WALLET_DEDUCTION",
			performedBy: req.user._id,
			targetUser: req.params.userId,
			details: { amount: Number(amount), reason },
			ipAddress: req.ip,
		});

		res.json({
			success: true,
			message: "Amount deducted",
			balance: result.balanceAfter,
			transaction: result.transaction,
		});
	} catch (error) {
		const status = error instanceof WalletError ? error.statusCode : 500;
		res.status(status).json({ message: error.message });
	}
};

export const setBalance = async (req, res) => {
	try {
		const { balance, reason } = req.body;
		const result = await setWalletBalance({
			userId: req.params.userId,
			newBalance: Number(balance),
			description: reason || "Balance set by admin",
			performedBy: req.user._id,
		});

		await logAudit({
			action: "WALLET_ADJUSTMENT",
			performedBy: req.user._id,
			targetUser: req.params.userId,
			details: { balance: Number(balance), reason },
			ipAddress: req.ip,
		});

		res.json({
			success: true,
			message: "Balance updated",
			balance: result.balanceAfter,
			transaction: result.transaction,
		});
	} catch (error) {
		const status = error instanceof WalletError ? error.statusCode : 500;
		res.status(status).json({ message: error.message });
	}
};

export const getStudentOrders = async (req, res) => {
	try {
		const orders = await Order.find({ user: req.params.userId })
			.sort({ createdAt: -1 })
			.populate("products.product")
			.limit(50);

		res.json({ success: true, orders });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
