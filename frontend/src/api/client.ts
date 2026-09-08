import axios from "axios";

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim().length > 0) {
    let clean = envUrl.trim();
    if (clean.endsWith("/")) {
      clean = clean.substring(0, clean.length - 1);
    }
    if (clean.endsWith("/api/v1")) {
      return clean;
    }
    if (clean.endsWith("/api")) {
      return `${clean}/v1`;
    }
    return `${clean}/api/v1`;
  }
  return "/api/v1";
};

export const apiBaseUrl = getBaseUrl();

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

api.interceptors.request.use((config) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

import { useServerStore } from "../stores/serverStore";

// Automatic retry on server sleep & silent refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Check if error is due to Render sleeping server (network error, timeout, 502, 503, 504)
    const isServerSleeping =
      !error.response ||
      [502, 503, 504].includes(error.response?.status) ||
      error.code === "ECONNABORTED" ||
      error.message?.includes("Network Error");

    if (isServerSleeping && !originalRequest._serverWakeRetried) {
      originalRequest._serverWakeRetried = true;
      try {
        await useServerStore.getState().triggerWake();
        return api(originalRequest);
      } catch (wakeErr) {
        // Continue to reject if wake fails
      }
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${apiBaseUrl}/auth/refresh`, {}, { withCredentials: true });
        if (res.data?.data?.accessToken) {
          setAccessToken(res.data.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        setAccessToken(null);
      }
    }
    return Promise.reject(error);
  }
);
