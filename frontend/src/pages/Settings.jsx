import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Palette, Trash2 } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import ThemeToggle from "@/components/common/ThemeToggle";
import DeleteAccountDialog from "@/components/profile/DeleteAccountDialog";
import { useAuthStore } from "@/store/authStore";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cn } from "@/utils/cn";

const SettingsRow = ({ icon: Icon, title, description, tone = "default", stackOnMobile = false, children }) => (
  <div
    className={cn(
      "gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4",
      stackOnMobile
        ? "flex flex-col items-start sm:flex-row sm:items-center sm:justify-between"
        : "flex items-center justify-between"
    )}
  >
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {Icon && (
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            tone === "danger" ? "bg-danger-subtle text-danger" : "bg-primary-subtle text-primary-subtle-text"
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-body-sm font-medium text-text">{title}</p>
        {description && <p className="mt-0.5 text-caption leading-relaxed text-text-muted">{description}</p>}
      </div>
    </div>
    <div className={cn("shrink-0", stackOnMobile && "pl-12 sm:pl-0")}>{children}</div>
  </div>
);

const SettingsSection = ({ label, children }) => (
  <div>
    <h2 className="mb-2.5 px-1 text-overline uppercase tracking-wide text-text-muted">{label}</h2>
    <div className="card-padded divide-y divide-border">{children}</div>
  </div>
);

/**
 * Deliberately does not include notification, privacy, or language
 * settings — the backend has no support for any of them (no
 * preferences fields on the User model, no related endpoints). Only
 * theme (existing system, reused as-is), logout, and delete account
 * (a real endpoint) are backend-supported account settings.
 */
const Settings = () => {
  usePageTitle("Settings");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <Section spacing="md">
      <PageContainer size="sm">
        <div>
          <h1 className="text-h2">Settings</h1>
          <p className="mt-1.5 text-body-sm text-text-muted">Manage how RungtaStudentXchange looks and works for you.</p>
        </div>

        <div className="mt-6 space-y-6">
          <SettingsSection label="Appearance">
            <SettingsRow icon={Palette} title="Theme" description="Switch between light and dark mode.">
              <ThemeToggle className="border border-border-strong" />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection label="Account">
            <SettingsRow
              icon={LogOut}
              title="Log out"
              description="Sign out of your account on this device."
              stackOnMobile
            >
              <button type="button" onClick={handleLogout} className="btn-secondary btn-sm">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log Out
              </button>
            </SettingsRow>

            <SettingsRow
              icon={Trash2}
              tone="danger"
              title="Delete account"
              description="Permanently delete your account."
              stackOnMobile
            >
              <button type="button" onClick={() => setIsDeleteOpen(true)} className="btn-danger-ghost btn-sm">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete Account
              </button>
            </SettingsRow>
          </SettingsSection>
        </div>
      </PageContainer>

      <DeleteAccountDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} />
    </Section>
  );
};

export default Settings;
