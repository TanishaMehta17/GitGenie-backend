import { Request, Response, NextFunction } from "express";
import { categorizePR } from "../services/aiservice";
import { addLabelToPR } from "../services/githubService";
import axios from "axios";

export const autoLabelPR = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { prNumber, repoName, owner } = req.body;

        // Validate required parameters
        if (!prNumber || !repoName || !owner) {
            res.status(400).json({ success: false, message: "Missing required parameters" });
            return;
        }

        const githubToken = process.env.GITHUB_ACCESS_TOKEN;
        if (!githubToken) {
            res.status(500).json({ success: false, message: "GitHub token is missing" });
            return;
        }

        // Fetch PR diff
        const url = `https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}`;
        console.log("Fetching PR diff from:", url);

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: "application/vnd.github.v3.diff"
            }
        });

        const prDiff = response.data;
        if (!prDiff) {
            res.status(500).json({ success: false, message: "Failed to retrieve PR diff" });
            return;
        }

        console.log("PR diff fetched successfully");

        // Categorize PR using AI
        const label = await categorizePR(prDiff);
        if (!label) {
            res.status(500).json({ success: false, message: "Failed to categorize PR" });
            return;
        }

        console.log("PR categorized as:", label);

        // Add label to PR using GitHub API
        const labelResult = await addLabelToPR(owner, repoName, prNumber, label);
        if (!labelResult.success) {
            res.status(500).json({ success: false, message: "Failed to add label", error: labelResult.error });
            return;
        }

        res.json({ success: true, label });
    } catch (error: any) {
        console.error("Error in autoLabelPR:", error?.response?.data || error.message);
        res.status(500).json({ success: false, message: "Internal server error", error: error?.message });
    }
};
