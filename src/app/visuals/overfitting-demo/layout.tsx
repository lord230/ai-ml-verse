import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Overfitting & Bias-Variance Demo',
    description: 'Understand the bias-variance tradeoff by tuning model complexity on noisy regression targets. Visually observe underfitting, perfect fit, and overfitting as you adjust polynomial degree.',
    alternates: {
        canonical: 'https://www.aimlverse.in/visuals/overfitting-demo',
    },
    openGraph: {
        title: 'Overfitting Demo | AI ML Verse',
        description: 'Tune model complexity to observe underfitting, good fit, and overfitting visually.',
        url: 'https://www.aimlverse.in/visuals/overfitting-demo',
    },
};

export default function OverfittingDemoLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
