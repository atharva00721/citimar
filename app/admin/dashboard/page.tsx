import { AppSidebar } from "@/components/app-sidebar";
import AuthGuard from "@/components/AuthGuard";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getReports } from "@/actions/report";

export default async function Page() {
  // Use the getReports function instead of directly accessing the database
  // This will ensure that reports are properly decrypted
  const result = await getReports();

  if (!result.success || !result.reports) {
    // Handle error case
    return <div>Failed to load reports</div>;
  }

  // Transform database reports to match the expected schema for DataTable
  // No need to decrypt here since getReports already returns decrypted data
  const reportsData = result.reports.map((report, index) => ({
    id: index + 1, // Use incremental ID for the table
    trackingId: report.trackingId,
    title: report.title, // Already decrypted by getReports
    status: report.status,
    createdAt: report.createdAt.toString(),
    updatedAt: report.updatedAt?.toString(),
    content: report.content, // Already decrypted by getReports
    evidenceCount: report.evidence.length,
  }));

  return (
    <AuthGuard>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <DataTable data={reportsData} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
