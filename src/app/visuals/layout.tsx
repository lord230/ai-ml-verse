import type { Metadata } from 'next';
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata: Metadata = {
    title: 'ML Visual Playground',
    description: 'Develop geometric intuition for modern machine learning. Interactive visualizations of gradient descent, decision boundaries, backpropagation, normalization, and activation functions.',
    alternates: {
        canonical: 'https://www.aimlverse.in/visuals',
    },
    openGraph: {
        title: 'ML Visual Playground | AI ML Verse',
        description: 'Interactive visualizations of gradient descent, decision boundaries, backpropagation, and more.',
        url: 'https://www.aimlverse.in/visuals',
    },
};

export default function VisualsLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
