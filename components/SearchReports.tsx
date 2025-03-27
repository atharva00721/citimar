"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, FileTextIcon } from "lucide-react";
import { decrypt } from "@/utils/encrypt";
import { Report } from "@/types/report";

interface SearchReportsProps {
  reports: Report[];
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "SUBMITTED":
      return "bg-blue-100 text-blue-800";
    case "UNDER_REVIEW":
      return "bg-purple-100 text-purple-800";
    case "IN_PROGRESS":
      return "bg-orange-100 text-orange-800";
    case "RESOLVED":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function SearchReports({ reports }: SearchReportsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const secretKey =
    process.env.NEXT_PUBLIC_DEFAULT_SECRET_KEY || "defaultSecretKey";

  const filteredReports = reports.filter((report) =>
    report.trackingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Tracking ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((report: Report) => {
          // Decrypt title and content
          let title = report.title;
          let content = report.content;
          try {
            title =
              typeof decrypt(report.title, secretKey) === "string"
                ? (decrypt(report.title, secretKey) as string)
                : report.title;
            content =
              typeof decrypt(report.content, secretKey) === "string"
                ? (decrypt(report.content, secretKey) as string)
                : report.content;
          } catch (e) {
            console.error("Decryption error:", e);
          }

          return (
            <Link href={`/report/${report.trackingId}`} key={report.id}>
              <Card className="h-full hover:bg-gray-50 transition-colors border">
                <CardContent className="p-5">
                  {/* Status and tracking ID row */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      className={getStatusColor(report.status)}
                      variant="outline"
                    >
                      {report.status.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-gray-400 font-mono">
                      {report.trackingId}
                    </span>
                  </div>
                  {/* Title */}
                  <h2 className="font-medium text-lg mb-2 line-clamp-1">
                    {title}
                  </h2>
                  {/* Content preview */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {content}
                  </p>
                  {/* Footer info */}
                  <div className="flex items-center text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <div className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="ml-auto flex items-center">
                      <FileTextIcon className="h-3 w-3 mr-1" />
                      <span>
                        {report.evidence?.length || 0}{" "}
                        {report.evidence?.length === 1 ? "file" : "files"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
