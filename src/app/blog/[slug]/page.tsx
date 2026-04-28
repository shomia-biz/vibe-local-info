import { getPostData, getSortedPostsData } from '@/lib/posts';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import fs from 'fs';
import path from 'path';
import AdBanner from '@/components/AdBanner';
import CoupangBanner from '@/components/CoupangBanner';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostData(slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | 송파구 생활 정보`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      url: `https://vibe-local-info.pages.dev/blog/${slug}/`,
    },
  };
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

  // local-info.json에서 원문 링크 찾기
  let sourceLink = '';
  try {
    const localInfoPath = path.join(process.cwd(), 'public/data/local-info.json');
    if (fs.existsSync(localInfoPath)) {
      const localInfo = JSON.parse(fs.readFileSync(localInfoPath, 'utf8'));
      const allData = [
        ...(localInfo.events || []),
        ...(localInfo.benefits || []),
        ...(localInfo.seoulEvents || []),
        ...(localInfo.nationalEvents || [])
      ];
      
      // 제목 키워드 매칭 (가장 간단한 방식)
      const matched = allData.find(item => 
        post.title.includes(item.name) || 
        item.name.split(' ').some((word: string) => word.length > 1 && post.title.includes(word))
      );
      
      if (matched) {
        sourceLink = matched.link;
      }
    }
  } catch (e) {
    console.error('Failed to load source link:', e);
  }

  return (
    <main className="min-h-screen bg-[#FFFBF7] py-16">
      {/* 구조화 데이터: BlogPosting & BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "datePublished": post.date,
              "description": post.summary,
              "author": { "@type": "Organization", "name": "송파구 생활 정보" },
              "publisher": { "@type": "Organization", "name": "송파구 생활 정보" }
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://vibe-local-info.pages.dev/" },
                { "@type": "ListItem", "position": 2, "name": "블로그", "item": "https://vibe-local-info.pages.dev/blog/" },
                { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://vibe-local-info.pages.dev/blog/${slug}/` }
              ]
            }
          ])
        }}
      />
      <article className="max-w-3xl mx-auto px-4">
        <header className="mb-10 text-center">
          <div className="inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full font-bold mb-4">
            {post.category}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            {post.title}
          </h1>
          <div className="flex justify-center items-center gap-4 text-gray-500 font-medium">
            <span>{post.date}</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm">최종 업데이트: {post.date}</span>
          </div>
        </header>

        {/* 블로그 본문 */}
        <div className="prose prose-orange lg:prose-xl max-w-none bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-orange-50 text-gray-900">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* 광고 영역 */}
        <AdBanner />
        <CoupangBanner />

        {/* 출처 및 AI 안내 영역 (E-E-A-T 강화) */}
        <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          {sourceLink && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <span className="block text-sm font-bold text-gray-500 mb-1">🔗 원문 출처</span>
              <a 
                href={sourceLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-orange-600 hover:underline break-all text-sm"
              >
                {sourceLink}
              </a>
            </div>
          )}
          <div className="text-sm text-gray-500 leading-relaxed">
            <p className="font-semibold mb-1">🤖 AI 생성 정보 안내</p>
            <p>
              이 글은 공공데이터포털(<a href="http://data.go.kr/" target="_blank" rel="nofollow" className="underline">http://data.go.kr/</a>)의 정보를 바탕으로 AI가 작성하였습니다. 
              정확한 내용은 반드시 위 원문 링크를 통해 확인해 주시기 바랍니다.
            </p>
          </div>
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
