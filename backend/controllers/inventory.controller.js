import Product from "../models/product.model.js";

export const getInventory = async (req, res) => {
	try {
		const products = await Product.find({}).sort({ stock: 1 });
		res.json({ success: true, products });
	} catch (error) {
		console.error("Error fetching inventory:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getLowStockAlerts = async (req, res) => {
	try {
		const products = await Product.find({
			$expr: { $lte: ["$stock", "$lowStockThreshold"] },
		}).sort({ stock: 1 });

		res.json({ success: true, products, count: products.length });
	} catch (error) {
		console.error("Error fetching low stock:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateStock = async (req, res) => {
	try {
		const { stock, lowStockThreshold } = req.body;
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		if (stock !== undefined) product.stock = Number(stock);
		if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);

		await product.save();
		res.json({ success: true, product });
	} catch (error) {
		console.error("Error updating stock:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const restockProduct = async (req, res) => {
	try {
		const { quantity } = req.body;
		if (!quantity || quantity <= 0) {
			return res.status(400).json({ message: "Valid quantity is required" });
		}

		const product = await Product.findById(req.params.id);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		product.stock += Number(quantity);
		await product.save();

		res.json({ success: true, product });
	} catch (error) {
		console.error("Error restocking:", error);
		res.status(500).json({ message: "Server error" });
	}
};
