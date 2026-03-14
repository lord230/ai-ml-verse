import type { Metadata } from 'next';
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = {
    title: 'Architecture Playground',
    description: 'Visualize MLP, CNN, and Transformer architectures. See how parameters scale, memory changes, and compute grows — with interactive controls.',
    alternates: {
        canonical: 'https://www.aimlverse.in/architecture-playground',
    },
    openGraph: {
        title: 'Architecture Playground | AI ML Verse',
        description: 'Visualize MLP, CNN, and Transformer architectures interactively.',
        url: 'https://www.aimlverse.in/architecture-playground',
    },
};

export default function ArchitecturePlaygroundLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
