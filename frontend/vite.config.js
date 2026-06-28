import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

const getBackendPort = () => {
	const rootEnvPath = path.resolve(process.cwd(), "..", ".env");
	if (!fs.existsSync(rootEnvPath)) return "5000";

	const portLine = fs
		.readFileSync(rootEnvPath, "utf8")
		.split(/\r?\n/)
		.find((line) => line.trim().startsWith("PORT="));

	return portLine?.split("=")[1]?.trim() || "5000";
};

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const apiTarget = env.VITE_API_URL || `http://localhost:${getBackendPort()}`;

	return {
		plugins: [react()],
		server: {
			host: "0.0.0.0",
			port: 5173,
			proxy: {
				"/api": { target: apiTarget, changeOrigin: true },
				"/uploads": { target: apiTarget, changeOrigin: true },
			},
		},
	};
});
