import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from './routes/authRoutes'; // Import the authRoutes
import reviewRouter from "./routes/reviewRoutes";

const app = express();

app.use(cors());
app.use(express.json());

// Register the authRoutes
app.use('/auth', authRoutes); // You can change '/auth' to any path you prefer
app.use("/review", reviewRouter);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
