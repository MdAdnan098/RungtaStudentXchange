import axiosInstance from "@/api/axiosInstance";
import { ENDPOINTS } from "@/constants/endpoints";

// GET /users/:id (public, no auth) — see backend limitation note in
// useSellerJoinDate.js: this endpoint returns the *entire* user
// document (email, phone, bio, even their private wishlist array),
// not a trimmed public-profile shape. Only used for `createdAt` here;
// every other field is intentionally left unread.
export const getUserById = (id, { signal } = {}) => axiosInstance.get(ENDPOINTS.USERS.BY_ID(id), { signal });

// PUT /users/me — updateProfile only reads name/bio/location/phone
// from the body (backend/controllers/userController.js); email is
// not editable through this endpoint at all.
export const updateProfile = ({ name, bio, location, phone }) =>
  axiosInstance.put(ENDPOINTS.USERS.PROFILE, { name, bio, location, phone });

export const deleteMyAccount = () => axiosInstance.delete(ENDPOINTS.USERS.PROFILE);

export const getMyListings = ({ signal } = {}) => axiosInstance.get(ENDPOINTS.USERS.MY_LISTINGS, { signal });

/// Image is already uploaded straight to ImageKit by the time this is
// called (see uploadToImageKit.js) — plain JSON now, not multipart.
export const updateAvatar = ({ url, fileId }) =>
  axiosInstance.put(ENDPOINTS.USERS.AVATAR, { url, fileId });

export const deleteAvatar = () => axiosInstance.delete(ENDPOINTS.USERS.AVATAR);

// PUT /users/me/password — requires the current password server-side
// (userController.changePassword compares it with bcrypt before
// allowing the change); entirely separate from updateProfile.
export const changePassword = ({ currentPassword, newPassword }) =>
  axiosInstance.put(ENDPOINTS.USERS.CHANGE_PASSWORD, { currentPassword, newPassword });
