/**
 * Minimal `clsx`-style className combiner. Kept dependency-free since
 * this is the only place we need it. Accepts strings, and
 * falsy/conditional values (`condition && "class"`).
 *
 *   cn("btn", isActive && "btn-active", className)
 */
export const cn = (...values) => values.filter(Boolean).join(" ");
