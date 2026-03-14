import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.aimlverse.in';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        // ── Home ──────────────────────────────────────────────────────────
        {
            url: BASE_URL,
            lastModified: new Date('2025-11-01'),
            changeFrequency: 'monthly',
            priority: 1.0,
        },
        // ── Architecture Playground ───────────────────────────────────────
        {
            url: `${BASE_URL}/architecture-playground`,
            lastModified: new Date('2025-12-01'),
            changeFrequency: 'monthly',
            priority: 0.75,
        },
        // ── Learn section (priority 0.9) ──────────────────────────────────
        {
            url: `${BASE_URL}/learn/transformers`,
            lastModified: new Date('2025-12-15'),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/learn/cnn-roadmap`,
            lastModified: new Date('2025-12-01'),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/learn/normalization`,
            lastModified: new Date('2025-11-15'),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        // ── Visuals section (priority 0.8) ────────────────────────────────
        {
            url: `${BASE_URL}/visuals`,
            lastModified: new Date('2025-12-01'),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/visuals/decision-boundary`,
            lastModified: new Date('2025-11-01'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/visuals/gradient-descent`,
            lastModified: new Date('2025-11-01'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/visuals/overfitting-demo`,
            lastModified: new Date('2025-11-15'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/visuals/backprop`,
            lastModified: new Date('2025-12-01'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/visuals/normalization`,
            lastModified: new Date('2025-11-15'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/visuals/activations`,
            lastModified: new Date('2025-12-15'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        // ── Tools section (priority 0.7) ──────────────────────────────────
        {
            url: `${BASE_URL}/tools/dataset-explorer`,
            lastModified: new Date('2025-11-01'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/tools/model-cost-calculator`,
            lastModified: new Date('2025-11-15'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];
}
