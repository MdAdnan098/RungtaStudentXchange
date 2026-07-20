import { useNavigate } from "react-router-dom";
import { AuthCardShell } from "@/components/auth/AuthCard";
import ForgotPasswordFlow from "@/components/auth/ForgotPasswordFlow";
import { usePageTitle } from "@/hooks/usePageTitle";

/**
 * Standalone /forgot-password route — for a guest who lands here
 * directly (bookmark, shared link, etc). Login and the "Change
 * Password" section on Edit Profile no longer navigate here; they
 * embed <ForgotPasswordFlow> inline in their own card instead, so
 * "Forgot password?" opens on whichever page it was clicked from
 * rather than routing away. This page still exists as a direct entry
 * point and renders the exact same flow — just AuthCardShell (the
 * page/card chrome) here, since ForgotPasswordFlow already renders
 * its own AuthCardHeader per step.
 */
const ForgotPassword = () => {
  usePageTitle("Forgot Password");
  const navigate = useNavigate();

  return (
    <AuthCardShell>
      <ForgotPasswordFlow
        onCancel={() => navigate("/login")}
        onDone={() => navigate("/login", { replace: true })}
      />
    </AuthCardShell>
  );
};

export default ForgotPassword;
