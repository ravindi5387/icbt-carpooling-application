import { Request, Response, NextFunction } from "express";

type UserRole = "PASSENGER" | "DRIVER" | "ADMIN";

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        message: "Access denied",
      });
      return;
    }

    next();
  };
};