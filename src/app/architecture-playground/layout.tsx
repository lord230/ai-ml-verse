import ProtectedRoute from "@/components/ProtectedRoute";

export default function ArchitecturePlaygroundLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
