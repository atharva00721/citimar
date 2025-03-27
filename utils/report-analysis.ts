import { differenceInDays, format, parseISO } from "date-fns";
import { Report } from "@/types/report";

export function processReportsForAnalysis(reports: Report[]) {
  // Category distribution
  const categoryDistribution = reports.reduce((acc, report) => {
    const categoryName = report.category?.name || "Uncategorized";
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Monthly submission analytics
  const monthlySubmissions = reports.reduce((acc, report) => {
    const month = format(new Date(report.createdAt), "MMM yyyy");
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Average resolution time (for resolved reports)
  const resolvedReports = reports.filter(
    (report) => report.status === "RESOLVED"
  );
  const totalDays = resolvedReports.reduce((sum, report) => {
    const created = new Date(report.createdAt);
    const updated = new Date(report.updatedAt || report.createdAt);
    return sum + differenceInDays(updated, created);
  }, 0);

  const avgResolutionTime =
    resolvedReports.length > 0
      ? Math.round((totalDays / resolvedReports.length) * 10) / 10
      : 0;

  // Recent trends (last 6 months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, "MMM yyyy");
  }).reverse();

  const recentTrends = last6Months.map((month) => {
    const filtered = reports.filter(
      (report) => format(new Date(report.createdAt), "MMM yyyy") === month
    );

    return {
      month,
      submitted: filtered.filter((r) => r.status === "SUBMITTED").length,
      inProgress: filtered.filter((r) => r.status === "IN_PROGRESS").length,
      resolved: filtered.filter((r) => r.status === "RESOLVED").length,
      total: filtered.length,
    };
  });

  return {
    categoryDistribution,
    monthlySubmissions,
    avgResolutionTime,
    recentTrends,
  };
}
