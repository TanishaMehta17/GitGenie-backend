import axios from "axios";

const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

if (!GITHUB_TOKEN) {
    throw new Error("Missing GITHUB_ACCESS_TOKEN in environment variables.");
}

/**
 * Runs a GitHub linting action on the PR.
 */
export const runLinting = async (owner: string, repo: string, prNumber: number) => {
    try {
        // Step 1: Trigger the workflow
        await axios.post(
            `https://api.github.com/repos/${owner}/${repo}/actions/workflows/lint.yml/dispatches`,
            { ref: "main" }, // Adjust branch if needed
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                },
            }
        );

        // Step 2: Wait for a new workflow run to be created
        let runId: number | null = null;
        for (let i = 0; i < 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            const runsResponse = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/actions/runs`,
                {
                    headers: {
                        Authorization: `Bearer ${GITHUB_TOKEN}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                }
            );

            const latestRun = runsResponse.data.workflow_runs.find((run: any) => run.name === "Lint Code");
            if (latestRun) {
                runId = latestRun.id;
                break;
            }
        }

        if (!runId) {
            return { success: false, message: "Failed to find the linting workflow run." };
        }

        // Step 3: Wait for workflow to complete
        let status = "in_progress";
        while (status === "in_progress" || status === "queued") {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            const runStatusResponse = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}`,
                {
                    headers: {
                        Authorization: `Bearer ${GITHUB_TOKEN}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                }
            );

            status = runStatusResponse.data.status;
        }

        // Step 4: Get the workflow conclusion
        const conclusion = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}`,
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                },
            }
        );

        if (conclusion.data.conclusion !== "success") {
            return {
                success: false,
                message: "Linting failed",
                logs: conclusion.data
            };
        }
        

        return { success: true, message: "Linting completed successfully", logs: conclusion.data };

    } catch (error: any) {
        console.error("Error in runLinting:", error?.response?.data || error.message);
        return { success: false, message: "Failed to trigger linting", error: error?.response?.data };
    }
};

/**
 * Assigns a reviewer to the PR based on past contributions.
 */
export const assignReviewer = async (owner: string, repo: string, prNumber: number) => {
    try {
        const contributorsResponse = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/contributors`,
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json"
                }
            }
        );

        const reviewers = contributorsResponse.data.map((contributor: any) => contributor.login);
        const selectedReviewer = reviewers.length > 0 ? reviewers[0] : "default-reviewer";

        await axios.post(
            `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/requested_reviewers`,
            { reviewers: [selectedReviewer] },
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json"
                }
            }
        );

        return { success: true, reviewer: selectedReviewer };
    } catch (error: any) {
        console.error("Error in assignReviewer:", error?.response?.data || error.message);
        return { success: false, message: "No reviewer assigned", error: error?.response?.data };
    }
};

/**
 * Adds a label to a PR.
 */
export const addLabelToPR = async (owner: string, repo: string, prNumber: number, label: string) => {
    try {
        await axios.post(
            `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/labels`,
            { labels: [label] },
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json"
                }
            }
        );

        return { success: true, label };
    } catch (error: any) {
        console.error("Error in addLabelToPR:", error?.response?.data || error.message);
        return { success: false, message: "Failed to add label", error: error?.response?.data };
    }
};
