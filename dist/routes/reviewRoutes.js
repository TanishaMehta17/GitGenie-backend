"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const riskAnalysisController_1 = require("../controllers/riskAnalysisController");
const labellingController_1 = require("../controllers/labellingController");
const reviewerAssignmentController_1 = require("../controllers/reviewerAssignmentController");
const lintingController_1 = require("../controllers/lintingController");
const codeFixingController_1 = require("../controllers/codeFixingController");
const reviewRouter = express_1.default.Router();
reviewRouter.post("/analyze-pr", (req, res, next) => (0, reviewController_1.analyzePR)(req, res, next));
reviewRouter.post("/analyze-risk", (req, res, next) => (0, riskAnalysisController_1.analyzeRisk)(req, res, next));
reviewRouter.post("/auto-label-pr", (req, res, next) => (0, labellingController_1.autoLabelPR)(req, res, next));
reviewRouter.post("/assign-reviewer", (req, res, next) => (0, reviewerAssignmentController_1.assignPRReviewer)(req, res, next));
reviewRouter.post("/lint-code", (req, res, next) => (0, lintingController_1.lintCode)(req, res, next));
reviewRouter.post("/suggest-code-fixes", (req, res, next) => (0, codeFixingController_1.suggestCodeFixes)(req, res, next));
exports.default = reviewRouter;
