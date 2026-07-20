import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AUTH_STORAGE_KEY } from "@/constants";

// Holds the authenticated user + JWT returned by /api/auth/login and
// /api/auth/register (data.user, data.token — see authController.js).
// Persisted to localStorage so a refresh doesn't log the user out;
// the backend token itself expires in 15 minutes (no refresh flow),
// so axiosInstance's 401 interceptor is what actually clears this on
// expiry.
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: ({ user, token }) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
