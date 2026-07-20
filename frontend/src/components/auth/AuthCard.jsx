import PageContainer, { Section } from "@/components/layout/PageContainer";

/**
 * One shared shell for every authentication surface — Login,
 * Register, Forgot Password, OTP verification, Reset Password, and
 * the admin Login/Register pages all render through this single
 * component. Consolidated from what used to be three near-identical
 * card components (a generic one here, plus page-specific "premium"
 * copies for Login/Register and for the recovery flow) into one, so
 * every auth surface shares one visual language and future polish
 * only needs to happen in one place.
 *
 * Split into `AuthCardShell` (page-level Section/PageContainer/white
 * card box) and `AuthCardHeader` (icon/title/subtitle/step-dots) so a
 * page that needs to switch between two different "screens" inside
 * one card — e.g. Login toggling to its inline forgot-password flow —
 * can keep one Shell mounted and just swap which Header + form it
 * renders, instead of navigating to a whole new page.
 */
export const AuthCardShell = ({ children }) => (
  <Section spacing="lg">
    <PageContainer size="sm">
      <div
        className="mx-auto w-full max-w-md rounded-2xl border border-border bg-surface
          p-6 shadow-lg transition-shadow duration-base ease-standard
          dark:shadow-card-dark sm:p-8"
      >
        {children}
      </div>
    </PageContainer>
  </Section>
);

export const AuthCardHeader = ({ icon, title, subtitle, stepIndex, stepCount }) => (
  <>
    {icon && (
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full
          bg-primary-subtle text-primary"
        aria-hidden="true"
      >
        {icon}
      </div>
    )}

    <h1 className="text-h3 text-center tracking-tight">{title}</h1>
    {subtitle && (
      <p className="mx-auto mt-1.5 max-w-[26rem] text-center text-body-sm leading-relaxed text-text-muted">
        {subtitle}
      </p>
    )}

    {stepCount > 1 && (
      <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden="true">
        {Array.from({ length: stepCount }).map((_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all duration-base ease-standard ${
              index === stepIndex - 1 ? "w-6 bg-primary" : "w-1.5 bg-border-strong"
            }`}
          />
        ))}
      </div>
    )}
  </>
);

/**
 * `icon` and `stepIndex`/`stepCount` are optional — callers that
 * don't pass them (e.g. Admin Login) simply don't render that part,
 * so nothing about their layout changes beyond the shared card/
 * spacing refinements below.
 */
const AuthCard = ({ icon, title, subtitle, stepIndex, stepCount, children }) => {
  return (
    <AuthCardShell>
      <AuthCardHeader icon={icon} title={title} subtitle={subtitle} stepIndex={stepIndex} stepCount={stepCount} />
      <div className="mt-7">{children}</div>
    </AuthCardShell>
  );
};

export default AuthCard;
