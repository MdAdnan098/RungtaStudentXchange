import VisitorLog from "../models/VisitorLog.js";
import { reverseGeocode } from "../utils/reverseGeocode.js";

// ─── Public ─────────────────────────────────────────────────────────────────

// @desc    Log a landing-page visit. The consent dialog + browser
//          permission popup only ever fire once per browser/device,
//          but this endpoint itself is called on every landing-page
//          visit after that too — see
//          frontend/src/hooks/useVisitorTracking.js
// @route   POST /api/visitors/track
// @access  Public (optionalAuth — logged-in user is attached if a
//          valid token is present, otherwise recorded as a guest)
export const trackVisit = async (req, res) => {
  try {
    const { latitude, longitude, permissionStatus, browser, deviceType, operatingSystem } = req.body;

    if (!["granted", "denied", "dismissed", "unavailable"].includes(permissionStatus)) {
      return res.status(400).json({
        success: false,
        message: "permissionStatus must be one of: granted, denied, dismissed, unavailable",
        data: null,
      });
    }

    const hasCoords =
      permissionStatus === "granted" && typeof latitude === "number" && typeof longitude === "number";

    const location = hasCoords
      ? await reverseGeocode(latitude, longitude)
      : { country: null, state: null, district: null, area: null, city: null };

    // req.ip requires `app.set("trust proxy", 1)` in server.js to
    // resolve correctly behind a reverse proxy (Render, etc.).
    const ipAddress = req.ip || req.socket?.remoteAddress || null;

    const visitorLog = await VisitorLog.create({
      latitude: hasCoords ? latitude : null,
      longitude: hasCoords ? longitude : null,
      permissionStatus,
      country: location.country,
      state: location.state,
      district: location.district,
      area: location.area,
      city: location.city,
      browser: browser || "Unknown",
      operatingSystem: operatingSystem || "Unknown",
      deviceType: ["Mobile", "Desktop", "Tablet"].includes(deviceType) ? deviceType : "Desktop",
      ipAddress,
      isGuest: !req.user,
      user: req.user?._id || null,
    });

    return res.status(201).json({
      success: true,
      message: "Visit recorded",
      data: { visitorLogId: visitorLog._id },
    });
  } catch (error) {
    // Tracking must never break the page for a real visitor — log
    // server-side and respond 200 regardless so the frontend never
    // shows an error toast for a background analytics call.
    console.error("trackVisit failed:", error.message);
    return res.status(200).json({
      success: false,
      message: "Visit tracking failed silently",
      data: null,
    });
  }
};

// ─── Admin ──────────────────────────────────────────────────────────────────

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfThisWeek = () => {
  const date = startOfToday();
  const day = date.getDay(); // 0 (Sun) - 6 (Sat)
  date.setDate(date.getDate() - day);
  return date;
};

const startOfThisMonth = () => {
  const date = startOfToday();
  date.setDate(1);
  return date;
};

