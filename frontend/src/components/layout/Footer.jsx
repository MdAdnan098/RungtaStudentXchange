import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";
import PageContainer from "@/components/layout/PageContainer";
import { MAIN_NAV_LINKS } from "@/constants/navigation";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-background-subtle">
      {/* Subtle premium accent line, sits on top of the border-t above */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <PageContainer>
        <div className="grid grid-cols-1 gap-6 py-7 sm:grid-cols-2 sm:gap-10 sm:py-8">
          {/* Brand + description */}
          <div>
            <Logo size="sm" />
            <p className="mt-2 text-body-sm text-text-muted max-w-xs leading-relaxed">
              A marketplace for Rungta students to buy, sell, and exchange
              books, gadgets, and campus essentials with fellow students.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-overline uppercase text-text-muted/80 mb-2.5">Quick Links</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 sm:block sm:space-y-0.5">
              {MAIN_NAV_LINKS.map(({ label, path, icon: Icon }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="group inline-flex items-center gap-2 py-1.5 text-body-sm text-text-secondary transition-colors duration-base ease-standard hover:text-primary"
                  >
                    {Icon && (
                      <Icon
                        className="h-3.5 w-3.5 shrink-0 text-text-muted/60 transition-colors duration-base ease-standard group-hover:text-primary"
                        aria-hidden="true"
                      />
                    )}
                    <span className="transition-transform duration-base ease-standard group-hover:translate-x-0.5">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider" />

        <div className="flex flex-col items-center gap-1.5 py-4 text-center sm:py-4.5">
          <p className="text-caption text-text-muted/70 italic">
            💜 Built with care for the Rungta student community.
          </p>
          <div className="flex flex-col items-center gap-1 text-caption text-text-muted sm:flex-row sm:gap-4">
            <p>© {year} RungtaStudentXchange. All rights reserved.</p>
            <span className="hidden text-text-muted/30 sm:inline">•</span>
            <p>Built for students, by students.</p>
          </div>
        </div>

        <div className="pb-3 text-center">
          <Link
            to="/admin/login"
            className="inline-block py-1 text-caption text-text-muted/40 transition-colors duration-base ease-standard hover:text-text-muted"
          >
            Admin
          </Link>
        </div>
      </PageContainer>
    </footer>
  );
};

export default Footer;
