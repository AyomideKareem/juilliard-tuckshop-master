import Transaction from "../models/transaction.model.js";
import Order from "../models/order.model.js";

export const getMyTransactions = async (req, res) => {
	try {
		const transactions = await Transaction.find({ user: req.user._id })
			.sort({ createdAt: -1 })
			.populate("order")
			.limit(50);

		res.json({ success: true, transactions });
	} catch (error) {
		console.error("Error fetching transactions:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getAllTransactions = async (req, res) => {
	try {
		const transactions = await Transaction.find({})
			.sort({ createdAt: -1 })
			.populate("user", "name email card NFCunits")
			.populate("order")
			.limit(100);

		res.json({ success: true, transactions });
	} catch (error) {
		console.error("Error fetching all transactions:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const verifyTransaction = async (req, res) => {
	try {
		const transaction = await Transaction.findById(req.params.id);
		if (!transaction) {
			return res.status(404).json({ message: "Transaction not found" });
		}

		transaction.status = "verified";
		transaction.verifiedBy = req.user._id;
		await transaction.save();

		if (transaction.order) {
			await Order.findByIdAndUpdate(transaction.order, {
				status: "verified",
				verifiedBy: req.user._id,
			});
		}

		res.json({ success: true, transaction });
	} catch (error) {
		console.error("Error verifying transaction:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getMyOrders = async (req, res) => {
	try {
		const orders = await Order.find({ user: req.user._id })
			.sort({ createdAt: -1 })
			.populate("products.product")
			.limit(50);

		res.json({ success: true, orders });
	} catch (error) {
		console.error("Error fetching orders:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getAllOrders = async (req, res) => {
	try {
		const orders = await Order.find({})
			.sort({ createdAt: -1 })
			.populate("user", "name email card")
			.populate("products.product")
			.limit(100);

		res.json({ success: true, orders });
	} catch (error) {
		console.error("Error fetching orders:", error);
		res.status(500).json({ message: "Server error" });
	}
};
