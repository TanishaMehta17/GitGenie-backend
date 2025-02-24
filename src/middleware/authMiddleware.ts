import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

// Extend Request type to include `userId`
interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header("token"); // Get token from headers
    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    const verified = jwt.verify(token, JWT_SECRET) as { userId: string }; // Verify token
    req.userId = verified.userId; // Attach userId to request

    next(); // Continue to next middleware/controller
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};
