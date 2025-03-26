// app/api/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rateLimiter";
import crypto from "crypto";

type SubmitRequest = {
  clientHash: string;
  challenge: string;
  nonce: number;
  powDifficulty: number;
  sliderValue: number;
};

let globalRequestCount = 0;

// Validate Proof-of-Work
const validatePoW = (
  challenge: string,
  nonce: number,
  difficulty: number
): boolean => {
  const hash = crypto
    .createHash("sha256")
    .update(challenge + nonce.toString())
    .digest("hex");
  return hash.startsWith("0".repeat(difficulty));
};

// Validate human check slider
const validateHumanCheck = (sliderValue: number): boolean => {
  return sliderValue >= 700 && sliderValue <= 800;
};

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body: SubmitRequest = await request.json();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    const userAgent = request.headers.get("user-agent") || "";

    // Initialize rate limiter (in-memory)
    const limiter = createRateLimiter({
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      max: 3, // Max 3 submissions per day
    });

    // Create unique identifier
    const identifier = crypto
      .createHash("sha256")
      .update(body.clientHash + ip + userAgent)
      .digest("hex");

    // Check rate limit
    const { success, remaining } = limiter.limit(identifier);
    console.log("Rate limit:", success, remaining);
    if (!success) {
      return NextResponse.json(
        { error: "Too many submissions (max 3 per day)" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": "86400", // 24h in seconds
          },
        }
      );
    }

    // Validate Proof-of-Work
    if (!validatePoW(body.challenge, body.nonce, body.powDifficulty)) {
      return NextResponse.json(
        { error: "Invalid proof of work" },
        { status: 400 }
      );
    }

    // Validate human check
    if (!validateHumanCheck(body.sliderValue)) {
      return NextResponse.json(
        { error: "Please complete the human verification correctly" },
        { status: 400 }
      );
    }

    // Adaptive difficulty
    globalRequestCount++;
    let newDifficulty = 2;
    if (globalRequestCount > 100) newDifficulty = 4;
    else if (globalRequestCount > 50) newDifficulty = 3;

    return NextResponse.json(
      {
        success: true,
        remainingSubmissions: remaining,
      },
      {
        headers: {
          "X-Pow-Difficulty": newDifficulty.toString(),
          "Cache-Control": "no-store, max-age=0",
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": "86400",
        },
      }
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
