import { PrismaClient, ReportStatus } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// Generate a secure tracking ID
function generateTrackingId(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

async function seed() {
  try {
    console.log("Starting to seed database...");

    // Create sample reports
    const reports = [
      {
        trackingId: generateTrackingId(),
        title: "Suspicious Activity in Downtown Area",
        content:
          "I witnessed unusual behavior near the main square yesterday evening around 9 PM. Several individuals were repeatedly circling the area and appeared to be monitoring the bank entrance.",
        status: ReportStatus.SUBMITTED,
        evidence: [
          { fileHash: "file1.jpg", fileType: "image", encrypted: true },
          { fileHash: "file2.mp4", fileType: "video", encrypted: true },
        ],
      },
      {
        trackingId: generateTrackingId(),
        title: "Environmental Violation at Riverside Factory",
        content:
          "The manufacturing plant by the river appears to be dumping chemical waste directly into the water. I've noticed discoloration in the water and there's a strong chemical smell in the area. This has been ongoing for at least two weeks.",
        status: ReportStatus.IN_PROGRESS,
        evidence: [
          { fileHash: "file3.jpg", fileType: "image", encrypted: true },
          { fileHash: "file4.jpg", fileType: "image", encrypted: true },
          { fileHash: "file5.pdf", fileType: "document", encrypted: true },
        ],
      },
      {
        trackingId: generateTrackingId(),
        title: "Workplace Safety Concerns",
        content:
          "I'd like to report unsafe working conditions at the construction site on Main Street. Workers are not being provided with proper safety equipment, and there have been several near-miss incidents in the past week.",
        status: ReportStatus.IN_PROGRESS,
        evidence: [
          { fileHash: "file6.jpg", fileType: "image", encrypted: true },
        ],
      },
      {
        trackingId: generateTrackingId(),
        title: "Financial Irregularities in Department Budget",
        content:
          "I've noticed some concerning patterns in the quarterly financial reports. Several large transactions don't have proper documentation, and there appear to be discrepancies between reported expenses and actual costs.",
        status: ReportStatus.RESOLVED,
        evidence: [
          { fileHash: "file7.pdf", fileType: "document", encrypted: true },
          { fileHash: "file8.xlsx", fileType: "document", encrypted: true },
        ],
      },
      {
        trackingId: generateTrackingId(),
        title: "Data Privacy Breach",
        content:
          "I believe customer data is being mishandled. I've observed staff accessing sensitive information without authorization and potentially sharing it with external parties. This has happened multiple times over the past month.",
        status: ReportStatus.RESOLVED,
        evidence: [
          { fileHash: "file9.mp3", fileType: "audio", encrypted: true },
          { fileHash: "file10.txt", fileType: "document", encrypted: true },
        ],
      },
    ];

    // Clear existing data
    await prisma.evidence.deleteMany();
    await prisma.report.deleteMany();

    // Insert new data
    for (const report of reports) {
      const { evidence, ...reportData } = report;

      await prisma.report.create({
        data: {
          ...reportData,
          evidence: {
            create: evidence,
          },
        },
      });
    }

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
