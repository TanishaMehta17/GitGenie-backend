"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLabelToPR = exports.assignReviewer = exports.runLinting = void 0;
const axios_1 = __importDefault(require("axios"));
const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
if (!GITHUB_TOKEN) {
    throw new Error("Missing GITHUB_ACCESS_TOKEN in environment variables.");
}
/**
 * Runs a GitHub linting action on the PR.
 */
const runLinting = (owner, repo, prNumber) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Step 1: Trigger the workflow
        yield axios_1.default.post(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/lint.yml/dispatches`, { ref: "main" }, // Adjust branch if needed
        {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3+json",
            },
        });
        // Step 2: Wait for a new workflow run to be created
        let runId = null;
        for (let i = 0; i < 5; i++) {
            yield new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            const runsResponse = yield axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}/actions/runs`, {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                },
            });
            const latestRun = runsResponse.data.workflow_runs.find((run) => run.name === "Lint Code");
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
            yield new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            const runStatusResponse = yield axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}`, {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                },
            });
            status = runStatusResponse.data.status;
        }
        // Step 4: Get the workflow conclusion
        const conclusion = yield axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}`, {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3+json",
            },
        });
        if (conclusion.data.conclusion !== "success") {
            return {
                success: false,
                message: "Linting failed",
                logs: conclusion.data
            };
        }
        return { success: true, message: "Linting completed successfully", logs: conclusion.data };
    }
    catch (error) {
        console.error("Error in runLinting:", ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        return { success: false, message: "Failed to trigger linting", error: (_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.data };
    }
});
exports.runLinting = runLinting;
/**
 * Assigns a reviewer to the PR based on past contributions.
 */
const assignReviewer = (owner, repo, prNumber) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const contributorsResponse = yield axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}/contributors`, {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3+json"
            }
        });
        const reviewers = contributorsResponse.data.map((contributor) => contributor.login);
        const selectedReviewer = reviewers.length > 0 ? reviewers[0] : "default-reviewer";
        yield axios_1.default.post(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/requested_reviewers`, { reviewers: [selectedReviewer] }, {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3+json"
            }
        });
        return { success: true, reviewer: selectedReviewer };
    }
    catch (error) {
        console.error("Error in assignReviewer:", ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        return { success: false, message: "No reviewer assigned", error: (_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.data };
    }
});
exports.assignReviewer = assignReviewer;
/**
 * Adds a label to a PR.
 */
const addLabelToPR = (owner, repo, prNumber, label) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const githubToken = process.env.GITHUB_ACCESS_TOKEN;
        if (!githubToken) {
            throw new Error("GitHub token is missing");
        }
        const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/labels`;
        console.log("Adding label to PR:", url);
        const response = yield axios_1.default.post(url, { labels: [label] }, {
            headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: "application/vnd.github.v3+json"
            }
        });
        console.log("Label added successfully:", response.data);
        return { success: true, label };
    }
    catch (error) {
        console.error("Error in addLabelToPR:", ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        return { success: false, message: "Failed to add label", error: (_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.data };
    }
});
exports.addLabelToPR = addLabelToPR;
