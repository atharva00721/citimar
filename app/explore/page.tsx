/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import db from "@/lib/prisma";
import { Report } from "@/types/report";
import SearchReports from "@/components/SearchReports";
import { decrypt } from "@/utils/encrypt";

export default async function ExplorePage() {
  let reports: Report[] = [];
  let error: any = null;

  try {
    // Fetch reports with related data
    const fetchedReports = await db.report.findMany({
      include: { evidence: true, category: true },
    });

    const resolvedReports = fetchedReports.filter(
      (report) => report.status === "RESOLVED"
    );

    // Use secret key from env or default value
    const secretKey = process.env.DEFAULT_SECRET_KEY || "defaultSecretKey";

    // Decrypt title and content for each report
    reports = resolvedReports.map((report) => {
      let decryptedTitle = report.title;
      let decryptedContent = report.content;

      try {
        const t = decrypt(report.title, secretKey);
        if (typeof t === "string") {
          decryptedTitle = t;
        }
      } catch (e) {
        console.error("Decryption error for title:", e);
      }

      try {
        const c = decrypt(report.content, secretKey);
        if (typeof c === "string") {
          decryptedContent = c;
        }
      } catch (e) {
        console.error("Decryption error for content:", e);
      }

      return { ...report, title: decryptedTitle, content: decryptedContent };
    });
  } catch (e) {
    console.error("Error fetching reports:", e);
    error = e;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-blue-600 hover:underline mb-4"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold mb-2">approved Incident Reports</h1>
        <p className="text-gray-500">
          Browse through all approved reported maritime incidents
        </p>
      </header>
      {error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <h2 className="text-lg font-medium text-red-800 mb-2">
            Unable to load reports
          </h2>
          <p className="text-sm text-red-600">
            There was an error connecting to the database. Please try again later.
          </p>
        </div>
      ) : (
        <SearchReports reports={reports} />
      )}
    </div>
  );
}
