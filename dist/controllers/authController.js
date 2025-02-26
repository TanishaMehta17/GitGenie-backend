"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getdata = exports.TokenisValid = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client"); // Adjust based on the Prisma Client setup
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, confirmpas } = req.body;
    console.log(req.body);
    try {
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({
            where: { email: req.body.email },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash the password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create new user
        const newUser = yield prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        res.status(200).json({ message: "User created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating user", error });
    }
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        // If user is not found, return a generic error
        if (!user) {
            return res.status(400).json({
                isSuccess: false,
                message: "Invalid credentials",
            });
        }
        // Compare the provided password with the stored hashed password
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                isSuccess: false,
                message: "Invalid credentials",
            });
        }
        // Generate a JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" } // Token expires in 1 hour
        );
        res.status(200).json({
            token,
            email: user.email,
            username: user.name,
            id: user.id,
            password: user.password,
        });
    }
    catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            isSuccess: false,
            message: "An error occurred while logging in",
        });
    }
});
exports.login = login;
const TokenisValid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.header("token");
        if (!token)
            return res.json(false);
        const verified = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!verified)
            return res.json(false);
        const user = yield prisma.user.findUnique({
            where: { id: verified.userId },
        });
        if (!user)
            return res.json(false);
        res.json(true);
    }
    catch (e) {
        if (e instanceof Error) {
            res.status(500).json({ error: e.message });
        }
        else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});
exports.TokenisValid = TokenisValid;
const getdata = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userId) {
            res.status(400).json({ message: "User ID not found in request" });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { id: req.userId },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const token = req.header("token");
        res.json({
            email: user.email,
            username: user.name,
            id: req.userId,
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
    }
});
exports.getdata = getdata;
