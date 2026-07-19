import axios from "axios";

const getApiBaseUrl = () => {
  // In production, always use the Render backend
  if (import.meta.env.PROD || window.location.hostname !== "localhost") {
    return "https://dms-backend.onrender.com/api";
  }

  // In development, use configured URL or default to local proxy
  const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();
  if (
    configuredBaseUrl &&
    configuredBaseUrl !== "https://dms-backend.onrender.com/api"
  ) {
    return configuredBaseUrl;
  }

  return "/api";
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
