import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";

import { notFound, globalErrorHandler } from "./middleware/errorHandler.js";

const app = express();

// Render (and most PaaS hosts) sit the app behind a reverse proxy, so
// `req.ip` would otherwise resolve to the proxy's internal address
// instead of the visitor's real IP. Needed for Visitor Analytics
// (visitorController.js reads req.ip to store `ipAddress`) — doesn't
// change any existing behavior since nothing else previously relied
// on req.ip.
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());

// Lightweight, no-DB-dependency endpoint for uptime pingers (e.g.
// cron-job.org / UptimeRobot) to hit every ~10 minutes. Keeps the
// Render free-tier instance from spinning down after 15 minutes of
// inactivity, which was causing the very first request after a gap
// to time out (cold start) instead of getting a response.
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/visitors", visitorRoutes);

app.use(notFound);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

// `connectDB()` is async but was previously fired-and-forgotten, so
// `app.listen()` used to run immediately after — the server could
// start accepting requests (and multer could start accepting file
// uploads) before Mongoose had actually finished connecting to
// MongoDB Atlas. Any request that reached a DB operation during that
// window (e.g. `Product.create` in createProduct, right after the
// image upload step) got queued in Mongoose's command buffer and
// could stall or fail outright if the connection wasn't ready in
// time — most noticeable on the first request right after a (re)start,
// which is exactly what nodemon does on every save during active
// development. Awaiting here guarantees the DB is connected before a
// single request can be accepted, removing that startup race
// entirely rather than just narrowing its window.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
