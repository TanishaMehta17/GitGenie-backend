import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
import { signup, login, TokenisValid, getdata } from '../controllers/authController';
// import { authMiddleware } from '../middleware/authMiddleware';

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);



// Token validation route
router.post('/TokenisValid', TokenisValid);

// Get data route (protected)
router.get('/', getdata);

export default router;
