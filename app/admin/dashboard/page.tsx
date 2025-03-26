
import { AppSidebar } from "@/components/app-sidebar";
import AuthGuard from "@/components/AuthGuard";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import db from "@/lib/prisma";

export default async function Page() {
  // Fetch reports from the database
  const reports = await db.report.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      evidence: true,
    },
  });

  // Transform database reports to match the expected schema for DataTable
  const reportsData = reports.map((report, index) => ({
    id: index + 1, // Use incremental ID for the table
    trackingId: report.trackingId,
    title: report.title,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt?.toISOString(),
    content: report.content,
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
