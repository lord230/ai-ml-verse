import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aimlverse.in';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/'], // Disallow crawling API routes
        },
        sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/visuals/sitemap.xml`],
    };
}
