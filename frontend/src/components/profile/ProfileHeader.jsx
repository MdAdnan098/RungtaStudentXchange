import { useState } from "react";
import { BadgeCheck, MapPin, Phone, User as UserIcon } from "lucide-react";
import AvatarLightbox from "@/components/common/AvatarLightbox";

const formatJoinDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

const ProfileHeader = ({ user }) => {
  const avatarRing = user.isStudentVerified ? "ring-success/30" : "ring-border";
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  return (
    <div className="card-padded flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
      {user.avatar ? (
        <button
          type="button"
          onClick={() => setIsAvatarOpen(true)}
          className={`h-20 w-20 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-surface ${avatarRing}`}
          aria-label="View full profile photo"
        >
          <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
        </button>
      ) : (
        <span
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-subtle-text ring-2 ring-offset-2 ring-offset-surface ${avatarRing}`}
        >
          <UserIcon className="h-8 w-8" aria-hidden="true" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 sm:justify-start">
          <h1 className="min-w-0 max-w-full truncate text-h3">{user.name}</h1>
          {user.isStudentVerified && (
            <span className="badge-success">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Verified Rungta Student
            </span>
          )}
        </div>

        <p className="mt-1.5 text-body-sm text-text-muted">{user.email}</p>

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 text-caption text-text-muted sm:justify-start">
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {user.location}
            </span>
          )}
          {user.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {user.phone}
            </span>
          )}
          {user.createdAt && <span>Joined {formatJoinDate(user.createdAt)}</span>}
        </div>

        {user.bio && (
          <p className="mt-4 border-t border-border pt-3.5 text-body-sm leading-relaxed text-text-secondary">
            {user.bio}
          </p>
        )}
      </div>

      <AvatarLightbox isOpen={isAvatarOpen} onClose={() => setIsAvatarOpen(false)} src={user.avatar} name={user.name} />
    </div>
  );
};

export default ProfileHeader;
