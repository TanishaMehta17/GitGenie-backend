import express from "express";
import cors from "cors";
import { graphqlHTTP } from "express-graphql";
import authRoutes from './routes/authRoutes'; // Import the authRoutes

const app = express();

app.use(cors());
app.use(express.json());

// Register the authRoutes
app.use('/auth', authRoutes); // You can change '/auth' to any path you prefer

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
