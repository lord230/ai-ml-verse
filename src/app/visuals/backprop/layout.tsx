import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Backpropagation Flow',
    description: 'Step-by-step interactive visualization of how neural networks learn via backpropagation. Follow the gradient flow through a real network with live math at every layer.',
    alternates: {
        canonical: 'https://www.aimlverse.in/visuals/backprop',
    },
    openGraph: {
        title: 'Backpropagation Flow | AI ML Verse',
        description: 'Interactive step-by-step backpropagation with real gradient math.',
        url: 'https://www.aimlverse.in/visuals/backprop',
    },
};

export default function BackpropLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
