import express from "express";
import { signup, login, TokenisValid, getdata } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Signup route
router.post("/signup", signup);

// Login route
router.post("/login", login);

// Token validation route
router.post("/TokenisValid", TokenisValid);

// Get data route (protected)
router.get("/", authMiddleware as any, getdata); 

export default router;
