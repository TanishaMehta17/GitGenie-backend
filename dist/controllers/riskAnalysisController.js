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
exports.analyzeRisk = void 0;
const axios_1 = __importDefault(require("axios"));
const aiservice_1 = require("../services/aiservice");
const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN; // Ensure this is set in .env
const analyzeRisk = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
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
            const response = yield axios_1.default.get(url, { headers });
            prDiff = response.data;
        }
        catch (error) {
            console.error("Failed to fetch PR diff:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            res.status(500).json({ success: false, message: "Failed to fetch PR diff", error: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data });
            return;
        }
        // Mock Test Coverage (Replace with real CI/CD integration)
        const testCoverage = Math.floor(Math.random() * 50) + 50; // Random 50-100%
        // Mock Security Findings (Replace with real security tool integration)
        const securityFindings = ["No critical issues", "Minor dependency update needed"];
        console.log("Sending to analyzePRRisk:", { prDiff, testCoverage, securityFindings });
        // Analyze PR risk
        const riskScore = yield (0, aiservice_1.analyzePRRisk)(prDiff, testCoverage, securityFindings);
        res.json({ success: true, riskScore });
    }
    catch (error) {
        console.error("Error in analyzeRisk:", ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message);
        next(error);
    }
});
exports.analyzeRisk = analyzeRisk;
