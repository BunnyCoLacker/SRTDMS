import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "/api";
const normalizedBaseUrl = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL: normalizedBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
