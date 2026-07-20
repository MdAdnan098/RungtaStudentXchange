export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error("Not authorized, no user found"));
  }

  if (req.user.role !== "admin") {
    res.status(403);
    return next(new Error("Access denied, admin privileges required"));
  }

  next();
};