// @desc    Summary cards for Visitor Analytics
// @route   GET /api/admin/visitors/stats
// @access  Private (admin only)
export const getVisitorStats = async (req, res) => {
  try {
    const today = startOfToday();
    const week = startOfThisWeek();
    const month = startOfThisMonth();

    const [
      totalVisitors,
      loggedInVisitors,
      guestVisitors,
      permissionAllowed,
      permissionDenied,
      todaysVisitors,
      thisWeeksVisitors,
      thisMonthsVisitors,
      uniqueVisitorGroups,
    ] = await Promise.all([
      VisitorLog.countDocuments(),
      VisitorLog.countDocuments({ isGuest: false }),
      VisitorLog.countDocuments({ isGuest: true }),
      VisitorLog.countDocuments({ permissionStatus: "granted" }),
      VisitorLog.countDocuments({ permissionStatus: { $in: ["denied", "dismissed"] } }),
      VisitorLog.countDocuments({ createdAt: { $gte: today } }),
      VisitorLog.countDocuments({ createdAt: { $gte: week } }),
      VisitorLog.countDocuments({ createdAt: { $gte: month } }),
      // "Unique visitor" = distinct logged-in user, or distinct IP
      // address for guests (no persistent guest identifier exists).
      VisitorLog.aggregate([
        { $group: { _id: { $ifNull: ["$user", "$ipAddress"] } } },
        { $count: "count" },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      message: "Visitor stats fetched successfully",
      data: {
        totalVisitors,
        uniqueVisitors: uniqueVisitorGroups[0]?.count || 0,
        loggedInVisitors,
        guestVisitors,
        permissionAllowed,
        permissionDenied,
        todaysVisitors,
        thisWeeksVisitors,
        thisMonthsVisitors,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch visitor stats",
      data: null,
    });
  }
};

// Shared filter builder for getAllVisitors + exportVisitors, so the
// two never drift apart on what "currently filtered" means.
const buildVisitorFilter = (query) => {
  const { search, isGuest, permissionStatus, deviceType, startDate, endDate } = query;

  const filter = {};

  if (search) {
    filter.$or = [
      { city: { $regex: search, $options: "i" } },
      { state: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
      { browser: { $regex: search, $options: "i" } },
    ];
  }

  if (isGuest !== undefined) filter.isGuest = isGuest === "true";
  if (permissionStatus) filter.permissionStatus = permissionStatus;
  if (deviceType) filter.deviceType = deviceType;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  return filter;
};

// @desc    Recent Visitors table — search/filter/sort/pagination
// @route   GET /api/admin/visitors
// @access  Private (admin only)
export const getAllVisitors = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = buildVisitorFilter(req.query);

    const total = await VisitorLog.countDocuments(filter);

    const visitors = await VisitorLog.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      message: "Visitors fetched successfully",
      data: { visitors, total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch visitors",
      data: null,
    });
  }
};

// @desc    Every currently-filtered record, unpaginated — feeds the
//          "Export CSV" button (CSV file itself is built client-side)
// @route   GET /api/admin/visitors/export
// @access  Private (admin only)
export const exportVisitors = async (req, res) => {
  try {
    const filter = buildVisitorFilter(req.query);

    // Hard cap so a very large table can't be used to build an
    // accidental denial-of-service export; matches the spirit of
    // pagination limits used elsewhere in this codebase.
    const visitors = await VisitorLog.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10000);

    return res.status(200).json({
      success: true,
      message: "Visitors exported successfully",
      data: { visitors },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to export visitors",
      data: null,
    });
  }
};

// @desc    City/state bubbles for the Visitor Map
// @route   GET /api/admin/visitors/map
// @access  Private (admin only)
export const getVisitorMap = async (req, res) => {
  try {
    const today = startOfToday();
    const week = startOfThisWeek();
    const month = startOfThisMonth();

    const bubbles = await VisitorLog.aggregate([
      {
        $match: {
          permissionStatus: "granted",
          latitude: { $ne: null },
          longitude: { $ne: null },
        },
      },
      {
        $group: {
          // Grouped a level finer than before (area, not just city) so
          // nearby-but-distinct neighbourhoods don't collapse into one
          // bubble on the map now that we zoom in that far.
          _id: { area: "$area", city: "$city", state: "$state", country: "$country" },
          district: { $first: "$district" },
          totalVisitors: { $sum: 1 },
          avgLatitude: { $avg: "$latitude" },
          avgLongitude: { $avg: "$longitude" },
          todaysVisitors: { $sum: { $cond: [{ $gte: ["$createdAt", today] }, 1, 0] } },
          thisWeeksVisitors: { $sum: { $cond: [{ $gte: ["$createdAt", week] }, 1, 0] } },
          thisMonthsVisitors: { $sum: { $cond: [{ $gte: ["$createdAt", month] }, 1, 0] } },
        },
      },
      { $sort: { totalVisitors: -1 } },
    ]);

    const formatted = bubbles.map((bubble) => ({
      area: bubble._id.area || null,
      city: bubble._id.city || "Unknown",
      district: bubble.district || null,
      state: bubble._id.state || "Unknown",
      country: bubble._id.country || "Unknown",
      latitude: bubble.avgLatitude,
      longitude: bubble.avgLongitude,
      totalVisitors: bubble.totalVisitors,
      todaysVisitors: bubble.todaysVisitors,
      thisWeeksVisitors: bubble.thisWeeksVisitors,
      thisMonthsVisitors: bubble.thisMonthsVisitors,
    }));

    return res.status(200).json({
      success: true,
      message: "Visitor map data fetched successfully",
      data: { bubbles: formatted },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch visitor map data",
      data: null,
    });
  }
};

// @desc    Delete a single visitor record
// @route   DELETE /api/admin/visitors/:id
// @access  Private (admin only)
export const deleteVisitor = async (req, res) => {
  try {
    const visitor = await VisitorLog.findByIdAndDelete(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor record not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Visitor record deleted",
      data: { deletedId: visitor._id },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete visitor record",
      data: null,
    });
  }
};

// @desc    Delete every visitor record
// @route   DELETE /api/admin/visitors/bulk
// @access  Private (admin only)
export const deleteAllVisitors = async (req, res) => {
  try {
    const result = await VisitorLog.deleteMany({});

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} visitor record(s) deleted permanently`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete all visitor records",
      data: null,
    });
  }
};
