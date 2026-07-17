export const dynamic = 'force-static';

import { MetadataRoute } from 'next';
import { getSortedPostsData } from '@/lib/posts';
import localData from '../../public/data/local-info.json';

const BASE_URL = 'https://moa-tips.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // 1. Static Pages
  const staticRoutes = [
    '',
    '/about',
    '/terms',
    '/privacy',
    '/disclaimer',
    '/contact',
    '/blog',
    '/guide',
    '/fortune',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Blog Posts
  const posts = getSortedPostsData();
  const blogRoutes = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 3. Detail Pages (Local Info)
  const detailRoutes: MetadataRoute.Sitemap = [];
  const keys = [
    "events", "benefits", "nationalEvents", "seoulEvents", "kyeonggiEvents", "incheonEvents",
    "seoulBenefits", "kyeonggiBenefits", "incheonBenefits", "nationalBenefits",
    "cultureEvents", "seoulCultureEvents", "kyeonggiCultureEvents", "incheonCultureEvents", "nationalCultureEvents",
    "exhibitionEvents", "seoulExhibitionEvents", "kyeonggiExhibitionEvents", "incheonExhibitionEvents", "nationalExhibitionEvents"
  ];

  for (const key of keys) {
    const list = (localData as any)[key] || [];
    for (const item of list) {
      detailRoutes.push({
        url: `${BASE_URL}/detail/${key}/${item.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      });
    }
  }

  return [...staticRoutes, ...blogRoutes, ...detailRoutes];
}
