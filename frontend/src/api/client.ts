import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("ttm_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ?? "Something went wrong";
    return Promise.reject(new Error(message));
  }
);
