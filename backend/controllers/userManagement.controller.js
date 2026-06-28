import User from "../models/user.model.js";
import { logAudit } from "../services/audit.service.js";
import { generateTempPassword } from "./auth.controller.js";
import { creatableRoles, ROLES } from "../lib/roles.js";

const sanitizeUser = (user) => ({
	_id: user._id,
	name: user.name,
	email: user.email,
	card: user.card,
	role: user.role,
	NFCunits: user.NFCunits,
	isActive: user.isActive,
	mustChangePassword: user.mustChangePassword,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});

export const listUsers = async (req, res) => {
	try {
		const { search, role, status } = req.query;
		const filter = {};

		if (role && creatableRoles().concat(ROLES.SUPER_ADMIN).includes(role)) {
			filter.role = role;
		}

		if (status === "active") filter.isActive = true;
		if (status === "disabled") filter.isActive = false;

		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
				{ card: { $regex: search, $options: "i" } },
			];
		}

		const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
		res.json({ success: true, users: users.map(sanitizeUser) });
	} catch (error) {
		console.error("Error listing users:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const createUser = async (req, res) => {
	try {
		const { name, email, role, initialBalance = 0, password } = req.body;
		const card = String(req.body.card || "").trim();

		if (!name || !email || !role) {
			return res.status(400).json({ message: "Name, email, and role are required" });
		}

		if (!creatableRoles().includes(role)) {
			return res.status(403).json({ message: "Cannot create accounts with this role" });
		}

		if (role === ROLES.STUDENT && !card) {
			return res.status(400).json({ message: "NFC card is required for student accounts" });
		}

		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ message: "Email already in use" });
		}

		if (card) {
			const existingCard = await User.findOne({ card });
			if (existingCard) {
				return res.status(400).json({ message: "NFC card already registered" });
			}
		}

		const tempPassword = password || generateTempPassword();

		const user = await User.create({
			name,
			email,
			password: tempPassword,
			role,
			card: card || undefined,
			NFCunits: role === ROLES.STUDENT ? Math.max(0, Number(initialBalance) || 0) : 0,
			mustChangePassword: true,
			isActive: true,
		});

		await logAudit({
			action: "USER_CREATED",
			performedBy: req.user._id,
			targetUser: user._id,
			details: { role, email },
			ipAddress: req.ip,
		});

		res.status(201).json({
			success: true,
			user: sanitizeUser(user),
			temporaryPassword: tempPassword,
		});
	} catch (error) {
		console.error("Error creating user:", error);
		res.status(500).json({ message: error.message });
	}
};

export const updateUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (user.role === ROLES.SUPER_ADMIN && user._id.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Cannot modify other Super Admin accounts" });
		}

		const { name, email, role } = req.body;
		const hasCardField = Object.prototype.hasOwnProperty.call(req.body, "card");
		const card = String(req.body.card || "").trim();

		if (role && !creatableRoles().includes(role)) {
			return res.status(403).json({ message: "Invalid role assignment" });
		}

		if (email && email !== user.email) {
			const exists = await User.findOne({ email });
			if (exists) return res.status(400).json({ message: "Email already in use" });
			user.email = email;
		}

		if (name) user.name = name;
		if (role && user.role !== ROLES.SUPER_ADMIN) user.role = role;

		if (user.role === ROLES.STUDENT && !card && hasCardField) {
			return res.status(400).json({ message: "NFC card is required for student accounts" });
		}

		if (hasCardField && card !== (user.card || "")) {
			if (card) {
				const exists = await User.findOne({ card, _id: { $ne: user._id } });
				if (exists) return res.status(400).json({ message: "NFC card already in use" });
				user.card = card;
			} else {
				user.card = undefined;
			}
		}

		await user.save();

		await logAudit({
			action: "USER_UPDATED",
			performedBy: req.user._id,
			targetUser: user._id,
			details: { name, email, role },
			ipAddress: req.ip,
		});

		res.json({ success: true, user: sanitizeUser(user) });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const toggleUserActive = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (user.role === ROLES.SUPER_ADMIN) {
			return res.status(403).json({ message: "Cannot disable Super Admin accounts" });
		}

		if (user._id.toString() === req.user._id.toString()) {
			return res.status(403).json({ message: "Cannot disable your own account" });
		}

		user.isActive = !user.isActive;
		await user.save();

		await logAudit({
			action: user.isActive ? "USER_ENABLED" : "USER_DISABLED",
			performedBy: req.user._id,
			targetUser: user._id,
			ipAddress: req.ip,
		});

		res.json({ success: true, user: sanitizeUser(user) });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const resetUserPassword = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (user.role === ROLES.SUPER_ADMIN && user._id.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Cannot reset password for other Super Admin accounts" });
		}

		const tempPassword = generateTempPassword();
		user.password = tempPassword;
		user.mustChangePassword = true;
		await user.save();

		await logAudit({
			action: "PASSWORD_RESET",
			performedBy: req.user._id,
			targetUser: user._id,
			ipAddress: req.ip,
		});

		res.json({ success: true, temporaryPassword: tempPassword });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (user.role === ROLES.SUPER_ADMIN) {
			return res.status(403).json({ message: "Cannot delete Super Admin accounts" });
		}

		if (user._id.toString() === req.user._id.toString()) {
			return res.status(403).json({ message: "Cannot delete your own account" });
		}

		await User.findByIdAndDelete(user._id);

		await logAudit({
			action: "USER_DELETED",
			performedBy: req.user._id,
			targetUser: user._id,
			details: { email: user.email, role: user.role },
			ipAddress: req.ip,
		});

		res.json({ success: true, message: "User deleted" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
