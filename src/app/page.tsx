import HomeContentWrapper from './HomeContentWrapper';
import { getSortedPostsData } from '@/lib/posts';
import { getSortedGuidesData } from '@/lib/guide';

export default function Home() {
  const allPosts = getSortedPostsData();
  const blogPosts = allPosts.map(post => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    category: post.category || '새소식',
    tags: post.tags || [],
    summary: post.summary || '',
  }));

  const allGuides = getSortedGuidesData();
  const guidePosts = allGuides.map(guide => ({
    slug: guide.slug,
    title: guide.title,
    date: guide.date,
    category: guide.category || '정보',
    summary: guide.summary || '',
    thumbnail: guide.thumbnail || 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=800&q=80',
  }));

  return <HomeContentWrapper blogPosts={blogPosts} guidePosts={guidePosts} />;
}
