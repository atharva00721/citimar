// app/admin/page.tsx
import AuthGuard from "@/components/AuthGuard";

export default function AdminDashboard() {
    return (
        <AuthGuard>
            <h1>Admin Dashboard</h1>
            {/* Admin-specific content */}
        </AuthGuard>
    );
}
