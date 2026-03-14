import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dataset Explorer',
    description: 'Explore and analyze machine learning datasets interactively. Understand data distributions, class imbalances, and feature relationships in real time.',
    alternates: {
        canonical: 'https://www.aimlverse.in/tools/dataset-explorer',
    },
    openGraph: {
        title: 'Dataset Explorer | AI ML Verse',
        description: 'Explore and analyze machine learning datasets interactively.',
        url: 'https://www.aimlverse.in/tools/dataset-explorer',
    },
};

export default function DatasetExplorerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
