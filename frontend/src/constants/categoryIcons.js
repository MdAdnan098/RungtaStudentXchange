import {
  BookOpen,
  Laptop,
  Bike,
  Calculator,
  Armchair,
  FlaskConical,
  PenTool,
  Shirt,
  Dumbbell,
  Package,
} from "lucide-react";

/**
 * Maps each backend category (constants/index.js → CATEGORIES) to an
 * icon. Kept in its own file rather than alongside CATEGORIES because
 * CATEGORIES mirrors the backend contract 1:1 — icon choice is a
 * frontend-only decision and shouldn't live next to values the API
 * actually validates against.
 *
 * `Package` is the fallback for any category without a dedicated
 * icon, so a new backend category never breaks rendering.
 */
export const CATEGORY_ICONS = {
  Books: BookOpen,
  Electronics: Laptop,
  Cycles: Bike,
  Calculators: Calculator,
  Furniture: Armchair,
  "Lab Equipment": FlaskConical,
  Stationery: PenTool,
  Clothing: Shirt,
  Sports: Dumbbell,
  Miscellaneous: Package,
};

export const getCategoryIcon = (category) => CATEGORY_ICONS[category] || Package;
