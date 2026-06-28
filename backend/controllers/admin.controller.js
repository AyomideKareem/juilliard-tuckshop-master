import User from "../models/user.model.js";
import { ROLES } from "../lib/roles.js";

export const getStudentByCard = async (req, res) => {
	try {
		const user = await User.findOne({ card: req.params.card, role: ROLES.STUDENT }).select(
			"name email card NFCunits role isActive"
		);
		if (!user) {
			return res.status(404).json({ message: "Student not found" });
		}
		res.json({ success: true, user });
	} catch (error) {
		console.error("Error fetching student:", error);
		res.status(500).json({ message: "Server error" });
	}
};
