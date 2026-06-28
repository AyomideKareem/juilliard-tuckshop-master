import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { isAdminLevel, isStudent, isSuperAdmin } from "../lib/roles.js";

export const protectRoute = async (req, res, next) => {
	try {
		const accessToken = req.cookies.accessToken;

		if (!accessToken) {
			return res.status(401).json({ message: "Unauthorized - No access token provided" });
		}

		try {
			const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
			const user = await User.findById(decoded.userId).select("-password");

			if (!user) {
				return res.status(401).json({ message: "User not found" });
			}

			if (!user.isActive) {
				return res.status(403).json({ message: "Account is disabled. Contact your administrator." });
			}

			req.user = user;
			next();
		} catch (error) {
			if (error.name === "TokenExpiredError") {
				return res.status(401).json({ message: "Unauthorized - Access token expired" });
			}
			throw error;
		}
	} catch (error) {
		console.log("Error in protectRoute middleware", error.message);
		return res.status(401).json({ message: "Unauthorized - Invalid access token" });
	}
};

export const adminRoute = (req, res, next) => {
	if (req.user && isAdminLevel(req.user.role)) {
		next();
	} else {
		return res.status(403).json({ message: "Access denied - Admin only" });
	}
};

export const superAdminRoute = (req, res, next) => {
	if (req.user && isSuperAdmin(req.user.role)) {
		next();
	} else {
		return res.status(403).json({ message: "Access denied - Super Admin only" });
	}
};

export const studentRoute = (req, res, next) => {
	if (req.user && isStudent(req.user.role)) {
		next();
	} else {
		return res.status(403).json({ message: "Access denied - Students only" });
	}
};
