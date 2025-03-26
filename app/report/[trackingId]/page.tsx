import { notFound } from "next/navigation";
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
} from "@tabler/icons-react";

import { getReportByTrackingId } from "@/actions/report";
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
import { Separator } from "@/components/ui/separator";

interface ReportPageProps {
  params: {
    trackingId: string;
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { trackingId } = params;
  const { success, report, error } = await getReportByTrackingId(trackingId);

  if (!success || !report) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="flex items-center text-sm text-muted-foreground mb-4 hover:text-foreground"
        >
          <IconArrowLeft className="mr-1 size-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {report.title}
            </h1>
            <p className="text-muted-foreground">
              Report ID: {report.trackingId}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={`px-3 py-1 text-sm gap-1.5 ${status.color}`}
          >
            {status.icon}
            {status.label}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
            <CardDescription>
              Submitted on {formatDate(report.createdAt)}
              {report.updatedAt &&
                report.updatedAt > report.createdAt &&
                ` • Updated on ${formatDate(report.updatedAt)}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{report.content}</p>
          </CardContent>
        </Card>

        {report.evidence && report.evidence.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Evidence Files</CardTitle>
              <CardDescription>
                {report.evidence.length}{" "}
                {report.evidence.length === 1 ? "file" : "files"} attached to
                this report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {report.evidence.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.fileType)}
                      <div>
                        <p className="font-medium">Evidence #{index + 1}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {file.fileType} file
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <IconDownload className="size-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Case Activity</CardTitle>
            <CardDescription>
              Timeline of actions taken on this report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <IconClock className="size-5" />
                </div>
                <div>
                  <p className="font-medium">Report submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(report.createdAt)}
                  </p>
                </div>
              </div>

              {report.status === "IN_PROGRESS" && (
                <div className="flex gap-3">
                  <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <IconLoader className="size-5 animate-spin" />
                  </div>
                  <div>
                    <p className="font-medium">Investigation started</p>
                    <p className="text-sm text-muted-foreground">
                      {report.updatedAt
                        ? formatDate(report.updatedAt)
                        : "Date not available"}
                    </p>
                  </div>
                </div>
              )}

              {report.status === "RESOLVED" && (
                <div className="flex gap-3">
                  <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <IconCircleCheckFilled className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Case resolved</p>
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
          <CardFooter className="border-t bg-muted/50 px-6 flex flex-wrap gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Report ID: {report.trackingId}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/report/${report.trackingId}/update`}>
                <Button variant="outline">Update Status</Button>
              </Link>
              <Button>Download Report</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
