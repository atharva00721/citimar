/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import db from "@/lib/prisma";
import { reportSchema } from "@/schemas/report-schema";
import { ZodError } from "zod";
import { ReportStatus } from "@prisma/client";
import { encrypt, decrypt } from "@/utils/encrypt";

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
    const categoryId = formData.get("categoryId") as string;
    const files = formData.getAll("evidence") as File[];

    // Create object for Zod validation
    const dataToValidate = {
      title,
      description,
      categoryId,
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

    // Encrypt the report content before storing
    const encryptedContent = encrypt(description);
    const encryptedTitle = encrypt(title);

    // Store report in database with encrypted content
    await db.report.create({
      data: {
        trackingId,
        title: encryptedTitle,
        content: encryptedContent,
        status: ReportStatus.SUBMITTED,
        categoryId: categoryId, // Add the category ID from form
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

import { Report } from "@/types/report";

export async function getReportByTrackingId(trackingId: string): Promise<{
  success: boolean;
  report?: Report;
}> {
  try {
    const report = await db.report.findUnique({
      where: { trackingId },
      include: { evidence: true, category: true },
    });

    if (!report) {
      return { success: false };
    }

    // Use secret key from env or default value
    const secretKey = process.env.DEFAULT_SECRET_KEY || "defaultSecretKey";

    // Decrypt the fields if possible
    let { title, content } = report;
    try {
      title =
        typeof decrypt(title, secretKey) === "string"
          ? (decrypt(title, secretKey) as string)
          : title;
      content =
        typeof decrypt(content, secretKey) === "string"
          ? (decrypt(content, secretKey) as string)
          : content;
    } catch (e) {
      console.error("Decryption error in getReportByTrackingId:", e);
    }

    return { success: true, report: { ...report, title, content } as Report };
  } catch (e) {
    console.error(e);
    return { success: false };
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
      // totalTrend: 12.5,
      // submittedTrend: -20,
      // inProgressTrend: 12.5,
      // resolvedTrend: 4.5,
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

    // If notes are provided, encrypt them before storing
    const updatedData: any = {
      status: reportStatus,
      updatedAt: new Date(),
    };

    if (notes) {
      updatedData.notes = encrypt(notes);
    }

    const updatedReport = await db.report.update({
      where: {
        trackingId,
      },
      data: updatedData,
    });

    // Decrypt content and title before returning to client
    const decryptedReport = {
      ...updatedReport,
      title: decrypt(updatedReport.title) as string,
      content: decrypt(updatedReport.content) as string,
    };

    // // If notes exist in the updated report, decrypt them too
    // if (updatedReport.notes) {
    //   decryptedReport.notes = decrypt(updatedReport.notes) as string;
    // }

    // Revalidate related paths
    revalidatePath(`/report/${trackingId}`);
    revalidatePath("/admin/dashboard");
    revalidatePath("/reports");

    return { success: true, report: decryptedReport };
  } catch (error) {
    console.error("Error updating report status:", error);
    return { success: false, error: "Failed to update report status" };
  }
}

// Add a function to decrypt reports when fetching multiple reports
export async function getReports(filter?: any) {
  try {
    const reports = await db.report.findMany({
      where: filter,
      include: {
        evidence: true,
        category: true, // Include the category information
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Decrypt all report content and titles
    const decryptedReports = reports.map((report) => ({
      ...report,
      title: decrypt(report.title) as string,
      content: decrypt(report.content) as string,
      // notes: report.notes ? (decrypt(report.notes) as string) : null,
    }));

    return { success: true, reports: decryptedReports };
  } catch (error) {
    console.error("Error fetching reports:", error);
    return { success: false, error: "Failed to fetch reports" };
  }
}
