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
exports.suggestCodeFixes = void 0;
const axios_1 = __importDefault(require("axios"));
const aiservice_1 = require("../services/aiservice");
const suggestCodeFixes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { owner, repo, pull_number } = req.body;
        if (!owner || !repo || !pull_number) {
            res.status(400).json({ success: false, message: "Missing required parameters: owner, repo, pull_number" });
            return;
        }
        const githubResponse = yield axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`, {
            headers: {
                "Accept": "application/vnd.github.v3.diff",
                "Authorization": `token ${process.env.GITHUB_ACCESS_TOKEN}`
            }
        });
        const prDiff = githubResponse.data;
        const codeFixes = yield (0, aiservice_1.generateCodeFixes)(prDiff);
        res.json({
            success: true,
            fixes: codeFixes
        });
    }
    catch (error) {
        console.error("Error in suggestCodeFixes:", error);
        next(error);
    }
});
exports.suggestCodeFixes = suggestCodeFixes;
