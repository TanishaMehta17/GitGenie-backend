// import { Request, Response, NextFunction } from "express";
// import axios from "axios";
// import { analyzePRRisk } from "../services/aiservice";

// const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN; // Ensure this is set in .env

// export const analyzeRisk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         const { owner, repo, prNumber } = req.body;

//         if (!owner || !repo || !prNumber) {
//             res.status(400).json({ success: false, message: "Missing required parameters: owner, repo, prNumber" });
//             return;
//         }

//         // Fetch PR Diff from GitHub
//         let prDiff = "";
//         try {
//             const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
//             const headers = {
//                 Authorization: `Bearer ${GITHUB_TOKEN}`,
//                 Accept: "application/vnd.github.v3.diff",
//             };
//             const response = await axios.get(url, { headers });
//             prDiff = response.data;
//         } catch (error: any) {
//             console.error("Failed to fetch PR diff:", error.response?.data || error.message);
//             res.status(500).json({ success: false, message: "Failed to fetch PR diff", error: error.response?.data });
//             return;
//         }

//         // Mock Test Coverage (Replace with real CI/CD integration)
//         const testCoverage = Math.floor(Math.random() * 50) + 50; // Random 50-100%

//         // Mock Security Findings (Replace with real security tool integration)
//         const securityFindings = ["No critical issues", "Minor dependency update needed"];

//         console.log("Sending to analyzePRRisk:", { prDiff, testCoverage, securityFindings });

//         // Analyze PR risk
//         const riskScore = await analyzePRRisk(prDiff, testCoverage, securityFindings);

//         res.json({ success: true, riskScore });
//     } catch (error: any) {
//         console.error("Error in analyzeRisk:", error.response?.data || error.message);
//         next(error);
//     }
// };

import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { analyzePRRisk } from "../services/aiservice";
import dotenv from "dotenv";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const CODECOV_TOKEN = process.env.CODECOV_TOKEN;

if (!GITHUB_TOKEN || !CODECOV_TOKEN) {
    console.error("❌ Missing API tokens! Ensure .env contains GITHUB_ACCESS_TOKEN and CODECOV_TOKEN.");
    process.exit(1);
}

export const analyzeRisk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { owner, repo, prNumber } = req.body;

        if (!owner || !repo || !prNumber) {
            res.status(400).json({ success: false, message: "Missing required parameters: owner, repo, prNumber" });
            return;
        }

        // ✅ Fetch Default Branch from GitHub
        let defaultBranch = "main";
        try {
            const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
            });
            if (repoResponse.status === 200) {
                defaultBranch = repoResponse.data.default_branch || "main";
            }
        } catch (error: any) {
            console.warn("⚠ Failed to fetch default branch:", error.response?.data || error.message);
        }

        // ✅ Fetch PR Diff (Ensure it's valid)
        let prDiff = "";
        try {
            const diffResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}.diff`, {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
                responseType: "text",
            });

            if (diffResponse.status === 200) {
                prDiff = diffResponse.data.trim();
            }

            if (!prDiff || prDiff.length < 10) {
                throw new Error("PR diff is empty or too short.");
            }
        } catch (error: any) {
            console.error("⚠ Failed to fetch PR diff:", error.response?.data || error.message);
            res.status(500).json({ success: false, message: "Failed to fetch PR diff", error: error.response?.data });
            return;
        }

        // ✅ Fetch Test Coverage from Codecov
        let testCoverage = 0; // Default to 0%
        try {
            const codecovResponse = await axios.get(`https://codecov.io/api/v2/github/${owner}/repos/${repo}/branches/${defaultBranch}`, {
                headers: { Authorization: `token ${CODECOV_TOKEN}` }
            });

            if (codecovResponse.status === 200 && codecovResponse.data.commit?.totals?.c !== undefined) {
                testCoverage = parseFloat(codecovResponse.data.commit.totals.c) || 0;
            }
        } catch (error: any) {
            console.error("⚠ Failed to fetch test coverage:", error.response?.data || error.message);
        }

        // ✅ Fetch Security Findings from GitHub Security API
        let securityFindings: string[] = ["Security scan unavailable"];
        try {
            const securityResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/code-scanning/alerts`, {
                headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
            });

            if (securityResponse.status === 200 && Array.isArray(securityResponse.data)) {
                securityFindings = securityResponse.data.length > 0
                    ? securityResponse.data.map((alert: any) => alert.rule.description)
                    : ["No security issues detected"];
            }
        } catch (error: any) {
            console.warn("⚠ Failed to fetch security findings:", error.response?.data || error.message);
        }

        // ✅ Analyze PR Risk with AI
        console.log("🚀 Sending to analyzePRRisk:", { testCoverage, securityFindings });

        const riskAnalysis = await analyzePRRisk(prDiff, testCoverage, securityFindings);

        res.json({ success: true, riskAnalysis });
    } catch (error: any) {
        console.error("❌ Error in analyzeRisk:", error.response?.data || error.message);
        next(error);
    }
};
