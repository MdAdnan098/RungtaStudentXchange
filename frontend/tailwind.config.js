/** @type {import('tailwindcss').Config} */

// Design-system tokens for RungtaStudentXchange.
//
// Colors are wired to CSS custom properties (defined in
// src/styles/tokens.css, one set for :root / light and one set for
// .dark) instead of hard hex values. That's what makes theme
// switching instant and reload-free: toggling the `dark` class on
// <html> swaps the variable values, and every utility class that
// reads them (bg-primary, text-muted, border-DEFAULT, ...) repaints
// immediately because the cascade updates, not because React
// re-renders anything.
//
// `<alpha-value>` lets Tailwind's opacity modifiers (bg-primary/10,
// text-danger/60, ...) work correctly with CSS-variable colors.
const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    // Mobile-first breakpoints. Tailwind's defaults are already
    // min-width (mobile-first); we only add `xs` for small-phone
    // tweaks that come up a lot in dense listing/grid layouts.
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },

    extend: {
      colors: {
        // ---- Surfaces & text -------------------------------------
        background: withOpacity("--color-bg"),
        "background-subtle": withOpacity("--color-bg-subtle"),
        surface: {
          DEFAULT: withOpacity("--color-surface"),
          hover: withOpacity("--color-surface-hover"),
          raised: withOpacity("--color-surface-raised"),
        },
        border: {
          DEFAULT: withOpacity("--color-border"),
          strong: withOpacity("--color-border-strong"),
        },
        text: {
          DEFAULT: withOpacity("--color-text"),
          secondary: withOpacity("--color-text-secondary"),
          muted: withOpacity("--color-text-muted"),
          inverse: withOpacity("--color-text-inverse"),
        },

        // ---- Brand: Deep Indigo -----------------------------------
        primary: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          950: "#1E1B4B",
          DEFAULT: withOpacity("--color-primary"),
          hover: withOpacity("--color-primary-hover"),
          active: withOpacity("--color-primary-active"),
          subtle: withOpacity("--color-primary-subtle"),
          "subtle-text": withOpacity("--color-primary-subtle-text"),
        },

        // ---- Accent: Emerald ----------------------------------------
        accent: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          DEFAULT: withOpacity("--color-accent"),
          hover: withOpacity("--color-accent-hover"),
          subtle: withOpacity("--color-accent-subtle"),
        },

        // ---- Semantic states ---------------------------------------
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          DEFAULT: withOpacity("--color-success"),
          subtle: withOpacity("--color-success-subtle"),
          text: withOpacity("--color-success-text"),
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          DEFAULT: withOpacity("--color-warning"),
          subtle: withOpacity("--color-warning-subtle"),
          text: withOpacity("--color-warning-text"),
        },
        danger: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          DEFAULT: withOpacity("--color-danger"),
          hover: withOpacity("--color-danger-hover"),
          subtle: withOpacity("--color-danger-subtle"),
          text: withOpacity("--color-danger-text"),
        },

        // ---- Neutral gray scale (slate-based, cool professional tone)
        gray: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },

        // Focus ring color (see focus-ring utility in index.css)
        ring: withOpacity("--color-focus-ring"),
      },

      // ---- Typography -------------------------------------------
      fontFamily: {
        // Body copy, forms, dense UI text — optimized for legibility
        // at small sizes.
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        // Headings only, used with restraint — slightly friendlier /
        // rounder geometry than Inter so headings read as distinct
        // from body copy without losing the professional tone.
        display: ["\"Plus Jakarta Sans\"", "Inter", "system-ui", "sans-serif"],
        // Prices, order IDs, timestamps, counts — tabular figures.
        mono: ["\"JetBrains Mono\"", "ui-monospace", "SFMono-Regular", "monospace"],
      },

      fontSize: {
        // Base scale
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],

        // Semantic aliases — pair these with font-display for
        // headings so weight/tracking/family are never set ad hoc.
        "display-1": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-2": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        h1: ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "700" }],
        h2: ["1.875rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "700" }],
        h3: ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        h4: ["1.25rem", { lineHeight: "1.35", fontWeight: "600" }],
        h5: ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        h6: ["1rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75rem", fontWeight: "400" }],
        body: ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        caption: ["0.75rem", { lineHeight: "1rem", fontWeight: "500", letterSpacing: "0.01em" }],
        overline: ["0.6875rem", { lineHeight: "1rem", fontWeight: "600", letterSpacing: "0.08em" }],
      },

      // ---- Spacing (4px grid — extends Tailwind's default scale) --
      spacing: {
        4.5: "1.125rem",
        13: "3.25rem",
        15: "3.75rem",
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },

      // ---- Radius ---------------------------------------------------
      borderRadius: {
        none: "0",
        xs: "0.25rem",
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        full: "9999px",
      },

      // ---- Elevation ------------------------------------------------
      // Built from a shared --shadow-color variable so shadows can be
      // dialed down in dark mode (a strong drop shadow is invisible —
      // and looks muddy — on a dark background; see tokens.css for
      // how dark mode leans on lighter surfaces + borders instead).
      boxShadow: {
        xs: "0 1px 2px 0 rgb(var(--shadow-color) / 0.04)",
        sm: "0 1px 3px 0 rgb(var(--shadow-color) / 0.06), 0 1px 2px -1px rgb(var(--shadow-color) / 0.06)",
        md: "0 4px 6px -1px rgb(var(--shadow-color) / 0.07), 0 2px 4px -2px rgb(var(--shadow-color) / 0.05)",
        lg: "0 10px 15px -3px rgb(var(--shadow-color) / 0.08), 0 4px 6px -4px rgb(var(--shadow-color) / 0.05)",
        xl: "0 20px 25px -5px rgb(var(--shadow-color) / 0.10), 0 8px 10px -6px rgb(var(--shadow-color) / 0.05)",
        card: "0 1px 3px 0 rgb(var(--shadow-color) / 0.06), 0 1px 2px -1px rgb(var(--shadow-color) / 0.06)",
        "card-hover": "0 4px 6px -1px rgb(var(--shadow-color) / 0.08), 0 2px 4px -2px rgb(var(--shadow-color) / 0.06)",
        popover: "0 10px 15px -3px rgb(var(--shadow-color) / 0.10), 0 4px 6px -4px rgb(var(--shadow-color) / 0.06)",
        // Dark-mode-only variants: a plain black shadow at light-mode
        // alpha values all but disappears against a near-black page
        // background, so these use a bumped alpha (still soft/diffuse,
        // just enough to read as elevation) instead of a bigger blur —
        // no size/spacing implications, purely a visibility fix.
        "card-dark": "0 1px 3px 0 rgb(0 0 0 / 0.35), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
        "card-hover-dark": "0 6px 10px -2px rgb(0 0 0 / 0.45), 0 3px 5px -3px rgb(0 0 0 / 0.35)",
        "nav-dark": "0 4px 14px -6px rgb(0 0 0 / 0.5)",
        "drawer-dark": "0 20px 40px -12px rgb(0 0 0 / 0.6), 0 8px 16px -8px rgb(0 0 0 / 0.45)",
        none: "none",
      },

      // ---- Z-index scale ---------------------------------------------
      // Named layers so stacking order is decided once, here, instead
      // of ad hoc per component.
      zIndex: {
        base: "0",
        dropdown: "1000",
        sticky: "1100",
        fixed: "1200",
        overlay: "1300",
        modal: "1400",
        popover: "1500",
        tooltip: "1600",
        toast: "1700",
      },

      // ---- Motion -----------------------------------------------------
      transitionDuration: {
        fast: "120ms",
        base: "180ms",
        slow: "250ms",
        slower: "400ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
        decelerate: "cubic-bezier(0, 0, 0.2, 1)",
        accelerate: "cubic-bezier(0.4, 0, 1, 1)",
        emphasized: "cubic-bezier(0.2, 0, 0, 1)",
      },

      ringColor: {
        DEFAULT: withOpacity("--color-focus-ring"),
      },
      ringOffsetColor: {
        DEFAULT: withOpacity("--color-surface"),
      },
    },
  },
  plugins: [],
};
