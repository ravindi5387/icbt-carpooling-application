import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("ACTUAL ERROR:", error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues,  
    });
  }

  // Custom error messages
  if (error instanceof Error) {
    if (error.message === "Email already registered") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Invalid email or password") {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Default internal server error
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}