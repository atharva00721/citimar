"use client";
generateReportInsights;

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Report } from "@/types/report";
import { generateReportInsights } from "@/actions/gemini";

export function AIInsights({ reports }: { reports: Report[] }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [anomalies, setAnomalies] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function generateInsights() {
    setLoading(true);
    setError(null);

    try {
      const result = await generateReportInsights(reports);

      if (result.success) {
        setInsights(result.insights || []);
        setRecommendations(result.recommendations || []);
        setAnomalies(result.anomalies || []);
      } else {
        setError(result.error || "Failed to generate insights");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI-Powered Insights
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={generateInsights}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Insights
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Key Insights:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {insights.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Recommendations:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

            {anomalies.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Potential Anomalies:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {anomalies.map((anomaly, i) => (
                    <li key={i}>{anomaly}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            Click "Generate Insights" to get AI-powered analysis of your report
            data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
