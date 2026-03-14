import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Gradient Descent Simulator',
    description: 'Interactive simulator of the core optimization algorithm behind deep learning. Adjust learning rate, momentum, and optimizer type to see convergence or divergence in real time.',
    alternates: {
        canonical: 'https://www.aimlverse.in/visuals/gradient-descent',
    },
    openGraph: {
        title: 'Gradient Descent Simulator | AI ML Verse',
        description: 'Adjust learning rates and visualize loss landscape optimization in real time.',
        url: 'https://www.aimlverse.in/visuals/gradient-descent',
    },
};

export default function GradientDescentLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
