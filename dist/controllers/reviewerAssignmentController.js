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
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignPRReviewer = void 0;
const githubService_1 = require("../services/githubService");
const assignPRReviewer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prNumber, repoName, owner } = req.body;
        // Validate required parameters
        if (!prNumber || !repoName || !owner) {
            res.status(400).json({ success: false, message: "Missing required parameters" });
            return;
        }
        const assignedReviewer = yield (0, githubService_1.assignReviewer)(owner, repoName, prNumber);
        res.json({
            success: true,
            assignedReviewer
        });
    }
    catch (error) {
        console.error("Error in assignPRReviewer:", error);
        next(error); // Pass error to Express error handling middleware
    }
});
exports.assignPRReviewer = assignPRReviewer;
