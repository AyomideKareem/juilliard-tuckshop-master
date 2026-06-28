import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		order: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
		},
		type: {
			type: String,
			enum: ["purchase", "topup", "deduction", "refund", "adjustment"],
			required: true,
		},
		amount: {
			type: Number,
			required: true,
			min: 0,
		},
		balanceBefore: {
			type: Number,
			required: true,
			min: 0,
		},
		balanceAfter: {
			type: Number,
			required: true,
			min: 0,
		},
		nfcCard: {
			type: String,
		},
		description: {
			type: String,
			default: "",
		},
		performedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		status: {
			type: String,
			enum: ["completed", "pending", "failed"],
			default: "completed",
		},
	},
	{ timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
