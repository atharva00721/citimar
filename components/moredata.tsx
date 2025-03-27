"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatDistance } from "date-fns";

export function ReportTable({ reports }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status badge color mapping
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-gray-200 text-gray-800";
      case "UNDER_REVIEW":
        return "bg-blue-200 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-200 text-yellow-800";
      case "RESOLVED":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Display status names
  const formatStatus = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "Submitted";
      case "UNDER_REVIEW":
        return "Under Review";
      case "IN_PROGRESS":
        return "In Progress";
      case "RESOLVED":
        return "Resolved";
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report, idx) => (
                <TableRow
                  key={report.id}
                  // Update row bg for dark mode: white -> bg-white dark:bg-gray-800, gray-50 -> dark:bg-gray-700, and hover variants
                  className={`${
                    idx % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-700"
                  } hover:bg-gray-100 dark:hover:bg-gray-600`}
                >
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>
                    {report.category?.name || "Uncategorized"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        report.status
                      )}`}
                    >
                      {formatStatus(report.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatDistance(new Date(report.createdAt), new Date(), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>{report.evidence?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/report/${report.trackingId}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No reports found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
