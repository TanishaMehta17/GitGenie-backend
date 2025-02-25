import express, { Request, Response, NextFunction } from "express";
import { analyzePR } from "../controllers/reviewController";
import { analyzeRisk } from "../controllers/riskAnalysisController";
import { autoLabelPR } from "../controllers/labellingController";
import { assignPRReviewer } from "../controllers/reviewerAssignmentController";
import { lintCode } from "../controllers/lintingController";
import{suggestCodeFixes} from "../controllers/codeFixingController";
const reviewRouter = express.Router();


reviewRouter.post("/analyze-pr", (req: Request, res: Response, next: NextFunction) => analyzePR(req, res, next));
reviewRouter.post("/analyze-risk", (req: Request, res: Response, next: NextFunction) => analyzeRisk(req, res, next));
reviewRouter.post("/auto-label-pr", (req: Request, res: Response, next: NextFunction) => autoLabelPR(req, res, next));
reviewRouter.post("/assign-reviewer", (req: Request, res: Response, next: NextFunction) => assignPRReviewer(req, res, next));
reviewRouter.post("/lint-code", (req: Request, res: Response, next: NextFunction) => lintCode(req, res, next));
reviewRouter.post("/suggest-code-fixes", (req: Request, res: Response, next: NextFunction) => suggestCodeFixes(req, res, next));



export default reviewRouter;
