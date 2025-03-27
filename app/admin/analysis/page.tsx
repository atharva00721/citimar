import { getReports, getReportCounts } from "@/actions/report";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { processReportsForAnalysis } from "@/utils/report-analysis";
import { StatusProgressChart } from "@/components/area-visualization-components";
import { CategoryDistributionChart } from "@/components/pie-visualization-components";

export default async function AnalysisPage() {
  // Fetch all reports
  const { reports = [] } = await getReports();

  // Process data for analysis
  const { categoryDistribution, avgResolutionTime, recentTrends } =
    processReportsForAnalysis(reports);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Report Analysis Dashboard</h1>

      {/* Report Summary Cards */}
      <SectionCards />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Trend Analysis Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Report Submissions Over Time</CardTitle>
            <CardDescription>Monthly report submission trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartAreaInteractive />
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Reports by Category</CardTitle>
            <CardDescription>
              Distribution of reports across categories
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {/* We'll implement this component below */}
            <CategoryDistributionChart data={categoryDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Resolution Analytics */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resolution Analytics</CardTitle>
          <CardDescription>
            Average time to resolution: {avgResolutionTime} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="py-4">
              <StatusProgressChart data={recentTrends} />
            </TabsContent>
            {/* Additional tabs content */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
