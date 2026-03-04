import { NextResponse } from 'next/server';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aimlverse.in';

    const routes = [
        '/visuals',
        '/visuals/decision-boundary',
        '/visuals/gradient-descent',
        '/visuals/overfitting-demo',
        '/visuals/backprop'
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${route === '/visuals' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route === '/visuals' ? 0.9 : 0.7}</priority>
  </url>`).join('  \n')}
</urlset>`;

    return new NextResponse(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
