import { Request, Response, NextFunction } from "express";
import { analyzePRRisk } from "../services/aiservice";

export const analyzeRisk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { prDiff, testCoverage, securityFindings } = req.body;

        if (!prDiff || !testCoverage || !securityFindings) {
            res.status(400).json({ success: false, message: "Missing required parameters" });
            return;
        }

        const riskScore = await analyzePRRisk(prDiff, testCoverage, securityFindings);

        res.json({ success: true, riskScore });
    } catch (error) {
        console.error("Error in analyzeRisk:", error);
        next(error); // Properly call `next` with the error
    }
};
