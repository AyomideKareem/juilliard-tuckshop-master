import fs from "fs";
import path from "path";
import { cacheGet, cacheSet, cacheDel } from "../lib/cache.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
	try {
		const products = await Product.find({});
		res.json({ products });
	} catch (error) {
		console.log("Error in getAllProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getFeaturedProducts = async (req, res) => {
	try {
		const cached = cacheGet("featured_products");
		if (cached) {
			return res.json(cached);
		}

		const featuredProducts = await Product.find({ isFeatured: true }).lean();
		cacheSet("featured_products", featuredProducts, 300);
		res.json(featuredProducts);
	} catch (error) {
		console.log("Error in getFeaturedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const createProduct = async (req, res) => {
	try {
		const { name, description, price, category, stock, lowStockThreshold } = req.body;

		if (!req.file) {
			return res.status(400).json({ message: "Product image is required" });
		}

		const imagePath = `/uploads/products/${req.file.filename}`;

		const product = await Product.create({
			name,
			description,
			price: Number(price),
			image: imagePath,
			category,
			stock: stock !== undefined ? Number(stock) : 0,
			lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 5,
		});

		cacheDel("featured_products");
		res.status(201).json(product);
	} catch (error) {
		console.log("Error in createProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		const { name, description, price, category, stock, lowStockThreshold } = req.body;

		if (name) product.name = name;
		if (description) product.description = description;
		if (price !== undefined) product.price = Number(price);
		if (category) product.category = category;
		if (stock !== undefined) product.stock = Number(stock);
		if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);

		if (req.file) {
			if (product.image) {
				const oldPath = path.join(process.cwd(), product.image.replace(/^\//, ""));
				if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
			}
			product.image = `/uploads/products/${req.file.filename}`;
		}

		const updated = await product.save();
		cacheDel("featured_products");
		res.json(updated);
	} catch (error) {
		console.log("Error in updateProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const deleteProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		if (product.image) {
			const filePath = path.join(process.cwd(), product.image.replace(/^\//, ""));
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		}

		await Product.findByIdAndDelete(req.params.id);
		cacheDel("featured_products");

		res.json({ message: "Product deleted successfully" });
	} catch (error) {
		console.log("Error in deleteProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getRecommendedProducts = async (req, res) => {
	try {
		const products = await Product.aggregate([
			{ $match: { stock: { $gt: 0 } } },
			{ $sample: { size: 4 } },
			{
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					image: 1,
					price: 1,
					stock: 1,
				},
			},
		]);

		res.json(products);
	} catch (error) {
		console.log("Error in getRecommendedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		const products = await Product.find({ category });
		res.json({ products });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const toggleFeaturedProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		product.isFeatured = !product.isFeatured;
		const updatedProduct = await product.save();
		cacheDel("featured_products");
		res.json(updatedProduct);
	} catch (error) {
		console.log("Error in toggleFeaturedProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
