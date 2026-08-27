import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  requestRide,
  getMyBookings,
  getRideRequests,
  acceptRequest,
  rejectRequest,
  cancelBooking,
} from "../services/booking.service";

export async function request(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rideId = Number(req.params.rideId);  
    const { seats } = req.body;  

    if (!rideId || !seats) {
      return res.status(400).json({
        success: false,
        message: "rideId and seats are required",
      });
    }

    const booking = await requestRide({
      passengerId: req.user.userId,
      rideId: rideId,
      seats: Number(seats),
    });

    return res.status(201).json({
      success: true,
      message: "Ride requested successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}
export async function myBookings(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const bookings = await getMyBookings(req.user.userId);

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
}

export async function rideRequests(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rideId = Number(req.params.rideId);

    if (!rideId) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride ID",
      });
    }

    const requests = await getRideRequests(rideId, req.user.userId);

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
}

export async function accept(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const bookingId = Number(req.params.bookingId);

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await acceptRequest(bookingId, req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Request accepted successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

export async function reject(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const bookingId = Number(req.params.bookingId);

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await rejectRequest(bookingId, req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Request rejected successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancel(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const bookingId = Number(req.params.bookingId);

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await cancelBooking(bookingId, req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}
