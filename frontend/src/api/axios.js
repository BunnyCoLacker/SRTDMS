import axios from "axios";

const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.endsWith("/api")
      ? configuredBaseUrl
      : `${configuredBaseUrl.replace(/\/$/, "")}/api`;
  }

  return import.meta.env.PROD ? "https://dms-backend.onrender.com/api" : "/api";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
