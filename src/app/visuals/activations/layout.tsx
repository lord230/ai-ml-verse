import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Activation Functions Lab',
    description: 'Interactive laboratory to explore how activation functions transform data. Visualize ReLU, Sigmoid, Tanh, GELU, Swish, and more — with live mathematical plots and derivative analysis.',
    alternates: {
        canonical: 'https://www.aimlverse.in/visuals/activations',
    },
    openGraph: {
        title: 'Activation Functions Lab | AI ML Verse',
        description: 'Explore ReLU, Sigmoid, GELU, and more with live mathematical visualizations.',
        url: 'https://www.aimlverse.in/visuals/activations',
    },
};

export default function ActivationsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
