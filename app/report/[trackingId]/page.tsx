import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getReportByTrackingId } from "@/actions/report";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileIcon, CheckCircle, Clock, AlertTriangle } from "lucide-react";

// Helper function to format dates
function formatDate(dateString: string | Date): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Loading component for Suspense fallback
function ReportSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <Skeleton className="h-8 w-3/4 mb-4" />
      <Skeleton className="h-6 w-1/2 mb-6" />
      <Skeleton className="h-24 w-full mb-6" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

// Component to render the report status badge
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "SUBMITTED":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-300"
        >
          <Clock className="mr-1 h-3 w-3" /> Pending Review
        </Badge>
      );
    case "INVESTIGATING":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-300"
        >
          <Clock className="mr-1 h-3 w-3" /> Under Investigation
        </Badge>
      );
    case "RESOLVED":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-300"
        >
          <CheckCircle className="mr-1 h-3 w-3" /> Resolved
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-300"
        >
          <AlertTriangle className="mr-1 h-3 w-3" /> Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

// Component to render the report content
async function ReportContent({ trackingId }: { trackingId: string }) {
  const result = await getReportByTrackingId(trackingId);

  if (!result.success || !result.report) {
    notFound();
  }

  const { report } = result;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{report.title}</CardTitle>
            <CardDescription>Tracking ID: {report.trackingId}</CardDescription>
          </div>
          <StatusBadge status={report.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Report Details</h3>
          <div className="whitespace-pre-wrap text-muted-foreground">
            {report.content}
          </div>
        </div>

        {report.evidence && report.evidence.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Evidence Files</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.evidence.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 border rounded-md"
                >
                  <FileIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm truncate">{file.fileHash}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground border-t pt-4">
        <div className="flex justify-between w-full">
          <span>Submitted: {formatDate(report.createdAt)}</span>
          {report.updatedAt && report.updatedAt !== report.createdAt && (
            <span>Last updated: {formatDate(report.updatedAt)}</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// Main page component
export default function ReportPage({
  params,
}: {
  params: { trackingId: string };
}) {
  const { trackingId } = params;

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Report Details</h1>
      <Suspense fallback={<ReportSkeleton />}>
        <ReportContent trackingId={trackingId} />
      </Suspense>
    </div>
  );
}
