import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import { cn } from "@/utils/cn";

const COMMUNITY_TIPS = [
  "🎓 Senior ho ya junior, sabhi students se respectfully baat karein.",
  "📦 Deal hamesha campus ya kisi public place par hi complete karein.",
  "👀 Payment karne se pehle item ko achhi tarah check kar lein.",
  "🚫 Mazak-masti me fake listing bilkul na karein.",
  "🛡️ Fake ya suspicious listing dikhe to bina jhijhak Report karein.",
  "💬 Deal ki baat chat me hi karein, taaki record bana rahe.",
  "📸 Listing post karte waqt clear aur original photos hi upload karein.",
  "💰 Price aur item ki condition honestly mention karein.",
  "🏷️ Deal complete ho jaaye to apni listing ko Sold mark kar dein.",
  "🔒 Apna OTP, password ya account details kabhi kisi ke saath share na karein.",
  "🌟 Verified Student badge dusre students ko aap par trust karne me madad karta hai. Isliye apni Rungta Student Email ID se khud ko verify zarur karwa lein.",
];

// On mobile, all 11 tips stacked in one narrow column wrap to several
// lines each and make the card look absurdly long. Desktop is wide
// enough that this isn't a problem, so the collapse only applies
// below the `sm` breakpoint (see the `sm:!max-h-none` overrides below).
const MOBILE_PREVIEW_COUNT = 4;

/**
 * Static, no backend involved — a card of community guidelines below
 * Fresh Listings, in the same card-padded style used across the
 * dashboard (ProfileHeader, StudentVerificationCard) so it doesn't
 * read as a one-off banner.
 *
 * Wrapped in .neon-glow-wrap / .neon-border (see styles/index.css) —
 * a slow rotating conic-gradient ring (plus a blurred glow copy)
 * using the app's own brand-adjacent neon colors.
 */
const CommunitySection = () => {
  const [expanded, setExpanded] = useState(false);
  const hasOverflow = COMMUNITY_TIPS.length > MOBILE_PREVIEW_COUNT;

  return (
    <Section aria-labelledby="community-heading">
      <PageContainer size="md">
        <div className="neon-glow-wrap !rounded-2xl">
          <div className="neon-border !rounded-2xl">
            <div className="card-padded !rounded-2xl !p-6 sm:!p-7">
              <h2 id="community-heading" className="text-h4 leading-snug">
                ❤️ Sabhi Students Ke Liye Kuch Zaruri Baatein
              </h2>

              <ul
                className={cn(
                  "mt-5 space-y-3.5 overflow-hidden transition-[max-height] duration-300 ease-standard sm:mt-6 sm:!max-h-none sm:!overflow-visible",
                  expanded ? "max-h-[2000px]" : "max-h-48",
                )}
              >
                {COMMUNITY_TIPS.map((tip) => {
                  const [icon, ...rest] = tip.split(" ");
                  const text = rest.join(" ");
                  return (
                    <li key={tip} className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0 text-base leading-none" aria-hidden="true">
                        {icon}
                      </span>
                      <span className="text-body-sm leading-relaxed text-text-secondary">{text}</span>
                    </li>
                  );
                })}
              </ul>

              {hasOverflow && (
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="mt-4 flex items-center gap-1.5 rounded-full bg-primary-subtle px-3.5 py-1.5 text-body-sm font-medium text-primary-subtle-text transition-colors duration-base ease-standard hover:bg-primary/10 sm:hidden"
                >
                  {expanded ? "Show Less" : "Show More"}
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform duration-base", expanded && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>
              )}

              <div className="divider mt-6 pt-5 sm:mt-7 sm:pt-6">
                <p className="text-body-sm font-medium italic leading-relaxed text-text-secondary">
                  🤝 Aapka thoda sa cooperation, har student ke liye ek better aur safer marketplace bana sakta hai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </Section>
  );
};

export default CommunitySection;