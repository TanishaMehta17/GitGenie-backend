import axios from "axios";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

dotenv.config();

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Function to fetch PR diff (code changes)
const fetchPRDiff = async (repoOwner: string, repoName: string, prNumber: number): Promise<string> => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prNumber}.diff`, {
      headers: {
        Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
        Accept: "application/vnd.github.v3.diff",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching PR diff:", error);
    throw new Error("Failed to fetch PR diff");
  }
};

// Function to fetch PR details from GitHub
const fetchPRDetails = async (repoOwner: string, repoName: string, prNumber: number): Promise<any> => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prNumber}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching PR details:", error);
    throw new Error("Failed to fetch PR details");
  }
};


const analyzePR = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { repoOwner, repoName, prNumber } = req.body;
  
      // Print the URL being requested
      const githubUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prNumber}`;
      console.log("Fetching data from:", githubUrl);
  
      const response = await axios.get(githubUrl, {
        headers: {
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "Your-App-Name"  // Avoids GitHub API restrictions
        }
      });
  
      res.json(response.data);
    } catch (error) {
      console.error("Axios request failed:", error);
      res.status(500).json({ error: "Failed to fetch PR data" });
    }
  };

 export { analyzePR };
// import axios from "axios";
// import dotenv from "dotenv";
// import { Request, Response, NextFunction } from "express";
// import { Configuration, OpenAIApi } from "openai";
// import { PineconeClient } from "@pinecone-database/pinecone";

// dotenv.config();

// const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
// const PINECONE_INDEX_NAME = "code-reviews";

// // Initialize OpenAI
// const openai = new OpenAIApi(
//   new Configuration({ apiKey: OPENAI_API_KEY })
// );

// // Initialize Pinecone
// const pinecone = new PineconeClient();
// await pinecone.init({ apiKey: PINECONE_API_KEY });

// const index = pinecone.Index(PINECONE_INDEX_NAME);

// /**
//  * Fetch PR diff (code changes)
//  */
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

// /**
//  * Fetch PR details from GitHub
//  */
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

// /**
//  * Retrieve relevant security & best practices context from Pinecone (RAG)
//  */
// const retrieveRAGContext = async (code: string): Promise<string[]> => {
//   const embeddings = await openai.createEmbedding({
//     model: "text-embedding-ada-002",
//     input: code,
//   });

//   const queryVector = embeddings.data.data[0].embedding;
//   const queryResponse = await index.query({
//     vector: queryVector,
//     topK: 3,
//     includeMetadata: true,
//   });

//   return queryResponse.matches.map(match => match.metadata.content);
// };

// /**
//  * AI-powered code analysis (security, best practices, optimization)
//  */
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

//   const response = await openai.createChatCompletion({
//     model: "gpt-4",
//     messages: [{ role: "user", content: prompt }],
//   });

//   return response.data.choices[0].message?.content;
// };

// /**
//  * Analyze PR: Fetch details, AI-powered analysis, and RAG-based suggestions
//  */
// const analyzePR = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { repoOwner, repoName, prNumber } = req.body;

//     console.log(`Analyzing PR: ${repoOwner}/${repoName} #${prNumber}`);

//     // Fetch PR details & code diff
//     const prDetails = await fetchPRDetails(repoOwner, repoName, prNumber);
//     const prDiff = await fetchPRDiff(repoOwner, repoName, prNumber);

//     // Retrieve security & best practice context from Pinecone (RAG)
//     const ragContext = await retrieveRAGContext(prDiff);

//     // AI-powered analysis
//     const aiAnalysis = await analyzeCodeWithAI(prDiff, ragContext);

//     // Construct response
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
