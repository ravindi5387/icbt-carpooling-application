import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: "PASSENGER" | "DRIVER" | "ADMIN";
  };
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        message: "Invalid authorization header",
      });
      return;
    }

    const decoded = verifyToken(token);

    // Convert to AuthRequest format with type assertion
    (req as AuthRequest).user = {
      userId: decoded.userId,
      role: decoded.role as "PASSENGER" | "DRIVER" | "ADMIN",
    };

    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user exists
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    // Log for debugging
    console.log("User role:", user.role);
    console.log("Allowed roles:", allowedRoles);

 
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        message: "You do not have permission",
      });
      return;
    }

    next();
  };
};