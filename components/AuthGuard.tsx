// components/AuthGuard.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    console.log("isAdmin",session?.user.isAdmin)

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated" || !session?.user?.isAdmin) {
            router.push("/admin/login");
        }
    }, [status, router, session?.user?.isAdmin]);

    return <>{children}</>;
};

export default AuthGuard;
