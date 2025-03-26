// components/ClientProvider.tsx
"use client";

import { SessionProvider } from 'next-auth/react';

interface ClientProviderProps {
    children: React.ReactNode;
}

function ClientProvider({ children }: ClientProviderProps) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    );
}

export default ClientProvider;
