import { create } from "zustand";
import { authApi } from "../api/endpoints";
import type { User } from "../types";

type AuthState = {
  user: User | null;
  bootstrapped: boolean;
  setSession: (token: string, user: User) => void;
  bootstrap: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  bootstrapped: false,
  setSession: (token, user) => {
    sessionStorage.setItem("ttm_token", token);
    set({ user });
  },
  bootstrap: async () => {
    try {
      if (!sessionStorage.getItem("ttm_token")) {
        set({ bootstrapped: true });
        return;
      }
      const { data } = await authApi.me();
      set({ user: data.user, bootstrapped: true });
    } catch {
      sessionStorage.removeItem("ttm_token");
      set({ user: null, bootstrapped: true });
    }
  },
  logout: async () => {
    await authApi.logout().catch(() => undefined);
    sessionStorage.removeItem("ttm_token");
    set({ user: null });
  }
}));
