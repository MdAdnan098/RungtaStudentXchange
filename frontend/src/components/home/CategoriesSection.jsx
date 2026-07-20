import { Link } from "react-router-dom";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import { CATEGORIES } from "@/constants";
import { getCategoryIcon } from "@/constants/categoryIcons";
import { cn } from "@/utils/cn";

// Colocated here rather than in components/common: it's a thin
// presentational wrapper with no logic, and nothing outside this
// section reuses it yet. Promote it if that changes.
const CategoryCard = ({ category }) => {
  const Icon = getCategoryIcon(category);

  return (
    <Link
      to={`/browse?category=${encodeURIComponent(category)}`}
      className={cn(
        "card card-hover group flex flex-col items-center justify-center gap-3 px-3.5 py-6 text-center",
        "!rounded-2xl",
        "transition-all duration-slow ease-standard",
        "hover:-translate-y-1 active:translate-y-0 active:scale-[0.97] active:duration-fast"
      )}
    >
      <span
        className={cn(
          "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
          "bg-background-subtle text-text-secondary",
          // Dark mode only: the plain background-subtle chip sits too
          // close in value to both the page and the card behind it,
          // so the icon reads as low-contrast by default. A lighter
          // chip + hairline border gives it a distinct, more visible
          // resting state while still reserving the brand/accent
          // color for hover (below).
          "dark:bg-surface-hover dark:text-text dark:border dark:border-border",
          "transition-all duration-slow ease-standard group-hover:scale-110",
          "group-hover:bg-primary-subtle group-hover:text-primary-subtle-text dark:group-hover:border-transparent"
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="line-clamp-1 text-body-sm font-semibold tracking-tight text-text transition-colors duration-base ease-standard group-hover:text-primary">
        {category}
      </span>
    </Link>
  );
};

const CategoriesSection = () => {
  return (
    <Section aria-labelledby="categories-heading">
      <PageContainer>
        <h2 id="categories-heading" className="text-h2">
          Browse by category
        </h2>
        <p className="mt-2 text-body text-text-muted">
          Find exactly what you need, sorted the way students actually shop.
        </p>

        <ul className="mt-7 grid grid-cols-2 gap-3.5 xs:grid-cols-3 sm:mt-8 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
          {CATEGORIES.map((category) => (
            <li key={category}>
              <CategoryCard category={category} />
            </li>
          ))}
        </ul>
      </PageContainer>
    </Section>
  );
};

export default CategoriesSection;
