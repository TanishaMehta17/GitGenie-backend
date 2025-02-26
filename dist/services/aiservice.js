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
exports.generateCodeFixes = generateCodeFixes;
exports.analyzePRRisk = analyzePRRisk;
exports.categorizePR = categorizePR;
const dotenv_1 = __importDefault(require("dotenv"));
const generative_ai_1 = require("@google/generative-ai");
dotenv_1.default.config();
/**
 * Calls Gemini AI with RAG to generate code fixes based on PR diff.
 */
function generateCodeFixes(prDiff) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            if (!prDiff) {
                throw new Error("PR diff is required.");
            }
            const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result = yield model.generateContent({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `Suggest code fixes for the following PR diff:\n${prDiff}`
                            }
                        ]
                    }
                ]
            });
            const fixesText = ((_a = result.response) === null || _a === void 0 ? void 0 : _a.text()) || "No fixes generated.";
            const fixes = fixesText.split("\n").filter((fix) => fix.trim() !== "");
            return {
                fixes,
                explanation: "These fixes are generated based on best coding practices and potential improvements identified in the PR diff."
            };
        }
        catch (error) {
            console.error("Error in generateCodeFixes:", error);
            return { fixes: ["Error generating code fixes"], explanation: "An error occurred while generating fixes." };
        }
    });
}
/**
 * Analyzes PR risk using Gemini AI based on code changes, test coverage, and security findings.
 */
function analyzePRRisk(prDiff, testCoverage, securityFindings) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            if (!prDiff) {
                throw new Error("PR diff is required.");
            }
            const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result = yield model.generateContent({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `Analyze the risk level of this PR based on the given details:\n
                - Code changes (diff):\n${prDiff}\n
                - Test coverage: ${testCoverage}%\n
                - Security findings: ${securityFindings.join(", ")}\n
                - Provide a risk score between 0 and 1.
                - Explain why this risk score was given, mentioning factors like breaking changes, security concerns, performance issues, or test coverage gaps.
                
                Format response strictly as JSON:
                {
                  "riskScore": <numerical_value>,
                  "explanation": "<brief_reasoning>"
                }`,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    maxOutputTokens: 150, // Ensure detailed reasoning
                    temperature: 0.3,
                },
            });
            // Ensure we get a valid response
            const rawText = yield result.response.text();
            console.log("Raw AI Response:", rawText); // Debugging
            // Extract JSON using regex (to handle extra text)
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("AI response does not contain valid JSON.");
            }
            const aiResponse = JSON.parse(jsonMatch[0]);
            return {
                riskScore: (_a = aiResponse.riskScore) !== null && _a !== void 0 ? _a : 0,
                explanation: (_b = aiResponse.explanation) !== null && _b !== void 0 ? _b : "No explanation provided.",
            };
        }
        catch (error) {
            console.error("Error in analyzePRRisk:", error.message);
            return {
                riskScore: 0,
                explanation: "Unable to analyze PR risk due to an error.",
            };
        }
    });
}
/**
 * Uses Gemini AI to categorize a PR based on its changes.
 */
function categorizePR(prDiff) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!prDiff) {
                throw new Error("PR diff is required.");
            }
            const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = yield model.generateContent({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: `Provide only a single GitHub label name for this PR. The label should be one of: ["bug", "enhancement", "documentation", "performance", "security", "configuration"]. Do NOT provide explanations.\n\nPR Diff:\n${prDiff}` }],
                    },
                ],
                generationConfig: {
                    maxOutputTokens: 10, // Limit output to a single word
                    temperature: 0.1,
                },
            });
            const generatedText = result.response.text().trim();
            // Validate that the response is one of the allowed GitHub labels
            const validLabels = ["bug", "enhancement", "documentation", "performance", "security", "configuration"];
            if (!validLabels.includes(generatedText)) {
                console.warn("Invalid label generated:", generatedText);
                return "uncategorized"; // Default if invalid
            }
            return generatedText;
        }
        catch (error) {
            console.error("Error in categorizePR:", error.message);
            return "uncategorized";
        }
    });
}
;
