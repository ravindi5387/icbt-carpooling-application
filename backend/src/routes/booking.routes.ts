import { Router } from "express";
import {
  request,
  myBookings,
  rideRequests,
  accept,
  reject,
  cancel,
} from "../controllers/booking.controller";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

// Passenger: Request to join a ride
router.post(
  "/rides/:rideId/request",
  authenticate,
  authorize("PASSENGER", "DRIVER", "ADMIN"),
  request
);

// Passenger: Get my bookings
router.get(
  "/my",
  authenticate,
  myBookings
);

// Driver: Get requests for their ride
router.get(
  "/rides/:rideId/requests",
  authenticate,
  authorize("DRIVER", "ADMIN"),
  rideRequests
);

// Driver: Accept a request
router.patch(
  "/requests/:bookingId/accept",
  authenticate,
  authorize("DRIVER", "ADMIN"),
  accept
);

// Driver: Reject a request
router.patch(
  "/requests/:bookingId/reject",
  authenticate,
  authorize("DRIVER", "ADMIN"),
  reject
);

// Passenger/Driver: Cancel a booking
router.patch(
  "/bookings/:bookingId/cancel",
  authenticate,
  cancel
);

export default router;