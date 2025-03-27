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
  trends?: {
    categoryTrends: string[];
    timeTrends: string[];
    statusTrends: string[];
  };
  riskAssessment?: {
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    riskFactors: string[];
  };
  error?: string;
};

type SingleReportAnalysisResult = {
  success: boolean;
  summary?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  keyPoints?: string[];
  suggestedActions?: string[];
  error?: string;
};

export async function generateReportInsights(
  reports: Report[]
): Promise<ReportAnalysisResult> {
  try {
    // Don't send the full reports to Gemini - extract only what's needed
    const analyticData = reports.map((report) => ({
      title: report.title,
      content: report.content,
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
    You are an expert data analyst and risk assessment specialist for a secure whistleblowing platform. Analyze the provided reports comprehensively:
    ${JSON.stringify(analyticData, null, 2)}

    Provide a detailed analysis in the following JSON structure (no additional text):
    {
      "insights": [
        "Key insight about patterns or significant findings",
        "Important observation about report characteristics",
        "Notable insight about evidence patterns"
      ],
      "trends": {
        "categoryTrends": [
          "Trend in report categories",
          "Pattern in category distribution"
        ],
        "timeTrends": [
          "Temporal pattern in submissions",
          "Time-based correlation"
        ],
        "statusTrends": [
          "Pattern in report statuses",
          "Trend in resolution times"
        ]
      },
      "riskAssessment": {
        "overallRisk": "LOW|MEDIUM|HIGH based on aggregate analysis",
        "riskFactors": [
          "Specific risk factor identified",
          "Potential vulnerability or concern"
        ]
      },
      "recommendations": [
        "Actionable recommendation for improvement",
        "Specific suggestion for risk mitigation"
      ],
      "anomalies": [
        "Unusual pattern or outlier detected",
        "Suspicious activity or irregularity"
      ]
    }

    Focus on identifying actionable insights, risk patterns, and concrete recommendations.
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
      trends: analysisData.trends || {
        categoryTrends: [],
        timeTrends: [],
        statusTrends: [],
      },
      riskAssessment: analysisData.riskAssessment || {
        overallRisk: 'MEDIUM',
        riskFactors: [],
      },
    };
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      success: false,
      error: "Failed to generate insights. Please try again later.",
    };
  }
}

export async function analyzeSingleReport(
  report: Report
): Promise<SingleReportAnalysisResult> {
  try {
    // Prepare the report data for analysis
    const reportData = {
      title: report.title,
      content: report.content,
      category: report.category?.name,
      status: report.status,
      createdAt: new Date(report.createdAt).toISOString().split("T")[0],
      updatedAt: report.updatedAt
        ? new Date(report.updatedAt).toISOString().split("T")[0]
        : null,
      evidenceCount: report.evidence?.length || 0,
    };

    const prompt = `
    You are an expert investigator and risk analyst for a secure whistleblowing platform. Analyze this single report in detail:
    ${JSON.stringify(reportData, null, 2)}

    Provide a comprehensive analysis in the following JSON structure (no additional text):
    {
      "summary": "A concise 2-3 sentence summary of the report",
      "riskLevel": "LOW|MEDIUM|HIGH based on content severity",
      "keyPoints": ["key point 1", "key point 2", "key point 3"],
      "suggestedActions": ["action 1", "action 2"]
    }
    
    Focus on identifying critical details, assessing risk levels, and suggesting concrete next steps.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonMatch =
      text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : "{}";
    const analysisData = JSON.parse(jsonText);

    return {
      success: true,
      summary: analysisData.summary,
      riskLevel: analysisData.riskLevel,
      keyPoints: analysisData.keyPoints || [],
      suggestedActions: analysisData.suggestedActions || [],
    };
  } catch (error) {
    console.error("Error analyzing report:", error);
    return {
      success: false,
      error: "Failed to analyze report. Please try again later.",
    };
  }
}
