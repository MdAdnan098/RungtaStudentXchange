import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { cn } from "@/utils/cn";

/**
 * Cycles light ⇄ dark using the existing theme store — see
 * src/store/themeStore.js and src/components/theme/ThemeProvider.jsx.
 * Intentionally toggles between light/dark only (not "system") once
 * clicked; a user who wants to follow the OS again can be given that
 * option later from a settings page.
 *
 * The icon swap uses a simple opacity/scale cross-fade at
 * duration-base — no spring/bounce, matching "no fancy animation".
 */
const ThemeToggle = ({ className }) => {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-lg",
        "text-text-secondary hover:bg-surface-hover hover:text-text",
        "transition-colors duration-base ease-standard",
        className
      )}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <Sun
        className={cn(
          "h-[1.1rem] w-[1.1rem] transition-all duration-base ease-standard",
          isDark ? "scale-0 opacity-0 -rotate-90" : "scale-100 opacity-100 rotate-0"
        )}
        aria-hidden="true"
      />
      <Moon
        className={cn(
          "absolute h-[1.1rem] w-[1.1rem] transition-all duration-base ease-standard",
          isDark ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 rotate-90"
        )}
        aria-hidden="true"
      />
    </button>
  );
};

export default ThemeToggle;
