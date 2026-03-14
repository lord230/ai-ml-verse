import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CNN Roadmap',
    description: 'See pooling layers, strides, and sliding convolution filters animate live over images. Build deep understanding of Convolutional Neural Networks step by step.',
    alternates: {
        canonical: 'https://www.aimlverse.in/learn/cnn-roadmap',
    },
    openGraph: {
        title: 'CNN Roadmap | AI ML Verse',
        description: 'See pooling layers, strides, and convolution filters animate live over images.',
        url: 'https://www.aimlverse.in/learn/cnn-roadmap',
    },
};

export default function CnnRoadmapLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
