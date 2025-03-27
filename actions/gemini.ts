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
      Analyze the following report data and provide insights:
      ${JSON.stringify(analyticData, null, 2)}
      
      Please provide:
      1. Three key insights based on the data
      2. Two recommendations for improving report handling
      3. Any anomalies or unusual patterns in the data
      
      Format your response as JSON with the following structure:
      {
        "insights": ["insight 1", "insight 2", "insight 3"],
        "recommendations": ["recommendation 1", "recommendation 2"],
        "anomalies": ["anomaly 1", "anomaly 2"]
      }
    `;

    // Create a generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
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
