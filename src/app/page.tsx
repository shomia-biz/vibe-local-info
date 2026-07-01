import HomeContentWrapper from './HomeContentWrapper';
import { getSortedPostsData } from '@/lib/posts';

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

  return <HomeContentWrapper blogPosts={blogPosts} />;
}
