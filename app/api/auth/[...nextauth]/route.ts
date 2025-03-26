// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const adminEmail = process.env.ADMIN_EMAIL ?? ""; // Ensure it's always a string

export const authOptions: NextAuthOptions = { 
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, token }) {
            if (session?.user) {
                session.user.isAdmin = token.isAdmin as boolean;
            }
            return session;
        },
        async jwt({ token }) {  // Use token instead of profile
            if (token.email === adminEmail) {
                token.isAdmin = true;
            } else {
                token.isAdmin = false;
            }
            return token;
        },
        async signIn({ profile }) {
            if (profile?.email !== adminEmail) {  // Corrected condition
                console.log(`Sign-in blocked for email: ${profile?.email}`);
                return false; // Reject sign-in
            }
            return true; // Accept sign-in
        },
    },
    pages: {
        signIn: '/admin/login',  // Custom sign-in page
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
