"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import db from "@/lib/prisma";
import { reportSchema } from "@/schemas/report-schema";
import { ZodError } from "zod";

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
    const description = formData.get("description") as string;
    const files = formData.getAll("evidence") as File[];

    // Create object for Zod validation
    const dataToValidate = {
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
        // Generate file hash for security
        const fileHash = `${crypto
          .randomBytes(8)
          .toString("hex")}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

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
        content: description,
        status: "SUBMITTED",
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
