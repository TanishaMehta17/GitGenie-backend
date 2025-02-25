import { Request, Response, NextFunction } from "express";
import { categorizePR } from "../services/aiservice";
import { addLabelToPR } from "../services/githubService";

export const autoLabelPR = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { prNumber, repoName, owner, prDiff } = req.body;

        // Validate required parameters
        if (!prNumber || !repoName || !owner || !prDiff) {
            res.status(400).json({ success: false, message: "Missing required parameters" });
            return;
        }

        const label = await categorizePR(prDiff); // AI determines label
        await addLabelToPR(owner, repoName, prNumber, label); // GitHub API adds label

        res.json({ success: true, label });
    } catch (error) {
        console.error("Error in autoLabelPR:", error);
        next(error); // Pass error to Express error handling middleware
    }
};
