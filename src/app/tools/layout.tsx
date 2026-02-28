import ProtectedRoute from "@/components/ProtectedRoute";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
