// app/actions/submitReportAction.ts
"use server";

import { cookies } from "next/headers";
import crypto from "crypto";

export type SubmitRequest = {
  clientHash: string;
  challenge: string;
  nonce: number;
  powDifficulty: number;
  sliderValue: number;
};

const COOKIE_NAME = "submission_count";
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds
let globalRequestCount = 0;

/**
 * Validate the Proof-of-Work by hashing the challenge and nonce.
 */
function validatePoW(challenge: string, nonce: number, difficulty: number): boolean {
  const hash = crypto.createHash("sha256").update(challenge + nonce.toString()).digest("hex");
  return hash.startsWith("0".repeat(difficulty));
}

/**
 * Validate the human verification slider (between 70% and 80%).
 */
function validateHumanCheck(sliderValue: number): boolean {
  return sliderValue >= 700 && sliderValue <= 800;
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
    // Get the cookie store from Next.js headers API.
    const cookieStore = await cookies();

    // Read the current submission count (default to 0 if not set).
    const submissionCount = parseInt(cookieStore.get(COOKIE_NAME)?.value || "0", 10);

    // If limit is reached, return an error response.
    if (submissionCount >= 3) {
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

    // Increment submission count.
    const newCount = submissionCount + 1;
    (await cookies()).set(COOKIE_NAME, newCount.toString(), {
      path: "/",
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
    });

    return {
      success: true,
      remainingSubmissions: 3 - newCount,
      newDifficulty,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("Submission error:", error);
    return { error: "Internal server error", status: 500 };
  }
}
