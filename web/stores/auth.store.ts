import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  plan: string;
  is_admin: boolean;
}

interface AuthStore {
  user: AuthUser | null;
  setAuth: (user: AuthUser, token: string, expiresIn: number) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      setAuth: (user, token, expiresIn) => {
        Cookies.set(ACCESS_TOKEN_COOKIE, token, { expires: expiresIn / 86400, sameSite: "Lax" });
        set({ user });
      },
      clearAuth: () => {
        Cookies.remove(ACCESS_TOKEN_COOKIE);
        set({ user: null });
      },
      isAuthenticated: () => !!get().user && !!Cookies.get(ACCESS_TOKEN_COOKIE),
    }),
    {
      name: "pyp-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ user: s.user }),
    }
  )
);
