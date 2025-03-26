import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

type SubmitRequest = {
  clientHash: string;
  challenge: string;
  nonce: number;
  powDifficulty: number;
  sliderValue: number;
};

const COOKIE_NAME = 'submission_count';
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds
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

    // Create unique identifier
    const identifier = crypto
      .createHash("sha256")
      .update(body.clientHash + ip + userAgent)
      .digest('hex');
    console.log("Identifier:", identifier);

    // Read submission count from cookies (use read-only method)
    const submissionCount = parseInt(request.cookies.get(COOKIE_NAME)?.value || '0', 10);

    // If limit exceeded, return an error
    if (submissionCount >= 3) {
      return NextResponse.json(
        { error: "Too many submissions (max 3 per day)" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": "86400", // 24h in seconds
          },
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': '86400'
          }
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

    // Increment submission count
    const newCount = submissionCount + 1;

    return NextResponse.json(
      {
        success: true,
        remainingSubmissions: 3 - newCount
      },
      {
        headers: {
          'Set-Cookie': `${COOKIE_NAME}=${newCount}; Path=/; HttpOnly; Max-Age=${COOKIE_MAX_AGE}`,
          'X-Pow-Difficulty': newDifficulty.toString(),
          'Cache-Control': 'no-store, max-age=0',
          'X-RateLimit-Remaining': (3 - newCount).toString(),
          'X-RateLimit-Reset': '86400'
        }
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
