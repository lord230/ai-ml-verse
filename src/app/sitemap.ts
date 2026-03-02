import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    // Rely on environment variable or fallback to a placeholder domain
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aimlverse.in/';

    // Core public and feature routes
    const routes = [
        '',
        '/architecture-playground',
        '/learn/transformers',
        '/learn/cnn-roadmap',
        '/learn/normalization',
        '/tools/dataset-explorer',
        '/tools/model-cost-calculator',
        '/visuals',
        '/visuals/decision-boundary',
        '/visuals/gradient-descent',
        '/visuals/overfitting-demo',
        '/visuals/backprop'
    ];

    // Build the sitemap array
    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'monthly' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
    }));
}
