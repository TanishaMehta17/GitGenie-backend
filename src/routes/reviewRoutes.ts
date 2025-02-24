import express, { Request, Response, NextFunction } from "express";
import { analyzePR } from "../controllers/reviewController";

const reviewRouter = express.Router();

// Ensure analyzePR is treated as middleware
reviewRouter.post("/analyze-pr", (req: Request, res: Response, next: NextFunction) => analyzePR(req, res, next));

export default reviewRouter;
