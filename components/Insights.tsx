/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from 'react';
import { Report } from '@/types/report';
import { generateReportInsights } from '@/actions/gemini';
import { IconLoader2 } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AIInsights({ reports }: { reports: Report[] }) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await generateReportInsights(reports);
      if (result.success) {
        setAnalysis(result);
        toast.success("Analysis generated successfully");
      } else {
        toast.error(result.error || "Failed to generate analysis");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-lg bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">AI Analysis Dashboard</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Comprehensive AI-powered analysis of {reports.length} reports
            </CardDescription>
          </div>
          <Button 
            onClick={generateAnalysis} 
            disabled={isAnalyzing}
            variant="default"
          >
            {isAnalyzing ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Generate Analysis'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isAnalyzing ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        ) : analysis ? (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {analysis.riskAssessment?.overallRisk && (
                <div className="flex items-center gap-2 mb-4">
                  <Badge 
                    variant="secondary"
                    className={`
                      ${analysis.riskAssessment.overallRisk === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500' : ''}
                      ${analysis.riskAssessment.overallRisk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' : ''}
                      ${analysis.riskAssessment.overallRisk === 'LOW' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' : ''}
                    `}
                  >
                    {analysis.riskAssessment.overallRisk} OVERALL RISK
                  </Badge>
                </div>
              )}
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-foreground">Key Insights</h3>
                  <ul className="space-y-1">
                    {analysis.insights?.map((insight, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-foreground">Notable Anomalies</h3>
                  <ul className="space-y-1">
                    {analysis.anomalies?.map((anomaly, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>{anomaly}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {['categoryTrends', 'timeTrends', 'statusTrends'].map((trendType) => (
                  <div key={trendType} className="space-y-2">
                    <h3 className="font-semibold text-sm text-foreground capitalize">
                      {trendType.replace('Trends', '')} Trends
                    </h3>
                    <ul className="space-y-1">
                      {analysis.trends?.[trendType]?.map((trend, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-foreground">•</span>
                          <span>{trend}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-foreground">Risk Factors</h3>
                  <ul className="space-y-1">
                    {analysis.riskAssessment?.riskFactors?.map((factor, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">Recommended Actions</h3>
                <ul className="space-y-1">
                  {analysis.recommendations?.map((recommendation, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-foreground">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              Click "Generate Analysis" to get comprehensive AI-powered insights
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
