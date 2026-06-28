import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,

	loginStudent: async (card) => {
		set({ loading: true });
		try {
			const res = await axios.post("/auth/login", { card });
			set({ user: res.data, loading: false });
			toast.success(`Welcome, ${res.data.name}`);
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Invalid NFC card");
		}
	},

	loginAdmin: async ({ email, password }) => {
		set({ loading: true });
		try {
			const res = await axios.post("/auth/login/admin", { email: email.trim(), password });
			set({ user: res.data, loading: false });
			toast.success(`Welcome, ${res.data.name}`);
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Invalid credentials");
		}
	},

	loginAdminWithCard: async (card) => {
		set({ loading: true });
		try {
			const res = await axios.post("/auth/login/admin/card", { card: card.trim() });
			set({ user: res.data, loading: false });
			toast.success(`Welcome, ${res.data.name}`);
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Invalid admin NFC card");
		}
	},

	logout: async () => {
		try {
			await axios.post("/auth/logout");
			set({ user: null });
		} catch (error) {
			toast.error(error.response?.data?.message || "Logout failed");
		}
	},

	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/auth/profile");
			set({ user: response.data, checkingAuth: false });
		} catch {
			set({ checkingAuth: false, user: null });
		}
	},

	refreshProfile: async () => {
		try {
			const response = await axios.get("/auth/profile");
			set({ user: response.data });
		} catch {
			/* ignore */
		}
	},

	refreshToken: async () => {
		if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},
}));

let refreshPromise = null;

axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				if (refreshPromise) {
					await refreshPromise;
					return axios(originalRequest);
				}

				refreshPromise = useUserStore.getState().refreshToken();
				await refreshPromise;
				refreshPromise = null;

				return axios(originalRequest);
			} catch (refreshError) {
				useUserStore.getState().logout();
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);

export const isStudent = (user) => user?.role === "student";
export const isAdmin = (user) => user?.role === "admin" || user?.role === "super_admin";
export const isSuperAdmin = (user) => user?.role === "super_admin";
