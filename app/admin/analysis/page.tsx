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

export default async function AnalysisPage() {
  const { reports = [], success } = await getReports();

  if (!success) {
    return (
      <div className="container mx-auto p-6 ">
        <Card className="shadow-md hover:shadow-lg transition-shadow rounded-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-[30vh]">
              <p className="text-muted-foreground">
                Failed to load report data
              </p>
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
    recentReports,
    statusByCategory,
  } = processReportData(reports);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          &#8592; Back to Dashboard
        </Link>
      </div>
      <h1 className="text-5xl font-bold mb-8 text-center text-gray-800 border-b pb-4">
        Report Analysis
      </h1>

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
        <AIInsights reports={reports} />

        <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-lg bg-white">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>
              Current distribution of reports by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDistributionChart data={statusDistribution} />
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-lg bg-white">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>
              Distribution of reports by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDistributionChart data={categoryDistribution} />
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow rounded-lg bg-white">
        <CardHeader>
          <CardTitle>Report Timeline</CardTitle>
          <CardDescription>Report submissions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <TimelineChart data={timelineData} />
        </CardContent>
      </Card>

      <Card className="mt-8 shadow-lg hover:shadow-xl transition-shadow rounded-lg bg-white">
        <CardHeader>
          <CardTitle>Report Analysis by Category</CardTitle>
          <CardDescription>
            Detailed breakdown of reports by status and category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="border-b-2 border-gray-200 mb-4">
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
    </div>
  );
}
