import { ReactNode } from "react";

// This layout simply passes children through.
// Navigation and auth checks are handled inside the dashboard page itself.
export default function DashboardLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
