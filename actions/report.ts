"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import db from "@/lib/prisma";
import { reportSchema } from "@/schemas/report-schema";
import { ZodError } from "zod";
import { ReportStatus } from "@prisma/client";
// No need to import cleaning functions in server component as they run on client

// Generate a secure tracking ID
function generateTrackingId(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// Determine the file type category for the database
function getFileTypeCategory(file: File): string {
  const mimeType = file.type;
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf") || mimeType.includes("document"))
    return "document";
  return "other";
}

// Type for the response from the server action
export type SubmitReportResult = {
  success: boolean;
  trackingId?: string;
  error?: string;
};

// Main server action
export async function submitReport(
  formData: FormData
): Promise<SubmitReportResult> {
  try {
    // Generate a unique tracking ID for this report
    const trackingId = generateTrackingId();

    // Extract form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const files = formData.getAll("evidence") as File[];

    // Create object for Zod validation
    const dataToValidate = {
      title,
      description,
      files,
    };

    // Validate with Zod schema
    try {
      reportSchema.parse(dataToValidate);
    } catch (error) {
      if (error instanceof ZodError) {
        // Return specific validation error
        const firstError = error.errors[0];
        return {
          success: false,
          error: `Validation error: ${firstError.message}`,
        };
      }
      throw error;
    }

    // Handle file uploads securely
    const processedFiles = await Promise.all(
      files.map(async (file: File) => {
        // Note: Files should already be cleaned on the client side

        // Generate file hash for security - don't use original filename in hash
        const randomPrefix = crypto.randomBytes(8).toString("hex");
        const fileExtension = file.name.split(".").pop() || "";
        const fileHash = `${randomPrefix}.${fileExtension}`;

        // Determine file type for database
        const fileType = getFileTypeCategory(file);

        // Here you would:
        // 1. Scan file for viruses
        // 2. Encrypt file contents
        // 3. Upload to secure storage (e.g., S3)

        // Return file metadata for database
        return {
          fileHash,
          fileType,
          encrypted: true,
        };
      })
    );

    // Store report in database
    const report = await db.report.create({
      data: {
        trackingId,
        title,
        content: description,
        status: ReportStatus.SUBMITTED,
        evidence: {
          create: processedFiles,
        },
      },
    });

    // Revalidate the reports page
    revalidatePath("/reports");

    return {
      success: true,
      trackingId,
    };
  } catch (error) {
    console.error("Report submission error:", error);
    return {
      success: false,
      error: "Failed to submit report. Please try again.",
    };
  }
}

export async function getReportByTrackingId(trackingId: string) {
  try {
    const report = await db.report.findUnique({
      where: {
        trackingId: trackingId,
      },
      include: {
        evidence: true,
      },
    });

    if (!report) {
      return { success: false, error: "Report not found" };
    }

    return { success: true, report };
  } catch (error) {
    console.error("Error fetching report:", error);
    return { success: false, error: "Failed to fetch report" };
  }
}

// New function to fetch report counts by status
export async function getReportCounts() {
  try {
    // Get total reports
    const totalReports = await db.report.count();

    // Get reports by status
    const submittedReports = await db.report.count({
      where: { status: ReportStatus.SUBMITTED },
    });

    const inProgressReports = await db.report.count({
      where: { status: ReportStatus.IN_PROGRESS },
    });

    const resolvedReports = await db.report.count({
      where: { status: ReportStatus.RESOLVED },
    });

    // Calculate percentage changes (in a real app you might compare with previous period)
    // This is placeholder logic - you would implement your own business logic
    const growthRate =
      totalReports > 0
        ? Math.round((resolvedReports / totalReports) * 100) / 10
        : 0;

    return {
      success: true,
      totalReports,
      submittedReports,
      inProgressReports,
      resolvedReports,
      growthRate,
      // Sample trends - in a real app, you would calculate these based on historical data
      totalTrend: 12.5,
      submittedTrend: -20,
      inProgressTrend: 12.5,
      resolvedTrend: 4.5,
    };
  } catch (error) {
    console.error("Error fetching report counts:", error);
    return {
      success: false,
      error: "Failed to fetch report statistics",
    };
  }
}

export async function updateReportStatus(
  trackingId: string,
  status: string,
  notes?: string
) {
  try {
    const report = await db.report.findUnique({
      where: {
        trackingId,
      },
    });

    if (!report) {
      return { success: false, error: "Report not found" };
    }

    // Convert string status to ReportStatus enum
    let reportStatus: ReportStatus;
    switch (status) {
      case "SUBMITTED":
        reportStatus = ReportStatus.SUBMITTED;
        break;
      case "UNDER_REVIEW":
        reportStatus = ReportStatus.UNDER_REVIEW;
        break;
      case "IN_PROGRESS":
        reportStatus = ReportStatus.IN_PROGRESS;
        break;
      case "RESOLVED":
        reportStatus = ReportStatus.RESOLVED;
        break;
      default:
        reportStatus = ReportStatus.SUBMITTED;
    }

    const updatedReport = await db.report.update({
      where: {
        trackingId,
      },
      data: {
        status: reportStatus,
        updatedAt: new Date(),
        // In a real application, you might want to store notes in a separate table
        // with a relation to the report
      },
    });

    // Create a status update record (in a real app)
    // await db.statusUpdate.create({
    //   data: {
    //     reportId: report.id,
    //     previousStatus: report.status,
    //     newStatus: status,
    //     notes: notes || "",
    //     createdBy: "current-user-id", // You would get this from auth
    //   },
    // });

    // Revalidate related paths
    revalidatePath(`/report/${trackingId}`);
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return { success: true, report: updatedReport };
  } catch (error) {
    console.error("Error updating report status:", error);
    return { success: false, error: "Failed to update report status" };
  }
}
