import { NextResponse } from 'next/server';

/**
 * This manual XML sitemap endpoint is no longer needed.
 * All sitemap entries are served from the root `app/sitemap.ts`
 * which Next.js automatically exposes at /sitemap.xml.
 * Returning 404 prevents Google from indexing a stale duplicate sitemap.
 */
export async function GET() {
    return new NextResponse(null, { status: 404 });
}
