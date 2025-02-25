import { Request, Response, NextFunction } from "express";
import { runLinting } from "../services/githubService";

export const lintCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { owner, repo, prNumber } = req.body;

        // Validate required parameters
        if (!owner || !repo || !prNumber) {
            res.status(400).json({ success: false, message: "Missing required parameters" });
            return;
        }

        const response = await runLinting(owner, repo, prNumber);

        res.json({
            success: response.success,
            message: response.message || "Linting triggered successfully",
            logs: response.logs || undefined, // Include logs for debugging
            error: response.error || undefined, // Only include error if it exists
        });
        
    } catch (error) {
        console.error("Error in lintCode:", error);
        next(error); // Pass error to Express error handling middleware
    }
};
