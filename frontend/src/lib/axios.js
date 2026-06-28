import axios from "axios";
import { API_BASE } from "./api.js";

const axiosInstance = axios.create({
	baseURL: API_BASE,
	withCredentials: true,
});

export default axiosInstance;
