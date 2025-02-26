"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const authMiddleware = (req, res, next) => {
    try {
        const token = req.header("token"); // Get token from headers
        if (!token) {
            return res.status(401).json({ message: "Access Denied. No token provided." });
        }
        const verified = jsonwebtoken_1.default.verify(token, JWT_SECRET); // Verify token
        req.userId = verified.userId; // Attach userId to request
        next(); // Continue to next middleware/controller
    }
    catch (error) {
        res.status(401).json({ message: "Invalid Token" });
    }
};
exports.authMiddleware = authMiddleware;
