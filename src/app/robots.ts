import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/auth/',
                    '/dashboard/',
                ],
            },
        ],
        sitemap: 'https://www.aimlverse.in/sitemap.xml',
    };
}
