import React from "react";

interface StatusDistributionChartProps {
  data: Record<string, number>;
}

export default function StatusDistributionChart({
  data,
}: StatusDistributionChartProps) {
  return (
    <div className="p-4">
      {Object.entries(data).map(([status, count]) => (
        <div
          key={status}
          // Add dark mode border color
          className="flex justify-between py-1 border-b dark:border-gray-700 last:border-0"
        >
          <span className="text-sm font-medium">{status}</span>
          <span className="text-sm">{count}</span>
        </div>
      ))}
    </div>
  );
}
