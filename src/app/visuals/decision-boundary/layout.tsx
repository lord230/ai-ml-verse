import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Decision Boundary Visualizer',
    description: 'Watch how a classifier finds the separating hyperplane for 2D data point clouds. Understand decision boundaries intuitively with an interactive visualization.',
    alternates: {
        canonical: 'https://www.aimlverse.in/visuals/decision-boundary',
    },
    openGraph: {
        title: 'Decision Boundary Visualizer | AI ML Verse',
        description: 'Interactive decision boundary visualization for 2D classification datasets.',
        url: 'https://www.aimlverse.in/visuals/decision-boundary',
    },
};

export default function DecisionBoundaryLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
