import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

const RATE_LIMIT = 3; // Max submissions per 24 hours
const COOKIE_NAME = "submission_count";

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales: [
    "en",
    "hi", // Hindi
    "bn", // Bengali
    "ta", // Tamil
    "te", // Telugu
    "mr", // Marathi
    "gu", // Gujarati
    "kn", // Kannada
    "ml", // Malayalam
    "pa", // Punjabi
    "ur", // Urdu
  ],
  defaultLocale: "en",
});

export async function middleware(request: NextRequest) {
  // Rate limiting logic for the API route
  if (request.nextUrl.pathname === "/api/submit") {
    // Get submission count from cookies
    const cookieHeader = request.cookies.get(COOKIE_NAME)?.value;
    const submissionCount = parseInt(cookieHeader || "0", 10);

    if (submissionCount >= RATE_LIMIT) {
      return NextResponse.json(
        { error: "Too many submissions (max 3 per day)" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": "86400", // 24 hours
          },
        }
      );
    }

    return NextResponse.next();
  }

  // For non-API routes, apply the internationalization middleware
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return intlMiddleware(request);
  }

  return NextResponse.next();
}

// Combine matchers for both API rate limiting and internationalization
export const config = {
  matcher: ["/api/submit", "/((?!api|_next|.*\\..*).*)"],
};
