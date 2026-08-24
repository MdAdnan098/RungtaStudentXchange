import { NavLink } from "react-router-dom";
import { Globe } from "lucide-react";
import { cn } from "@/utils/cn";

const TABS = [
  { label: "Dashboard", path: "/admin" },
  { label: "Users", path: "/admin/users" },
  { label: "Listings", path: "/admin/products" },
  { label: "Reports", path: "/admin/reports" },
  // Longest label in the row — on narrow screens it gets swapped for
  // a compact icon (below) so the nav never overflows/cuts off.
  { label: "Visitor Analytics", useIcon: true, path: "/admin/visitors" },
];

const AdminNav = () => (
  <nav
    aria-label="Admin sections"
    className="mb-6 flex gap-0.5 overflow-x-auto border-b border-border sm:gap-1"
  >
    {TABS.map((tab) => (
      <NavLink
        key={tab.path}
        to={tab.path}
        end={tab.path === "/admin"}
        className={({ isActive }) =>
          cn(
            "shrink-0 border-b-2 px-2.5 py-2.5 text-body-sm font-medium transition-colors duration-base ease-standard sm:px-3",
            isActive ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text"
          )
        }
      >
        {tab.useIcon ? (
          <>
            <Globe className="h-5 w-5 sm:hidden" aria-hidden="true" />
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
