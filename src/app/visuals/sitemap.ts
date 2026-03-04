import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aimlverse.in/';
    const routes = [
        '/visuals',
        '/visuals/decision-boundary',
        '/visuals/gradient-descent',
        '/visuals/overfitting-demo',
        '/visuals/backprop',
    ];
    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '/visuals' ? 'weekly' : 'monthly',
        priority: route === '/visuals' ? 0.9 : 0.7,
    }));
}
