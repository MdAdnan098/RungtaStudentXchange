import { Outlet } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";

/**
 * Visual shell for admin pages. Access control lives in
 * src/routes/AdminRoute.jsx (redirects non-admins) — same
 * guard/layout split as ProtectedLayout, composed the same way in
 * AppRoutes.jsx.
 *
 * Adds a slim "Admin Panel" strip so it's always visually obvious
 * when you're in an elevated-privilege area, distinct from the
 * regular protected shell. Intentionally not a full sidebar yet —
 * that's real admin-page UI, out of scope for this layout task, but
 * this is where it would go once the admin module is built.
 */
const AdminLayout = () => {
  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-border bg-background-subtle">
        <PageContainer size="xl">
          <div className="flex items-center gap-2 py-3 text-caption text-text-muted">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            Admin Panel
          </div>
        </PageContainer>
      </div>

      <PageContainer as="div" size="xl" className="flex-1 py-8">
        <Outlet />
      </PageContainer>
    </div>
  );
};

export default AdminLayout;
