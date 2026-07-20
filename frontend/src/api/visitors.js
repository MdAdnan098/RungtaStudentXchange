import axiosInstance from "@/api/axiosInstance";
import { ENDPOINTS } from "@/constants/endpoints";

// Public endpoint — axiosInstance still attaches a Bearer token when
// one exists (see api/axiosInstance.js interceptor), which is exactly
// how the backend tells a logged-in visitor from a guest
// (visitorController.js trackVisit → optionalAuth). Fails silently by
// design: called from useVisitorTracking as a best-effort background
// call that should never surface an error to the visitor.
export const trackVisit = (payload) => axiosInstance.post(ENDPOINTS.VISITORS.TRACK, payload);
