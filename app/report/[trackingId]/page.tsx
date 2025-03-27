import { notFound } from "next/navigation";
import { getReportByTrackingId } from "@/actions/report";
import { ReportDetails } from "@/components/report/report-details";

export default async function ReportPage({
  params,
}: {
  params: { trackingId: string };
}) {
  const trackingId = params.trackingId;
  const { success, report } = await getReportByTrackingId(trackingId);

  if (!success || !report) {
    notFound();
  }

  // Pass the report data to a client component for rendering
  return <ReportDetails report={report} />;
}
