/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCircleCheckFilled,
  IconClock,
  IconDownload,
  IconLoader,
  IconFileText,
  IconPhoto,
  IconVideo,
  IconFileMusic,
  IconFile,
  IconLoader2,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Report } from "@/types/report"; // Make sure you have this type defined
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { analyzeSingleReport } from "@/actions/gemini";
import { useState } from "react";

export function ReportDetails({ report }: { report: Report }) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(report.trackingId)
      .then(() => toast.success("Copied to clipboard!")) // Optional success feedback
      .catch((err) => toast.error("Failed to copy:", err));
  };
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getStatusDetails = () => {
    switch (report.status) {
      case "SUBMITTED":
        return {
          label: "Pending Review",
          icon: <IconClock className="size-5" />,
          color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
        };
      case "IN_PROGRESS":
        return {
          label: "Under Investigation",
          icon: <IconLoader className="size-5 animate-spin" />,
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
        };
      case "RESOLVED":
        return {
          label: "Resolved",
          icon: <IconCircleCheckFilled className="size-5" />,
          color:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
        };
      default:
        return {
          label: report.status,
          icon: null,
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500",
        };
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "document":
        return <IconFileText className="size-5" />;
      case "image":
        return <IconPhoto className="size-5" />;
      case "video":
        return <IconVideo className="size-5" />;
      case "audio":
        return <IconFileMusic className="size-5" />;
      default:
        return <IconFile className="size-5" />;
    }
  };

  const status = getStatusDetails();

  const generateAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeSingleReport(report);
      if (result.success) {
        setAnalysis(result);
        toast.success("Analysis generated successfully");
      } else {
        toast.error(result.error || "Failed to generate analysis");
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to generate analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container py-8  px-10 md:px-32">
      <div className="mb-8">
        <Link
          href={session?.user ? "/admin/dashboard" : "/explore"}
          className="inline-flex items-center text-sm font-medium text-muted-foreground mb-6 hover:text-primary transition-colors"
        >
          <IconArrowLeft className="mr-2 size-4" />
          {session?.user ? "Back to Dashboard" : "Back to Explore"}
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              {report.title}
            </h1>
            <p className="text-muted-foreground text-md flex gap-4 mt-6">
              Report ID: {report.trackingId}
              <Copy className="w-5 cursor-pointer " onClick={copyToClipboard} />
            </p>
          </div>
          <Badge
            variant="secondary"
            className={`px-4 py-1.5 text-sm font-medium flex items-center gap-2 ${status.color}`}
          >
            {status.icon}
            {status.label}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="grid gap-8 w-1/2">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Report Details</CardTitle>
              <CardDescription className="text-sm">
                Submitted on {formatDate(report.createdAt)}
                {report.updatedAt &&
                  report.updatedAt > report.createdAt &&
                  ` • Updated on ${formatDate(report.updatedAt)}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-base leading-relaxed">
                {report.content}
              </p>
            </CardContent>
          </Card>

          {report.evidence && report.evidence.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Evidence Files</CardTitle>
                <CardDescription className="text-sm">
                  {report.evidence.length}{" "}
                  {report.evidence.length === 1 ? "file" : "files"} attached to
                  this report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {report.evidence.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {getFileIcon(file.fileType)}
                        </div>
                        <div>
                          <p className="font-medium">Evidence #{index + 1}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {file.fileType} file
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <IconDownload className="size-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Case Activity</CardTitle>
              <CardDescription className="text-sm">
                Timeline of actions taken on this report
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex flex-col gap-5">
                <div className="flex gap-4">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <IconClock className="size-6" />
                  </div>
                  <div>
                    <p className="font-medium mb-0.5">Report submitted</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>

                {report.status === "IN_PROGRESS" && (
                  <div className="flex gap-4">
                    <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                      <IconLoader className="size-6 animate-spin" />
                    </div>
                    <div>
                      <p className="font-medium mb-0.5">
                        Investigation started
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {report.updatedAt
                          ? formatDate(report.updatedAt)
                          : "Date not available"}
                      </p>
                    </div>
                  </div>
                )}

                {report.status === "RESOLVED" && (
                  <div className="flex gap-4">
                    <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                      <IconCircleCheckFilled className="size-6" />
                    </div>
                    <div>
                      <p className="font-medium mb-0.5">Case resolved</p>
                      <p className="text-sm text-muted-foreground">
                        {report.updatedAt
                          ? formatDate(report.updatedAt)
                          : "Date not available"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-6 flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full sm:w-auto">
                <p className="text-sm font-medium text-muted-foreground">
                  Report ID: {report.trackingId}
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Link
                  href={`/report/${report.trackingId}/update`}
                  className="w-full sm:w-auto"
                >
                  {session?.user.isAdmin === true && (
                    <Button variant="outline" className="w-full sm:w-auto">
                      Update Status
                    </Button>
                  )}
                </Link>
                {/* <Button className=" sm:w-auto">Download Report</Button> */}
              </div>
            </CardFooter>
          </Card>
        </div>
        <div className="w-1/2  h-screen">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">AI Analysis</CardTitle>
                  <CardDescription className="text-sm">
                    AI-powered insights and recommendations for this report
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
                <div className="space-y-6">
                  {analysis.riskLevel && (
                    <div>
                      <Badge 
                        variant="secondary"
                        className={`
                          ${analysis.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500' : ''}
                          ${analysis.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' : ''}
                          ${analysis.riskLevel === 'LOW' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' : ''}
                          px-2 py-1 text-sm
                        `}
                      >
                        {analysis.riskLevel} RISK LEVEL
                      </Badge>
                    </div>
                  )}
                  
                  {analysis.summary && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Summary</h3>
                      <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                    </div>
                  )}

                  {analysis.keyPoints && analysis.keyPoints.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Key Points</h3>
                      <ul className="space-y-1">
                        {analysis.keyPoints.map((point: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex gap-2">
                            <span>•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Suggested Actions</h3>
                      <ul className="space-y-1">
                        {analysis.suggestedActions.map((action: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex gap-2">
                            <span>•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">
                    Click &quot;Generate Analysis&quot; to get AI-powered insights about this report
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
