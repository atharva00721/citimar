import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { getReportCounts } from "@/actions/report";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export async function SectionCards() {
  const {
    success,
    totalReports = 0,
    submittedReports = 0,
    inProgressReports = 0,
    resolvedReports = 0,
    growthRate = 0,
    totalTrend = 0,
    submittedTrend = 0,
    inProgressTrend = 0,
    resolvedTrend = 0,
  } = await getReportCounts();

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Reports Overview</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalReports.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {totalTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {totalTrend >= 0 ? "+" : ""}
              {totalTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {totalTrend >= 0 ? "Volume increasing" : "Volume decreasing"}{" "}
            {totalTrend >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Compared to previous quarter
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Review</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {submittedReports.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {submittedTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {submittedTrend >= 0 ? "+" : ""}
              {submittedTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {submittedTrend > 0
              ? "Requires attention"
              : "Processing on schedule"}{" "}
            {submittedTrend >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Awaiting initial assessment
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Under Investigation</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {inProgressReports.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {inProgressTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {inProgressTrend >= 0 ? "+" : ""}
              {inProgressTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active case workload{" "}
            {inProgressTrend >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Currently in investigation phase
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Resolution Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {growthRate.toFixed(1)}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {resolvedTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {resolvedTrend >= 0 ? "+" : ""}
              {resolvedTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {resolvedReports.toLocaleString()} cases concluded{" "}
            {resolvedTrend >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Case completion efficiency
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
