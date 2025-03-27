project name -aegis
description -A secure platform for users to confidentially report corruption incidents with detailed descriptions and supporting evidence. The system ensures anonymity, removes metadata from uploaded files, and prevents spam through rate limiting and human verification. Admins can manage reports via a dashboard, with AI-powered analysis to assess severity and prioritize cases. 🚀

team members name
1. prashant chouhan
2.atharva raj singh thakur
3. tanishka bhagat

technologies used-
nextjs ,supabase, prisma, tailwind css, gemini ,api ,crypto.js ,zod

.env
# Connect to Supabase via connection pooling
DATABASE_URL="your_supabase_database_url"

# Direct connection to the database (used for migrations)
DIRECT_URL="your_direct_database_url"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# NextAuth.js configuration
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="your_nextauth_url"

# Admin email for privileged access
ADMIN_EMAIL="admin@example.com"

# API Key for Gemini AI (used for AI analysis in reports)
GEMINI_API_KEY="your_gemini_api_key"
