import { MetadataRoute } from 'next';

/**
 * This file is intentionally empty.
 * All sitemap entries — including visuals routes — are defined in
 * the root `app/sitemap.ts` to avoid duplicate Googlebot crawl issues
 * ("Page with redirect in sitemap" / "Duplicate without user-selected canonical").
 */
export default function sitemap(): MetadataRoute.Sitemap {
    return [];
}
