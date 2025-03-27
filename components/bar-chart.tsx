"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  SUBMITTED: "#fbbf24", // amber
  UNDER_REVIEW: "#f97316", // orange
  IN_PROGRESS: "#3b82f6", // blue
  RESOLVED: "#22c55e", // green
};

export function TimelineChart({ data }) {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="SUBMITTED" name="Submitted" fill={STATUS_COLORS.SUBMITTED} />
          <Bar dataKey="UNDER_REVIEW" name="Under Review" fill={STATUS_COLORS.UNDER_REVIEW} />
          <Bar dataKey="IN_PROGRESS" name="In Progress" fill={STATUS_COLORS.IN_PROGRESS} />
          <Bar dataKey="RESOLVED" name="Resolved" fill={STATUS_COLORS.RESOLVED} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}