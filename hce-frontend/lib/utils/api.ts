import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const api = axios.create({ baseURL: API_BASE_URL, headers: { "Content-Type": "application/json" } });
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("hce_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("hce_token");
    localStorage.removeItem("hce_user");
    window.location.href = "/login";
  }
  return Promise.reject(error);
});
export default api;
