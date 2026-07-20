import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEME_STORAGE_KEY } from "@/constants";

/**
 * `theme` is the user's *preference*: "light" | "dark" | "system".
 * `resolvedTheme` is what's actually applied: "light" | "dark" — with
 * "system" resolved against the OS preference at the moment it's
 * computed.
 *
 * Kept as a separate store from authStore (not shoved into it) since
 * theme has nothing to do with auth and should be readable/settable
 * before login, on public pages, etc.
 *
 * The actual DOM side effect (toggling the `dark` class on <html>,
 * listening for OS theme changes) lives in ThemeProvider — this store
 * only holds state. See src/components/theme/ThemeProvider.jsx.
 */
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "system",
      resolvedTheme: "light",

      setTheme: (theme) => set({ theme }),
      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.resolvedTheme === "dark" ? "light" : "dark",
        })),
    }),
    {
      name: THEME_STORAGE_KEY,
      // Only persist the preference, not the resolved value — the
      // resolved value is always recomputed on load so it can react
      // to OS-level changes even for users on "system".
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
