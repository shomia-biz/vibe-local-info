import { getPostData, getSortedPostsData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostData(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#FFFBF7] py-16">
      <article className="max-w-3xl mx-auto px-4">
        <header className="mb-10 text-center">
          <div className="inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full font-bold mb-4">
            {post.category}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            {post.title}
          </h1>
          <div className="text-gray-500 font-medium">{post.date}</div>
        </header>

        {/* 블로그 본문 - Tailwind Typography 적용 (글자색을 검정색으로 설정) */}
        <div className="prose prose-orange lg:prose-xl max-w-none bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-orange-50 text-gray-900">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* 태그 목록 */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {post.tags.map((tag) => (
            <span key={tag} className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* 하단 네비게이션 */}
        <div className="mt-16 pt-8 border-t border-orange-100 flex justify-center">
          <Link 
            href="/blog" 
            className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-2 transition-colors"
          >
            <span>←</span> 목록으로 돌아가기
          </Link>
        </div>
      </article>
    </main>
  );
}
