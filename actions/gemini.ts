"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Report } from "@/types/report";

// Initialize the Generative AI API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type ReportAnalysisResult = {
  success: boolean;
  insights?: string[];
  recommendations?: string[];
  anomalies?: string[];
  error?: string;
};

export async function generateReportInsights(
  reports: Report[]
): Promise<ReportAnalysisResult> {
  try {
    // Don't send the full reports to Gemini - extract only what's needed
    const analyticData = reports.map((report) => ({
      title: report.title,
      category: report.category?.name,
      status: report.status,
      createdAt: new Date(report.createdAt).toISOString().split("T")[0],
      updatedAt: report.updatedAt
        ? new Date(report.updatedAt).toISOString().split("T")[0]
        : null,
      evidenceCount: report.evidence?.length || 0,
    }));

    // Structure the prompt for better results
    const prompt = `
  You are an expert data analyst for a secure and anonymous whistleblowing platform, specializing in extracting actionable insights to optimize report handling, identify inefficiencies, and spot anomalies. 

  Analyze the provided report data in detail:
  ${JSON.stringify(analyticData, null, 2)}

  Your analysis must directly provide:
  1. **Key Insights**: Focus on trends, bottlenecks, frequent categories, or patterns observed in the reports that reveal areas for improvement in handling or user submissions.
  2. **Actionable Recommendations**: Suggest specific measures to enhance report handling efficiency, improve submission quality, or strengthen platform operations while maintaining user anonymity.
  3. **Notable Anomalies**: Highlight any outliers, unusual patterns, suspicious entries, or system-related irregularities that require immediate attention to ensure data integrity.

  Respond only in the precise JSON structure below (no additional text):
  {
    "insights": ["insight 1", "insight 2", "insight 3"],
    "recommendations": ["recommendation 1", "recommendation 2"],
    "anomalies": ["anomaly 1", "anomaly 2"]
  }
`;

    // Create a generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response from Gemini
    const jsonMatch =
      text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : "{}";
    const analysisData = JSON.parse(jsonText);

    return {
      success: true,
      insights: analysisData.insights || [],
      recommendations: analysisData.recommendations || [],
      anomalies: analysisData.anomalies || [],
    };
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      success: false,
      error: "Failed to generate insights. Please try again later.",
    };
  }
}
