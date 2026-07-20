import { useState } from "react";
import { BadgeCheck, User as UserIcon } from "lucide-react";
import { useSellerJoinDate } from "@/hooks/useSellerJoinDate";
import { useSellerListingCount } from "@/hooks/useSellerListingCount";
import AvatarLightbox from "@/components/common/AvatarLightbox";

const formatJoinDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

/**
 * Seller info only (avatar, name, verified badge, join date, listing
 * count) — WhatsApp Chat / Call live in ProductActions, not here.
 * They used to be duplicated in both components, so every viewer saw
 * two WhatsApp buttons and two Call buttons on a product page.
 * ProductActions is the single source for those now; this card only
 * needs `seller` — `productId`, `whatsappNumber`, `alternateNumber`,
 * and `productTitle` are no longer used, so they're dropped from the
 * props this component accepts (ProductDetails.jsx still passes some
 * of them to SellerCard, which is harmless — extra props are simply
 * ignored).
 */
const SellerCard = ({ seller }) => {
  const joinDate = useSellerJoinDate(seller._id);
  const listingCount = useSellerListingCount(seller._id);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  return (
    <div className="card-padded !rounded-2xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3.5">
        {seller.avatar && !avatarFailed ? (
          <button
            type="button"
            onClick={() => setIsAvatarOpen(true)}
            className="h-14 w-14 shrink-0 rounded-full ring-2 ring-border"
            aria-label="View full profile photo"
          >
            <img
              src={seller.avatar}
              alt=""
              loading="lazy"
              onError={() => setAvatarFailed(true)}
              className="h-full w-full rounded-full object-cover"
            />
          </button>
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-subtle-text ring-2 ring-border">
            <UserIcon className="h-6 w-6" aria-hidden="true" />
          </span>
        )}

        <div>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm font-semibold text-text sm:text-body">
            {seller.name}
            {seller.isStudentVerified && (
              <span className="badge-success">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Verified Rungta Student
              </span>
            )}
          </p>
          <p className="mt-0.5 text-caption text-text-muted">
            {joinDate && <>Joined {formatJoinDate(joinDate)}</>}
            {joinDate && listingCount !== null && " · "}
            {listingCount !== null && (
              <>
                {listingCount} active {listingCount === 1 ? "listing" : "listings"}
              </>
            )}
          </p>
        </div>
      </div>

      <AvatarLightbox
        isOpen={isAvatarOpen}
        onClose={() => setIsAvatarOpen(false)}
        src={!avatarFailed ? seller.avatar : null}
        name={seller.name}
      />
    </div>
  );
};

export default SellerCard;
