export const ROLES = {
	STUDENT: "student",
	ADMIN: "admin",
	SUPER_ADMIN: "super_admin",
};

export const isStudent = (role) => role === ROLES.STUDENT;

export const isAdminLevel = (role) => role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

export const isSuperAdmin = (role) => role === ROLES.SUPER_ADMIN;

export const creatableRoles = () => [ROLES.STUDENT, ROLES.ADMIN];
