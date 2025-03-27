import React from "react";

interface TimelineChartProps {
  data: Record<string, number>;
}

export default function TimelineChart({ data }: TimelineChartProps) {
  const sortedDates = Object.keys(data).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="p-4">
      {sortedDates.map((date) => (
        <div
          key={date}
          // Add dark mode border color
          className="flex justify-between py-1 border-b dark:border-gray-700 last:border-0"
        >
          <span className="text-sm font-medium">{date}</span>
          <span className="text-sm">{data[date]}</span>
        </div>
      ))}
    </div>
  );
}
