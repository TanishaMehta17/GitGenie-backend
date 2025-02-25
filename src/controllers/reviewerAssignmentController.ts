import { Request, Response, NextFunction } from "express";
import { assignReviewer } from "../services/githubService";

export const assignPRReviewer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { prNumber, repoName, owner } = req.body;

        // Validate required parameters
        if (!prNumber || !repoName || !owner) {
            res.status(400).json({ success: false, message: "Missing required parameters" });
            return;
        }

        const assignedReviewer = await assignReviewer(owner, repoName, prNumber);

        res.json({
            success: true,
            assignedReviewer
        });
    } catch (error) {
        console.error("Error in assignPRReviewer:", error);
        next(error); // Pass error to Express error handling middleware
    }
};
