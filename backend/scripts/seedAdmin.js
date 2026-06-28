import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { ROLES } from "../lib/roles.js";

dotenv.config();

const seedSuperAdmin = async () => {
	const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/tuckshop";
	await mongoose.connect(uri);

	const email = process.env.ADMIN_EMAIL || "superadmin@school.local";
	const password = process.env.ADMIN_PASSWORD || "superadmin123456";
	const name = process.env.ADMIN_NAME || "Super Admin";

	const existing = await User.findOne({ email });
	if (existing) {
		if (existing.role !== ROLES.SUPER_ADMIN) {
			existing.role = ROLES.SUPER_ADMIN;
			existing.isActive = true;
			await existing.save();
			console.log(`Upgraded existing account to Super Admin: ${email}`);
		} else {
			console.log(`Super Admin already exists: ${email}`);
		}
		process.exit(0);
	}

	await User.create({
		name,
		email,
		password,
		role: ROLES.SUPER_ADMIN,
		isActive: true,
		mustChangePassword: true,
	});

	console.log(`Super Admin created: ${email} / ${password}`);
	console.log("Change the password after first login.");
	process.exit(0);
};

seedSuperAdmin().catch((err) => {
	console.error(err);
	process.exit(1);
});
