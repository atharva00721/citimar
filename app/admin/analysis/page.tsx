import { getReports } from "@/actions/report";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIInsights } from "@/components/Insights";
import { processReportData } from "@/utils/report-analysis";
import StatusDistributionChart from "@/components/StatusDistributionChart";
import CategoryDistributionChart from "@/components/CategoryDistributionChart";
import TimelineChart from "@/components/TimelineChart";
import { ReportTable } from "@/components/moredata";
import Link from "next/link";
import { IconArrowLeft, IconChartBar, IconClipboardList, IconTimeline } from "@tabler/icons-react";

export default async function AnalysisPage() {
  const { reports = [], success } = await getReports();

  if (!success) {
    return (
      <div className="container mx-auto p-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow rounded-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-[30vh]">
              <p className="text-muted-foreground">Failed to load report data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    categoryDistribution,
    statusDistribution,
    timelineData,
    statusByCategory,
  } = processReportData(reports);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-primary transition-colors"
            >
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="text-sm text-muted-foreground">
              Total Reports: {reports.length}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Report Analysis</h1>
          <p className="mt-2 text-muted-foreground">
            Comprehensive analysis and insights of all reports
          </p>
        </div>

        {/* AI Insights Section */}
        <section className="mb-8">
          <AIInsights reports={reports} />
        </section>

        {/* Charts Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <IconChartBar className="h-6 w-6" />
            Distribution Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-lg">Status Distribution</CardTitle>
                <CardDescription>
                  Current distribution of reports by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StatusDistributionChart data={statusDistribution} />
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-lg">Category Distribution</CardTitle>
                <CardDescription>
                  Distribution of reports by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryDistributionChart data={categoryDistribution} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <IconTimeline className="h-6 w-6" />
            Temporal Analysis
          </h2>
          <Card className="shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-lg">Report Timeline</CardTitle>
              <CardDescription>
                Trend analysis of report submissions over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimelineChart data={timelineData} />
            </CardContent>
          </Card>
        </section>

        {/* Detailed Analysis Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <IconClipboardList className="h-6 w-6" />
            Detailed Breakdown
          </h2>
          <Card className="shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-lg">Report Analysis by Category</CardTitle>
              <CardDescription>
                Detailed breakdown of reports by status and category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="all">All Reports</TabsTrigger>
                  {Object.keys(statusByCategory).map((category) => (
                    <TabsTrigger value={category} key={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="all" className="pt-4">
                  <ReportTable reports={reports} />
                </TabsContent>
                {Object.entries(statusByCategory).map(([category, reports]) => (
                  <TabsContent value={category} key={category} className="pt-4">
                    <ReportTable reports={reports} />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

