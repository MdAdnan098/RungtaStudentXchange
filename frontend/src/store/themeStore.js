import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { THEME_STORAGE_KEY } from "@/constants";

/**
 * `theme` is the user's *preference*: "light" | "dark" | "system".
 * `resolvedTheme` is what's actually applied: "light" | "dark" — with
 * "system" resolved against the OS preference at the moment it's
 * computed.
 *
 * Default is always "light" (not "system") so a device's OS-level
 * dark mode never determines the initial theme. Stored in
 * sessionStorage (not localStorage) so a user's manual dark-mode
 * choice only lasts for the current browser session — closing the
 * browser and reopening always starts fresh on light.
 */
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "light",
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
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
