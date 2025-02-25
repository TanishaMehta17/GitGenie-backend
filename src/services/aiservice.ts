import axios from "axios";

/**
 * Calls an AI model to generate code fixes based on PR diff.
 */
export const generateCodeFixes = async (prDiff: string): Promise<string[]> => {
    try {
        const response = await axios.post("https://ai.example.com/generate-fixes", {
            diff: prDiff
        });

        return response.data.fixes || [];
    } catch (error) {
        console.error("Error in generateCodeFixes:", error);
        return ["Error generating code fixes"];
    }
};

/**
 * Analyzes PR risk based on code changes, test coverage, and security findings.
 */
export const analyzePRRisk = async (
    prDiff: string,
    testCoverage: number,
    securityFindings: string[]
): Promise<number> => {
    try {
        const response = await axios.post("https://ai.example.com/analyze-risk", {
            diff: prDiff,
            coverage: testCoverage,
            security: securityFindings
        });

        return response.data.riskScore || 0;
    } catch (error) {
        console.error("Error in analyzePRRisk:", error);
        return 0; // Default to lowest risk score
    }
};

/**
 * Uses AI to categorize a PR based on its changes.
 */
export const categorizePR = async (prDiff: string): Promise<string> => {
    try {
        const response = await axios.post("https://ai.example.com/categorize-pr", {
            diff: prDiff
        });

        return response.data.label || "Uncategorized";
    } catch (error) {
        console.error("Error in categorizePR:", error);
        return "Uncategorized";
    }
};
