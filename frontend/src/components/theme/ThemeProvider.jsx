import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const applyThemeClass = (resolvedTheme) => {
  const root = document.documentElement;
  root.classList.toggle("dark", resolvedTheme === "dark");
};

/**
 * Mounts once at the app root (see App.jsx). Owns every DOM side
 * effect theming needs:
 *  - resolves "system" against the OS preference
 *  - applies/removes the `dark` class on <html> (Tailwind's
 *    `darkMode: "class"` strategy — see tailwind.config.js)
 *  - keeps listening for OS-level changes while `theme === "system"`
 *
 * Because switching themes is just a class toggle read by CSS
 * variables (tokens.css), every themed element repaints instantly —
 * no reload, no full re-render of the tree.
 *
 * index.html also has a small inline script that reads the same
 * localStorage key before React mounts, so there's no flash of the
 * wrong theme on first paint; this effect just keeps things in sync
 * afterwards.
 */
const ThemeProvider = ({ children }) => {
  const theme = useThemeStore((state) => state.theme);
  const setResolvedTheme = useThemeStore((state) => state.setResolvedTheme);

  useEffect(() => {
    const resolve = () => {
      const resolved = theme === "system" ? getSystemTheme() : theme;
      applyThemeClass(resolved);
      setResolvedTheme(resolved);
    };

    resolve();

    if (theme !== "system") return;

    // Only needed while following the OS preference — keep the app
    // in sync if the user changes their system theme mid-session.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => resolve();

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme, setResolvedTheme]);

  return children;
};

export default ThemeProvider;
