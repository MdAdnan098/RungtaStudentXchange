import express from "express";
import { trackVisit } from "../controllers/visitorController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";
import { generalApiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public — no `protect`. optionalAuth attaches req.user only if a
// valid token happens to be present, so both guests and logged-in
// visitors can hit this. Rate-limited like every other public route
// (see rateLimiter.js) since it's write-heavy and unauthenticated.
router.post("/track", generalApiLimiter, optionalAuth, trackVisit);

export default router;
