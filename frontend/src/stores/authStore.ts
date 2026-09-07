import { create } from "zustand";
import { User } from "../types";
import { api, setAccessToken } from "../api/client";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user, token) => {
    setAccessToken(token);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {}
    setAccessToken(null);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    try {
      const refreshRes = await api.post("/auth/refresh");
      if (refreshRes.data?.data?.accessToken) {
        setAccessToken(refreshRes.data.data.accessToken);
        const meRes = await api.get("/users/me");
        set({ user: meRes.data.data, isAuthenticated: true, isLoading: false });
        return;
      }
    } catch (e) {}
    setAccessToken(null);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
