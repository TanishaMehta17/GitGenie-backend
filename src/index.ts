import express from "express";
import cors from "cors";
import { graphqlHTTP } from "express-graphql";


const app = express();

app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
