import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}

export interface JwtPayload {
    userId: number;
    role: "PASSENGER" | "DRIVER" | "ADMIN";
}

export function generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "15m",
    });
}

export function verifyToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as JwtPayload;
}