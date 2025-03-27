// app/actions/submitReportAction.ts
"use server";

import {  headers } from "next/headers";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

export type SubmitRequest = {
  clientHash: string;
  challenge: string;
  nonce: number;
  powDifficulty: number;
  sliderValue: number;
};

const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds
const MAX_SUBMISSIONS_PER_USER=3
let globalRequestCount = 0;

// Store the current target range
let currentTargetRange = 0;
const prisma = new PrismaClient()
/**
 * Get a new random target range for human verification
 */
export async function getTargetRange() {
  currentTargetRange = Math.floor(Math.random() * 101); // Random number between 0 and 100
  return currentTargetRange;
}

/**
 * Validate the Proof-of-Work by hashing the challenge and nonce.
 */
function validatePoW(challenge: string, nonce: number, difficulty: number): boolean {
  const hash = crypto.createHash("sha256").update(challenge + nonce.toString()).digest("hex");
  return hash.startsWith("0".repeat(difficulty));
}

/**
 * Validate the human verification slider against the current target range
 */
function validateHumanCheck(sliderValue: number): boolean {
  // Allow a small margin of error (±5)
  const marginOfError = 5;
  // sliderValue is already in 0-100 range from client
  return Math.abs(sliderValue - currentTargetRange) <= marginOfError;
}

function generateCombinedKey(ip: string, clientHash: string): string {
  return crypto.createHash("sha256").update(ip + clientHash).digest("hex");
}


/**
 * Server action to handle report submission.
 * Reads and updates the cookie for rate limiting.
 *
 * @param body - The submitted report data.
 * @returns A response object containing success status and remaining submissions.
 */
export async function submitReportAction(body: SubmitRequest) {
  try {
    const { clientHash } = body;  
    const headersList = await headers();

    // Get IP address from headers
    const ip = headersList.get("x-forwarded-for") || 
               headersList.get("x-real-ip") || 
               "unknown";

    // Generate rate limit key from IP and client hash
    const combinedKey = generateCombinedKey(ip, clientHash);

    let rateLimitRecord = await prisma.rateLimit.findUnique({
      where: { key: combinedKey },
    });
    const currentTime = new Date();

    if (!rateLimitRecord) {
      rateLimitRecord = await prisma.rateLimit.create({
        data: {
          key: combinedKey,
          submissionCount: 0,
          lastSubmission: currentTime,
        },
      });
    } else {
      // If more than 24 hours have passed since the last submission, reset the count.
      const timeDifference = currentTime.getTime() - new Date(rateLimitRecord.lastSubmission).getTime();
      if (timeDifference > COOKIE_MAX_AGE * 1000) {
        rateLimitRecord = await prisma.rateLimit.update({
          where: { id: rateLimitRecord.id },
          data: {
            submissionCount: 0,
            lastSubmission: currentTime,
          },
        });
      }
    }

    if (rateLimitRecord.submissionCount >= MAX_SUBMISSIONS_PER_USER) {
      return {
        error: "Too many submissions (max 3 per day)",
        status: 429,
      };
    }

    // Validate the Proof-of-Work.
    if (!validatePoW(body.challenge, body.nonce, body.powDifficulty)) {
      return { error: "Invalid proof of work", status: 400 };
    }

    // Validate the human check slider.
    if (!validateHumanCheck(body.sliderValue)) {
      return { error: "Please complete the human verification correctly", status: 400 };
    }

    // Adaptive difficulty: adjust the required zeros based on global request count.
    globalRequestCount++;
    let newDifficulty = 2;
    if (globalRequestCount > 100) newDifficulty = 4;
    else if (globalRequestCount > 50) newDifficulty = 3;

      // Increment the submission count and update lastSubmission
      const newSubmissionCount = rateLimitRecord.submissionCount + 1;
      await prisma.rateLimit.update({
        where: { id: rateLimitRecord.id },
        data: {
          submissionCount: newSubmissionCount,
          lastSubmission: currentTime,
        },
      });
  
      return {
        success: true,
        remainingSubmissions: MAX_SUBMISSIONS_PER_USER - newSubmissionCount,
        newDifficulty,
      };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("Submission error:", error);
    return { error: "Internal server error", status: 500 };
  }
}
