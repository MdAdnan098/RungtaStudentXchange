// Single source of truth for API paths, kept in exact sync with the
// backend route files (backend/routes/*.js). Update here if — and only
// if — the backend routes change.

export const ENDPOINTS = {
  // authRoutes.js
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    ADMIN_REGISTER: "/auth/admin/register",
    ADMIN_LOGIN: "/auth/admin/login",
    ME: "/auth/me",
    FORGOT_PASSWORD_SEND_OTP: "/auth/forgot-password/send-otp",
    FORGOT_PASSWORD_VERIFY_OTP: "/auth/forgot-password/verify-otp",
    FORGOT_PASSWORD_RESET: "/auth/forgot-password/reset",
    ADMIN_FORGOT_PASSWORD: "/auth/admin/forgot-password",
  },

  // otpRoutes.js
  OTP: {
    SEND: "/otp/send",
    VERIFY: "/otp/verify",
    RESEND: "/otp/resend",
  },

  // userRoutes.js
  USERS: {
    WISHLIST: "/users/me/wishlist",
    WISHLIST_ITEM: (productId) => `/users/me/wishlist/${productId}`,
    MY_LISTINGS: "/users/me/listings",
    AVATAR: "/users/me/avatar",
    CHANGE_PASSWORD: "/users/me/password",
    PROFILE: "/users/me",
    BY_ID: (id) => `/users/${id}`,
  },

  // productRoutes.js
  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id) => `/products/${id}`,
    BY_CATEGORY: (category) => `/products/category/${category}`,
    BY_SELLER: (sellerId) => `/products/seller/${sellerId}`,
    STATUS: (id) => `/products/${id}/status`,
    VIEW: (id) => `/products/${id}/view`,
  },

  // reportRoutes.js
  REPORTS: {
    BASE: "/reports",
    MINE: "/reports/me",
  },

  // adminRoutes.js
  ADMIN: {
    STATS: "/admin/stats",
    USERS: "/admin/users",
    USER_BY_ID: (id) => `/admin/users/${id}`,
    BAN_USER: (id) => `/admin/users/${id}/ban`,
    UNBAN_USER: (id) => `/admin/users/${id}/unban`,
    DELETE_USER: (id) => `/admin/users/${id}`,
    DELETE_ALL_USERS: "/admin/users/bulk",
    REVOKE_STUDENT: (id) => `/admin/users/${id}/revoke-student`,
    PRODUCTS: "/admin/products",
    REMOVE_PRODUCT: (id) => `/admin/products/${id}/remove`,
    DELETE_PRODUCT: (id) => `/admin/products/${id}`,
    DELETE_ALL_PRODUCTS: "/admin/products/bulk",
    REPORTS: "/admin/reports",
    REPORT_BY_ID: (id) => `/admin/reports/${id}`,
    DELETE_ALL_REPORTS: "/admin/reports/bulk",
    VISITOR_STATS: "/admin/visitors/stats",
    VISITOR_MAP: "/admin/visitors/map",
    VISITORS: "/admin/visitors",
    VISITORS_EXPORT: "/admin/visitors/export",
    VISITOR_BY_ID: (id) => `/admin/visitors/${id}`,
    DELETE_ALL_VISITORS: "/admin/visitors/bulk",
  },

  // visitorRoutes.js
  VISITORS: {
    TRACK: "/visitors/track",
  },
};
