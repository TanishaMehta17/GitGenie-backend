"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authRoutes_1 = __importDefault(require("./routes/authRoutes")); // Import the authRoutes
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Register the authRoutes
app.use('/auth', authRoutes_1.default); // You can change '/auth' to any path you prefer
app.use("/review", reviewRoutes_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
