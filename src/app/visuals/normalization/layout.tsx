import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Normalization Visualizer',
    description: 'Geometric intuition for Batch, Layer, Instance, and Group Normalization using interactive 3D tensor visualizations. See exactly how each algorithm normalizes across different axes.',
    alternates: {
        canonical: 'https://www.aimlverse.in/visuals/normalization',
    },
    openGraph: {
        title: 'Normalization Visualizer | AI ML Verse',
        description: 'Interactive 3D visualizations of Batch, Layer, Instance, and Group Normalization.',
        url: 'https://www.aimlverse.in/visuals/normalization',
    },
};

export default function NormalizationVisualsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
