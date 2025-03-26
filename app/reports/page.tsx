import { Suspense } from "react";
import { DataTable } from "@/components/data-table";
import { getReports } from "@/actions/report";
import { schema } from "@/components/data-table";

async function ReportsTable() {
  // Get reports with decryption handled by the server action
  const result = await getReports();

  if (!result.success || !result.reports) {
    return <div>Failed to load reports</div>;
  }

  // Transform the data to match the schema expected by DataTable
  const formattedReports = result.reports.map((report) => ({
    id: report.id,
    trackingId: report.trackingId,
    title: report.title, // Already decrypted by getReports
    content: report.content, // Already decrypted by getReports
    status: report.status,
    createdAt: report.createdAt.toString(),
    updatedAt: report.updatedAt?.toString(),
    evidenceCount: report.evidence?.length || 0,
  }));

  return <DataTable data={formattedReports} />;
}

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Reports</h1>
      <Suspense fallback={<div>Loading reports...</div>}>
        <ReportsTable />
      </Suspense>
    </div>
  );
}
