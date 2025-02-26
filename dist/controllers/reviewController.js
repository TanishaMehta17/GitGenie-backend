"use strict";
//✅The commented code is wuth open AI but it is not free so I have used Google AI instead of Open AI whose code is below the commented code
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
exports.analyzePR = void 0;
// import axios from "axios";
// import dotenv from "dotenv";
// import { Request, Response, NextFunction } from "express";
// import OpenAI from "openai";
// import { Pinecone } from "@pinecone-database/pinecone";
// dotenv.config();
// const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN as string;
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
// const PINECONE_API_KEY = process.env.PINECONE_API_KEY as string;
// const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string; // Use .env value
// // ✅ OpenAI Initialization
// const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
// // ✅ Pinecone Initialization (Removed `environment`)
// const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
// const index = pinecone.index(PINECONE_INDEX_NAME);
// const fetchPRDiff = async (repoOwner: string, repoName: string, prNumber: number): Promise<string> => {
//   try {
//     const response = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prNumber}.diff`, {
//       headers: {
//         Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
//         Accept: "application/vnd.github.v3.diff",
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching PR diff:", error);
//     throw new Error("Failed to fetch PR diff");
//   }
// };
// const fetchPRDetails = async (repoOwner: string, repoName: string, prNumber: number): Promise<any> => {
//   try {
//     const response = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prNumber}`, {
//       headers: {
//         Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
//         Accept: "application/vnd.github.v3+json",
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching PR details:", error);
//     throw new Error("Failed to fetch PR details");
//   }
// };
// const retrieveRAGContext = async (code: string): Promise<string[]> => {
//   const embeddings = await openai.embeddings.create({
//     model: "text-embedding-ada-002",Context
//     input: code,
//   });
//   const queryVector = embeddings.data[0].embedding;
//   const queryResponse = await index.query({
//     vector: queryVector,
//     topK: 3,
//     includeMetadata: true,  // Ensure metadata is requested
//   });
//   // ✅ Ensure metadata exists before accessing content
//   return queryResponse.matches
//     .map(match => match.metadata?.content as string | undefined)
//     .filter(content => content !== undefined) as string[];
// };
// const analyzeCodeWithAI = async (code: string, context: string[]) => {
//   const prompt = `
//   Review the following code and provide:
//   - Security vulnerabilities (e.g., SQL Injection, XSS, command injection)
//   - Code quality issues (e.g., redundant code, unused variables, performance bottlenecks)
//   - Best practices (e.g., SOLID principles, DRY, clean architecture)
//   - Suggestions for improvement
//   Use the following **best practices & security rules** as context:
//   ${context.join("\n")}
//   Code:
//   ${code}
//   `;
//   const response = await openai.chat.completions.create({
//     model: "gpt-4",
//     messages: [{ role: "user", content: prompt }],
//   });
//   return response.choices[0].message.content;
// };
// const analyzePR = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { repoOwner, repoName, prNumber } = req.body;
//     console.log(`Analyzing PR: ${repoOwner}/${repoName} #${prNumber}`);
//     const prDetails = await fetchPRDetails(repoOwner, repoName, prNumber);
//     const prDiff = await fetchPRDiff(repoOwner, repoName, prNumber);
//     const ragContext = await retrieveRAGContext(prDiff);
//     const aiAnalysis = await analyzeCodeWithAI(prDiff, ragContext);
//     res.json({
//       success: true,
//       prTitle: prDetails.title,
//       author: prDetails.user.login,
//       changes: prDiff,
//       analysis: aiAnalysis,
//     });
//   } catch (error) {
//     console.error("PR analysis failed:", error);
//     res.status(500).json({ error: "PR analysis failed" });
//   }
// };
// export { analyzePR };
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const generative_ai_1 = require("@google/generative-ai");
const pinecone_1 = require("@pinecone-database/pinecone");
dotenv_1.default.config();
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
// Initialize Gemini AI
const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
// Initialize Pinecone
const pinecone = new pinecone_1.Pinecone({ apiKey: PINECONE_API_KEY });
const index = pinecone.index(PINECONE_INDEX_NAME);
// Fetch PR Diff
const fetchPRDiff = (repoOwner, repoName, prNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prNumber}.diff`, {
            headers: {
                Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
                Accept: "application/vnd.github.v3.diff",
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error fetching PR diff:", error);
        throw new Error("Failed to fetch PR diff");
    }
});
// Fetch PR Details
const fetchPRDetails = (repoOwner, repoName, prNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prNumber}`, {
            headers: {
                Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
                Accept: "application/vnd.github.v3+json",
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error fetching PR details:", error);
        throw new Error("Failed to fetch PR details");
    }
});
const retrieveRAGContext = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    // ✅ Ensure input does not exceed 10,000 bytes
    if (code.length > 10000) {
        console.warn("Trimming input to meet API size limits.");
        code = code.substring(0, 10000);
    }
    const embeddingResponse = yield embeddingModel.embedContent({
        content: { role: "user", parts: [{ text: code }] },
    });
    if (!embeddingResponse.embedding || !embeddingResponse.embedding.values) {
        throw new Error("Failed to generate embeddings.");
    }
    const queryVector = embeddingResponse.embedding.values;
    const queryResponse = yield index.query({
        vector: queryVector,
        topK: 3,
        includeMetadata: true,
    });
    return queryResponse.matches
        .map((match) => { var _a; return (_a = match.metadata) === null || _a === void 0 ? void 0 : _a.content; })
        .filter((content) => content !== undefined);
});
const analyzeCodeWithAI = (code, context) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = `Analyze the following **GitHub Pull Request (PR) changes** and provide a structured code review. Your review must cover:
  
  1. **Security Findings** - Identify any security vulnerabilities or unsafe coding practices.
  2. **Code Quality Issues** - Highlight issues affecting readability, maintainability, and efficiency.
  3. **Best Practices** - Identify adherence or violations of coding best practices.
  4. **Improvement Suggestions** - Provide specific, actionable feedback for improving the code.

  **Rules:**
  - **Be specific**: Point out exact lines where issues exist.
  - **Return response as pure JSON, without any markdown formatting (NO triple backticks).**
  - **Don't make assumptions**: If unsure, analyze based on given context.

  **Context for Review:**
  ${context.join("\n")}

  **Code Diff for Review:**
  ${code}

  **Expected JSON Output Format (STRICTLY NO BACKTICKS!):**
  {
    "securityFindings": "Detailed security issues found...",
    "qualityIssues": "Specific code quality concerns...",
    "bestPractices": "How the code follows or violates best practices...",
    "improvementSuggestions": "Actionable suggestions for improvement..."
  }
  `;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const response = yield model.generateContent(prompt);
    let analysis = yield response.response.text();
    // ✅ Fix: Remove markdown formatting to ensure JSON validity
    analysis = analysis.replace(/```json|```/g, "").trim();
    try {
        return JSON.parse(analysis); // Ensure structured JSON output
    }
    catch (error) {
        console.error("AI Response Parsing Failed:", error);
        return {
            securityFindings: "AI failed to analyze security properly.",
            qualityIssues: "AI failed to analyze code quality.",
            bestPractices: "AI failed to analyze best practices.",
            improvementSuggestions: "AI failed to generate improvement suggestions.",
        };
    }
});
const analyzePR = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { repoOwner, repoName, prNumber } = req.body;
        console.log(`Analyzing PR: ${repoOwner}/${repoName} #${prNumber}`);
        const prDetails = yield fetchPRDetails(repoOwner, repoName, prNumber);
        const prDiff = yield fetchPRDiff(repoOwner, repoName, prNumber);
        const ragContext = yield retrieveRAGContext(prDiff);
        console.log("🔍 RAG Search Query:", prDiff);
        console.log("📂 RAG Context Retrieved:", ragContext);
        const aiAnalysis = yield analyzeCodeWithAI(prDiff, ragContext); // ✅ Now ensures a proper response
        const diffSummary = prDiff.length > 500 ? prDiff.substring(0, 500) + "..." : prDiff;
        res.json({
            success: true,
            prTitle: prDetails.title,
            author: prDetails.user.login,
            changedFiles: prDetails.changed_files,
            additions: prDetails.additions,
            deletions: prDetails.deletions,
            totalChanges: prDetails.additions + prDetails.deletions,
            diffSummary,
            analysis: aiAnalysis, // ✅ Now always contains proper data
        });
    }
    catch (error) {
        console.error("PR analysis failed:", error);
        res.status(500).json({ error: "PR analysis failed", details: error });
    }
});
exports.analyzePR = analyzePR;
