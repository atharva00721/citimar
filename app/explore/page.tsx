import Link from "next/link";
import db from "@/lib/prisma";
import { Report } from "@/types/report";
import SearchReports from "@/components/SearchReports";

export default async function ExplorePage() {
  let reports: Report[] = [];
  let error = null;

  try {
    reports = (await db.report.findMany({
      include: { evidence: true },
      orderBy: { createdAt: "desc" },
    })) as unknown as Report[];
  } catch (e) {
    console.error("Database error:", e);
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
        <h1 className="text-3xl font-bold mb-2">Incident Reports</h1>
        <p className="text-gray-500">
          Browse through all reported maritime incidents
        </p>
      </header>
      {error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <h2 className="text-lg font-medium text-red-800 mb-2">
            Unable to load reports
          </h2>
          <p className="text-sm text-red-600">
            There was an error connecting to the database. Please try again
            later.
          </p>
        </div>
      ) : (
        <SearchReports reports={reports} />
      )}
    </div>
  );
}
