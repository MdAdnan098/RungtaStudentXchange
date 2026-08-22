import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import StudentEssentialsShowcase from "@/components/home/StudentEssentialsShowcase";

/**
 * Single column at every breakpoint: text + buttons first, then the
 * essentials showcase directly below in source order. Previously this
 * switched to a 2-column grid at lg (text left, showcase right), which
 * pushed most of the showcase off-screen on desktop since it's a
 * fixed-height two-row scroller, not something that benefits from a
 * side column. Keeping it single-column makes desktop match mobile.
 */
const HeroSection = () => {
  return (
    <Section spacing="lg" aria-labelledby="hero-heading">
      <PageContainer>
        <div className="grid grid-cols-1 items-center gap-12">
          <div className="max-w-xl">
            <h1
              id="hero-heading"
              className="text-balance text-h1 sm:text-display-2"
            >
              Sell your unused stuff. Buy what you need.
            </h1>
            <p className="mt-4 max-w-md text-pretty text-body-lg leading-relaxed text-text-secondary sm:mt-5">
              A campus-only marketplace where Rungta students exchange books,
              electronics, and everyday essentials they no longer use —
              built for students, verified for students 🤝
            </p>

            <div className="mt-7 flex flex-col gap-3 xs:flex-row sm:mt-8">
              <Link
                to="/browse"
                className="btn-primary btn-lg group w-full rounded-xl shadow-sm btn-tactile hover:shadow-md xs:w-auto"
              >
                Browse Marketplace
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-base ease-standard group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/sell"
                className="btn-secondary btn-lg w-full rounded-xl btn-tactile hover:shadow-sm xs:w-auto"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create Listing
              </Link>
            </div>
          </div>

          <div>
            <StudentEssentialsShowcase />
          </div>
        </div>
      </PageContainer>
    </Section>
  );
};

export default HeroSection;
