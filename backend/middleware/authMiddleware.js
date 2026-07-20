import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Not authorized, no token provided");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    next(new Error("Not authorized, token invalid or expired"));
  }
};

// Same token decode as `protect`, but never rejects the request — a
// missing, malformed, or expired token just leaves `req.user`
// undefined instead of returning 401. Built for endpoints that must
// stay reachable by guests (the public visitor-tracking endpoint) but
// still want to know who the visitor is when they happen to be
// logged in.
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Invalid/expired token on a public endpoint — treat as guest
    // rather than failing the request.
    next();
  }
};

export const checkBanned = (req, res, next) => {
  if (req.user && req.user.isBanned) {
    res.status(403);
    return next(new Error("Your account has been banned"));
  }
  next();
};
