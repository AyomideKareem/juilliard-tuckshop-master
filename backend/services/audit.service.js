import AuditLog from "../models/auditLog.model.js";

export const logAudit = async ({ action, performedBy, targetUser, details = {}, ipAddress }) => {
	try {
		await AuditLog.create({
			action,
			performedBy,
			targetUser,
			details,
			ipAddress,
		});
	} catch (error) {
		console.error("Audit log failed:", error.message);
	}
};
