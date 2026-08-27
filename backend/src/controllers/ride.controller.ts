import { Request, Response, NextFunction } from "express";
import {
  createRide,
  getRides,
  getRideById,
} from "../services/ride.service";
import { createRideSchema } from "../validators/ride.validator";
import { AuthRequest } from "../middleware/auth.middleware";

export async function create(
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

    const { origin, destination, departureTime, availableSeats, price, vehicleId, description } = req.body;

    console.log("Request body:", req.body);  // ← Debug log

    const ride = await createRide({
      driverId: req.user.userId,
      vehicleId: Number(vehicleId),  // ← Convert to number!
      origin,
      destination,
      departureTime,
      availableSeats: Number(availableSeats),
      price: Number(price),
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Ride created successfully",
      data: ride,
    });
  } catch (error) {
    console.error("ACTUAL ERROR:", error);
    next(error);
  }
}

export async function list(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rides = await getRides();

    return res.status(200).json({
      success: true,
      data: rides,
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride ID",
      });
    }

    const ride = await getRideById(id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    next(error);
  }
}