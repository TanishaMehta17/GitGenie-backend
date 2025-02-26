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
exports.autoLabelPR = void 0;
const aiservice_1 = require("../services/aiservice");
const githubService_1 = require("../services/githubService");
const axios_1 = __importDefault(require("axios"));
const autoLabelPR = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const response = yield axios_1.default.get(url, {
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
        const label = yield (0, aiservice_1.categorizePR)(prDiff);
        if (!label) {
            res.status(500).json({ success: false, message: "Failed to categorize PR" });
            return;
        }
        console.log("PR categorized as:", label);
        // Add label to PR using GitHub API
        const labelResult = yield (0, githubService_1.addLabelToPR)(owner, repoName, prNumber, label);
        if (!labelResult.success) {
            res.status(500).json({ success: false, message: "Failed to add label", error: labelResult.error });
            return;
        }
        res.json({ success: true, label });
    }
    catch (error) {
        console.error("Error in autoLabelPR:", ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500).json({ success: false, message: "Internal server error", error: error === null || error === void 0 ? void 0 : error.message });
    }
});
exports.autoLabelPR = autoLabelPR;
