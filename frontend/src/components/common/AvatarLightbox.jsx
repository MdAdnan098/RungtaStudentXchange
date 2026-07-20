import Modal, { ModalHeader } from "@/components/common/Modal";

const TITLE_ID = "avatar-lightbox-title";

/**
 * Opens a profile picture at full size in a centered modal, instead
 * of only ever being visible as a small cropped circle. Used
 * anywhere a DP is shown — the user's own (ProfileHeader,
 * AvatarUploadField) and other users' (SellerCard on Product
 * Details). `object-contain` (not `object-cover`, unlike the small
 * thumbnails) so the whole image is visible, not cropped to a circle.
 */
const AvatarLightbox = ({ isOpen, onClose, src, name }) => {
  if (!src) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId={TITLE_ID} maxWidthClass="max-w-lg">
      <ModalHeader titleId={TITLE_ID} title={name || "Profile photo"} onClose={onClose} />
      <img
        src={src}
        alt={name ? `${name}'s profile photo` : "Profile photo"}
        className="mx-auto max-h-[70vh] w-full rounded-xl bg-background-subtle object-contain"
      />
    </Modal>
  );
};

export default AvatarLightbox;
