import { NextResponse } from 'next/server';
import type { MetadataRoute } from 'next';

// Re‑use the existing visual routes definition
import visualRoutes from './sitemap'; // this exports the array of routes

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aimlverse.in';
    const routes = visualRoutes(); // returns MetadataRoute.Sitemap array

    const xmlEntries = routes
        .map((route) => {
            const url = `${baseUrl}${route.url}`;
            const lastMod = route.lastModified?.toISOString().split('T')[0] ?? new Date().toISOString().split('T')[0];
            const changeFreq = route.changeFrequency ?? 'weekly';
            const priority = route.priority?.toString() ?? '0.7';
            return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>${changeFreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
        })
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries}\n</urlset>`;

    return new NextResponse(xml, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
