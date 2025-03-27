import React from "react";

interface CategoryDistributionChartProps {
  data: Record<string, number>;
}

export default function CategoryDistributionChart({
  data,
}: CategoryDistributionChartProps) {
  return (
    <div className="p-4">
      {Object.entries(data).map(([category, count]) => (
        <div
          key={category}
          // Add dark mode border color
          className="flex justify-between py-1 border-b dark:border-gray-700 last:border-0"
        >
          <span className="text-sm font-medium">{category}</span>
          <span className="text-sm">{count}</span>
        </div>
      ))}
    </div>
  );
}
