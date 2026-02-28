import ProtectedRoute from "@/components/ProtectedRoute";

export default function VisualsLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
