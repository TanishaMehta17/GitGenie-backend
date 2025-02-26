"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Signup route
router.post("/signup", authController_1.signup);
// Login route
router.post("/login", authController_1.login);
// Token validation route
router.post("/TokenisValid", authController_1.TokenisValid);
// Get data route (protected)
router.get("/", authMiddleware_1.authMiddleware, authController_1.getdata);
exports.default = router;
