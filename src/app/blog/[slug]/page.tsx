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
import BackButton from '@/components/BackButton';

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
    title: `${post.title} |서울 경기 인천 생활 정보`,
    description: post.summary,
    alternates: {
      canonical: `/blog/${slug}/`,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      url: `https://moa-tips.com/blog/${slug}/`,
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
              "author": { "@type": "Organization", "name": "서울 경기 인천 생활 정보" },
              "publisher": { "@type": "Organization", "name": "서울 경기 인천 생활 정보" }
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://moa-tips.com/" },
                { "@type": "ListItem", "position": 2, "name": "블로그", "item": "https://moa-tips.com/blog/" },
                { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://moa-tips.com/blog/${slug}/` }
              ]
            }
          ])
        }}
      />
      <article className="max-w-3xl mx-auto px-4">
        <BackButton />
        {/* 블로그 본문 */}
        <div className="max-w-none bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-orange-50 text-slate-900 font-sans">
          <header className="mb-8 pb-8 border-b border-slate-100 text-left">
            <div className="inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full font-bold mb-4">
              {post.category}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              {post.title}
            </h1>
            <div className="flex justify-start items-center gap-4 text-gray-500 font-medium">
              <span>{post.date}</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm">최종 업데이트: {post.date}</span>
            </div>
          </header>

          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({node, ...props}) => <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed mb-6 break-keep" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-4 break-keep" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-6 mb-3 break-keep" {...props} />,
              table: ({node, ...props}) => <div className="overflow-x-auto my-6"><table className="w-full border-collapse border border-slate-100" {...props} /></div>,
              th: ({node, ...props}) => <th className="py-2.5 px-4 bg-slate-50/50 text-left text-slate-500 font-bold text-sm sm:text-base border border-slate-100" {...props} />,
              td: ({node, ...props}) => <td className="py-2.5 px-4 text-slate-900 font-extrabold text-base sm:text-lg border border-slate-100 break-keep" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 font-medium text-slate-700 text-base sm:text-lg" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 font-medium text-slate-700 text-base sm:text-lg" {...props} />,
              li: ({node, ...props}) => <li className="break-keep" {...props} />,
              a: ({node, ...props}) => <a className="text-orange-600 hover:underline font-bold" {...props} />
            }}
          >
            {post.content.replace(/\*\*\r?\n/g, '**  \n')}
          </ReactMarkdown>
        </div>

        {/* 카카오톡 채널 추가 유도 배너 (게시글 하단) */}
        <div className="mt-8 bg-[#FEE500]/10 border border-[#FEE500]/30 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
            이 지원금, 신청 기간 놓치면 아쉽잖아요! 🥲
          </h3>
          <p className="text-slate-600 font-medium mb-6 text-sm sm:text-base break-keep">
            카카오톡 친구 추가해 두시면 마감 임박 공고와 새로운 지원금 소식을 매주 카톡으로 편하게 받아보실 수 있습니다.
          </p>
          <a 
            href="http://pf.kakao.com/_CrWxjX?from=qr" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#F4DC00] text-[#381E1F] font-extrabold px-6 py-3 rounded-full shadow-sm transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.3 4.5 6.6-.2.6-1 3.5-1.1 3.9-.1.4.1.4.3.2.3-.2 4-2.7 4.7-3.1 1.1.2 2.2.3 3.3.3 5.5 0 10-3.5 10-7.8S17.5 3 12 3z"/>
            </svg>
            무료로 카톡 알림 받기
          </a>
        </div>

        {/* 광고 영역 */}
        <AdBanner />
        <CoupangBanner />

        {/* 하단 네비게이션 (대안 B) */}
        <div className="mt-8 pt-6 border-t border-orange-100 flex justify-center">
          <Link 
            href="/blog" 
            className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-2 transition-colors"
          >
            <span>←</span> 목록으로 돌아가기
          </Link>
        </div>

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
              <br />정확한 내용은 반드시 위 원문 링크를 통해 확인해 주시기 바랍니다.
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

      </article>
    </main>
  );
}
