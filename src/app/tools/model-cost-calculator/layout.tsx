import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Model Cost Calculator',
    description: 'Accurately calculate GPU VRAM constraints, multi-node training times, and quantization overheads for large language and vision models.',
    alternates: {
        canonical: 'https://www.aimlverse.in/tools/model-cost-calculator',
    },
    openGraph: {
        title: 'Model Cost Calculator | AI ML Verse',
        description: 'Calculate GPU VRAM, training time, and quantization costs for ML models.',
        url: 'https://www.aimlverse.in/tools/model-cost-calculator',
    },
};

export default function ModelCostCalculatorLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
