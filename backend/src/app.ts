import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import rideRoutes from "./routes/ride.routes";
import bookingRoutes from "./routes/booking.routes";
import messageRoutes from "./routes/message.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "10kb" }));

app.use(express.urlencoded({
  extended: true,
  limit: "10kb",
}));

app.use(morgan("dev"));

// ✅ Root route
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to ICBT Carpooling API",
    endpoints: {
      health: "/api/health",
      register: "/api/auth/register",
      login: "/api/auth/login",
      rides: "/api/rides",
      bookings: "/api/bookings",
      vehicles: "/api/vehicles",
      messages: "/api/messages",
    },
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Carpooling API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/vehicles", vehicleRoutes);

app.use(errorHandler);

export default app;