
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";



dotenv.config();


/**
 * Calls Gemini AI with RAG to generate code fixes based on PR diff.
 */
export async function generateCodeFixes(prDiff: string): Promise<{ fixes: string[]; explanation: string }> {
    try {
        if (!prDiff) {
            throw new Error("PR diff is required.");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const result = await model.generateContent({
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

        const fixesText = result.response?.text() || "No fixes generated.";

        const fixes = fixesText.split("\n").filter((fix: string) => fix.trim() !== "");

        return {
            fixes,
            explanation: "These fixes are generated based on best coding practices and potential improvements identified in the PR diff."
        };
    } catch (error) {
        console.error("Error in generateCodeFixes:", error);
        return { fixes: ["Error generating code fixes"], explanation: "An error occurred while generating fixes." };
    }
}


/**
 * Analyzes PR risk using Gemini AI based on code changes, test coverage, and security findings.
 */

export async function analyzePRRisk(
    prDiff: string,
    testCoverage: number,
    securityFindings: string[]
  ): Promise<{ riskScore: number; explanation: string }> {
    try {
      if (!prDiff) {
        throw new Error("PR diff is required.");
      }
  
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
      const result = await model.generateContent({
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
      const rawText = await result.response.text();
      console.log("Raw AI Response:", rawText); // Debugging
  
      // Extract JSON using regex (to handle extra text)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AI response does not contain valid JSON.");
      }
  
      const aiResponse = JSON.parse(jsonMatch[0]);
  
      return {
        riskScore: aiResponse.riskScore ?? 0,
        explanation: aiResponse.explanation ?? "No explanation provided.",
      };
    } catch (error: any) {
      console.error("Error in analyzePRRisk:", error.message);
      return {
        riskScore: 0,
        explanation: "Unable to analyze PR risk due to an error.",
      };
    }
  }
/**
 * Uses Gemini AI to categorize a PR based on its changes.
 */


export async function categorizePR(prDiff: string): Promise<string> {
    try {
      if (!prDiff) {
        throw new Error("PR diff is required.");
      }
  
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      const result = await model.generateContent({
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
  
    } catch (error: any) {
      console.error("Error in categorizePR:", error.message);
      return "uncategorized";
    }
  };





