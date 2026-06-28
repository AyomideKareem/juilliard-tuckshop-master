export const notFoundHandler = (req, res) => {
	res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, _next) => {
	console.error("Error:", err.message);

	if (err.name === "ValidationError") {
		return res.status(400).json({ message: err.message });
	}

	if (err.code === 11000) {
		return res.status(400).json({ message: "Duplicate field value entered" });
	}

	if (err.name === "MulterError") {
		return res.status(400).json({ message: err.message });
	}

	res.status(err.statusCode || 500).json({
		message: err.message || "Internal server error",
	});
};
