import mongoose from "mongoose";

export const connectDB = async () => {
	const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/tuckshop";

	try {
		await mongoose.connect(uri);
		console.log(`MongoDB connected: ${uri.replace(/\/\/.*@/, "//***@")}`);
	} catch (error) {
		console.error("MongoDB connection error:", error.message);
		throw error;
	}
};
