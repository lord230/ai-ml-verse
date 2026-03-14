import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Transformers & Attention',
    description: 'Master Transformers from basics to bare metal. Visualize self-attention token maps, build multi-head attention from scratch, and understand why this architecture changed AI forever.',
    alternates: {
        canonical: 'https://www.aimlverse.in/learn/transformers',
    },
    openGraph: {
        title: 'Transformers & Attention | AI ML Verse',
        description: 'Visualize self-attention, multi-head attention, and positional encodings with interactive demos.',
        url: 'https://www.aimlverse.in/learn/transformers',
    },
};

export default function TransformersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
