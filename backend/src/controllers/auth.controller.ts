import { Request, Response, NextFunction } from "express";
import {
  registerUser,
  loginUser,
} from "../services/auth.service";
import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = registerSchema.parse(req.body);

    const user = await registerUser(data);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = loginSchema.parse(req.body);

    const result = await loginUser(
      data.email,
      data.password
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}