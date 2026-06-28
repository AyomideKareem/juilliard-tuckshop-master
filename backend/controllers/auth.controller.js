import crypto from "crypto";
import RefreshToken from "../models/refreshToken.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { isAdminLevel, isStudent, ROLES } from "../lib/roles.js";

const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	await RefreshToken.findOneAndUpdate(
		{ userId },
		{ token: refreshToken, expiresAt },
		{ upsert: true, new: true }
	);
};

const setCookies = (res, accessToken, refreshToken) => {
	const isProduction = process.env.NODE_ENV === "production";
	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: isProduction,
		sameSite: "lax",
		maxAge: 15 * 60 * 1000,
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: isProduction,
		sameSite: "lax",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});
};

export const formatUser = (user) => ({
	_id: user._id,
	card: user.card,
	name: user.name,
	email: user.email,
	role: user.role,
	NFCunits: user.NFCunits,
	isActive: user.isActive,
	mustChangePassword: user.mustChangePassword,
});

const issueSession = async (res, user) => {
	const { accessToken, refreshToken } = generateTokens(user._id);
	await storeRefreshToken(user._id, refreshToken);
	setCookies(res, accessToken, refreshToken);
	return formatUser(user);
};

export const loginStudent = async (req, res) => {
	try {
		const card = String(req.body.card || "").trim();
		if (!card) {
			return res.status(400).json({ message: "NFC card ID is required" });
		}

		const user = await User.findOne({ card, role: ROLES.STUDENT });
		if (!user) {
			return res.status(400).json({ message: "Invalid NFC card" });
		}

		if (!user.isActive) {
			return res.status(403).json({ message: "Account is disabled. Contact your school administrator." });
		}

		const payload = await issueSession(res, user);
		res.json(payload);
	} catch (error) {
		console.log("Error in loginStudent controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const loginAdmin = async (req, res) => {
	try {
		const email = String(req.body.email || "").trim().toLowerCase();
		const { password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: "Email and password are required" });
		}

		const user = await User.findOne({
			email,
			role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
		});

		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		if (!user.isActive) {
			return res.status(403).json({ message: "Account is disabled" });
		}

		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const payload = await issueSession(res, user);
		res.json(payload);
	} catch (error) {
		console.log("Error in loginAdmin controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const loginAdminWithCard = async (req, res) => {
	try {
		const card = String(req.body.card || "").trim();
		if (!card) {
			return res.status(400).json({ message: "NFC card ID is required" });
		}

		const user = await User.findOne({
			card,
			role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
		});

		if (!user) {
			return res.status(401).json({ message: "Invalid admin NFC card" });
		}

		if (!user.isActive) {
			return res.status(403).json({ message: "Account is disabled" });
		}

		const payload = await issueSession(res, user);
		res.json(payload);
	} catch (error) {
		console.log("Error in loginAdminWithCard controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken) {
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			await RefreshToken.deleteOne({ userId: decoded.userId });
		}

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		const stored = await RefreshToken.findOne({ userId: decoded.userId });

		if (!stored || stored.token !== refreshToken) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}

		const user = await User.findById(decoded.userId);
		if (!user || !user.isActive) {
			return res.status(403).json({ message: "Account is disabled" });
		}

		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: "15m",
		});

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Token refreshed successfully" });
	} catch (error) {
		console.log("Error in refreshToken controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProfile = async (req, res) => {
	try {
		res.json(formatUser(req.user));
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		if (!newPassword || newPassword.length < 6) {
			return res.status(400).json({ message: "New password must be at least 6 characters" });
		}

		const user = await User.findById(req.user._id);
		if (!isAdminLevel(user.role)) {
			return res.status(403).json({ message: "Password change not available for this role" });
		}

		if (!user.mustChangePassword) {
			if (!currentPassword) {
				return res.status(400).json({ message: "Current password is required" });
			}
			const valid = await user.comparePassword(currentPassword);
			if (!valid) {
				return res.status(401).json({ message: "Current password is incorrect" });
			}
		}

		user.password = newPassword;
		user.mustChangePassword = false;
		await user.save();

		res.json({ message: "Password updated successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const generateTempPassword = () => {
	return crypto.randomBytes(4).toString("hex") + "A1!";
};
