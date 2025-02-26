import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { analyzePRRisk } from "../services/aiservice";

const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN; // Ensure this is set in .env

export const analyzeRisk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { owner, repo, prNumber } = req.body;

        if (!owner || !repo || !prNumber) {
            res.status(400).json({ success: false, message: "Missing required parameters: owner, repo, prNumber" });
            return;
        }

        // Fetch PR Diff from GitHub
        let prDiff = "";
        try {
            const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
            const headers = {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3.diff",
            };
            const response = await axios.get(url, { headers });
            prDiff = response.data;
        } catch (error: any) {
            console.error("Failed to fetch PR diff:", error.response?.data || error.message);
            res.status(500).json({ success: false, message: "Failed to fetch PR diff", error: error.response?.data });
            return;
        }

        // Mock Test Coverage (Replace with real CI/CD integration)
        const testCoverage = Math.floor(Math.random() * 50) + 50; // Random 50-100%

        // Mock Security Findings (Replace with real security tool integration)
        const securityFindings = ["No critical issues", "Minor dependency update needed"];

        console.log("Sending to analyzePRRisk:", { prDiff, testCoverage, securityFindings });

        // Analyze PR risk
        const riskScore = await analyzePRRisk(prDiff, testCoverage, securityFindings);

        res.json({ success: true, riskScore });
    } catch (error: any) {
        console.error("Error in analyzeRisk:", error.response?.data || error.message);
        next(error);
    }
};
