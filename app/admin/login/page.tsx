// app/admin/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
    const router = useRouter();

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
            <button
                onClick={() => signIn("google", { callbackUrl: '/admin' })}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Sign in with Google
            </button>
        </div>
    );
}
