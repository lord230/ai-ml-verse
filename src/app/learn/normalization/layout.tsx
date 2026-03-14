import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '3D Normalization — Batch, Layer, Instance, Group',
    description: 'Geometric intuition for Batch, Layer, Instance, and Group Normalization using interactive 3D tensor visualizations. Understand why normalization matters in deep learning.',
    alternates: {
        canonical: 'https://www.aimlverse.in/learn/normalization',
    },
    openGraph: {
        title: '3D Normalization | AI ML Verse',
        description: 'Geometric intuition for Batch, Layer, Instance, and Group Normalization in 3D.',
        url: 'https://www.aimlverse.in/learn/normalization',
    },
};

export default function NormalizationLearnLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
