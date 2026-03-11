import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    // Rely on environment variable or fallback to a placeholder domain
    const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aimlverse.in';
    // Remove any trailing slash from the base URL if it's unintentionally set in the .env file
    const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

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
        '/visuals/backprop',
        '/visuals/normalization',
        '/visuals/activations'
    ];

    // Build the sitemap array
    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'monthly' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
    }));
}
