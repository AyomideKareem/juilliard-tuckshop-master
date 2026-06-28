const getApiBase = () => {
	if (import.meta.env.VITE_API_URL) {
		return `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`;
	}
	if (import.meta.env.PROD) {
		return "/api";
	}
	return "/api";
};

export const API_BASE = getApiBase();

export const getAssetUrl = (path) => {
	if (!path) return "";
	if (path.startsWith("http")) return path;
	if (import.meta.env.VITE_API_URL) {
		return `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}${path}`;
	}
	if (import.meta.env.PROD) {
		return path;
	}
	return path;
};
