import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";

const TABS = [
  { label: "Dashboard", path: "/admin" },
  { label: "Users", path: "/admin/users" },
  { label: "Listings", path: "/admin/products" },
  { label: "Reports", path: "/admin/reports" },
  // Longest label in the row — on narrow screens it gets swapped for
  // a compact globe icon (below) so the nav never overflows/cuts off.
  { label: "Visitor Analytics", shortLabel: "🌍", path: "/admin/visitors" },
];

const AdminNav = () => (
  <nav aria-label="Admin sections" className="mb-6 flex gap-1 border-b border-border">
    {TABS.map((tab) => (
      <NavLink
        key={tab.path}
        to={tab.path}
        end={tab.path === "/admin"}
        className={({ isActive }) =>
          cn(
            "border-b-2 px-3 py-2.5 text-body-sm font-medium transition-colors duration-base ease-standard",
            isActive ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text"
          )
        }
      >
        {tab.shortLabel ? (
          <>
            <span className="text-base sm:hidden" aria-hidden="true">
              {tab.shortLabel}
            </span>
            <span className="sr-only sm:hidden">{tab.label}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </>
        ) : (
          tab.label
        )}
      </NavLink>
    ))}
  </nav>
);

export default AdminNav;
