import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { generateCodeFixes } from "../services/aiservice";

export const suggestCodeFixes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { owner, repo, pull_number } = req.body;

        if (!owner || !repo || !pull_number) {
            res.status(400).json({ success: false, message: "Missing required parameters: owner, repo, pull_number" });
            return;
        }

        const githubResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`, {
            headers: {
                "Accept": "application/vnd.github.v3.diff",
                "Authorization": `token ${process.env.GITHUB_ACCESS_TOKEN}`
            }
        });

        const prDiff = githubResponse.data;
        const codeFixes = await generateCodeFixes(prDiff);

        res.json({
            success: true,
            fixes: codeFixes
        });
    } catch (error) {
        console.error("Error in suggestCodeFixes:", error);
        next(error);
    }
};
