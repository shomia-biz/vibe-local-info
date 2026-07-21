import { getGuideData, getSortedGuidesData } from '@/lib/guide';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';

export async function generateStaticParams() {
  const guides = getSortedGuidesData();
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const guideData = getGuideData(resolvedParams.slug);

  if (!guideData) {
    notFound();
  }

  // 추천 포스트 4개 (현재 글 제외)
  const allGuides = getSortedGuidesData();
  const recommendedGuides = allGuides.filter(g => g.slug !== guideData.slug).slice(0, 4);

  // 목차(TOC) 추출 (## h2 태그 기반)
  const headings = Array.from(guideData.content.matchAll(/^##\s+(.+)$/gm)).map(match => match[1]);

  return (
    <article className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 1. 상단 인트로 / 헤더 영역 */}
      <header className="bg-white border-b border-slate-200 pt-12 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-3 py-1 bg-cyan-50 text-cyan-600 rounded-full text-sm font-bold mb-6">
            {guideData.category}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6 break-keep">
            {guideData.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500 font-medium">
            <span>모아팁스 에디터</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>{guideData.date}</span>
          </div>
        </div>
      </header>

      {/* 2. 본문 컨텐츠 영역 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-[32px] p-6 sm:p-12 shadow-sm border border-slate-100">
          
          {/* 요약 박스 */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-600 font-black">💡 핵심 요약</span>
            </div>
            <p className="text-slate-700 font-medium leading-relaxed">
              {guideData.summary}
            </p>
          </div>


          {/* 마크다운 렌더링 영역 */}
          <div className="prose prose-lg prose-slate max-w-none 
            prose-headings:font-black prose-headings:text-slate-900 
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100
            prose-p:text-slate-700 prose-p:leading-loose prose-p:mb-6
            prose-a:text-cyan-600 prose-a:font-bold prose-a:no-underline hover:prose-a:text-cyan-700 hover:prose-a:underline
            prose-strong:text-slate-900 prose-strong:font-black
            prose-ul:my-6 prose-li:my-2
            prose-table:w-full prose-table:border-collapse prose-table:my-8
            prose-th:bg-slate-50 prose-th:p-4 prose-th:text-left prose-th:text-sm prose-th:font-bold prose-th:text-slate-700 prose-th:border prose-th:border-slate-200
            prose-td:p-4 prose-td:text-sm prose-td:text-slate-600 prose-td:border prose-td:border-slate-200
            prose-img:rounded-2xl prose-img:shadow-sm prose-img:w-full
            [&>details]:bg-slate-50 [&>details]:border [&>details]:border-slate-200 [&>details]:rounded-2xl [&>details]:mb-4 [&>details]:overflow-hidden
            [&>details>summary]:bg-white [&>details>summary]:font-bold [&>details>summary]:text-slate-900 [&>details>summary]:p-4 [&>details>summary]:cursor-pointer [&>details>summary]:list-none
            [&>details[open]>summary]:border-b [&>details[open]>summary]:border-slate-200 [&>details>summary::-webkit-details-marker]:hidden
            [&>details>.faq-content]:p-4 [&>details>.faq-content]:text-slate-700 [&>details>.faq-content]:text-[15px] [&>details>.faq-content]:leading-relaxed
          ">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {guideData.content}
            </ReactMarkdown>
          </div>

          {/* 해시태그 영역 */}
          {guideData.tags && guideData.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {guideData.tags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[13px] font-bold rounded-full shadow-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA 버튼 */}
          {guideData.cta_link && (
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
              <a 
                href={guideData.cta_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full font-black text-lg shadow-lg hover:shadow-cyan-200 transition-all hover:-translate-y-1"
              >
                홈페이지로 돌아가기 <span className="ml-2">→</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 3. 추천 포스팅 (하단 4열 카드뷰) */}
      {recommendedGuides.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-200 mt-8">
          <h3 className="text-2xl font-black text-slate-900 mb-8">추천 포스팅</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedGuides.map((guide) => (
              <Link 
                key={guide.slug} 
                href={`/guide/${guide.slug}`}
                className="group flex flex-col bg-slate-900 rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 relative aspect-[4/3] border border-slate-100"
              >
                <img 
                  src={guide.thumbnail || 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=800&q=80'} 
                  alt={guide.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                />
                
                {/* 하단 어두운 그라디언트 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <div className="text-yellow-400 text-[10px] font-bold mb-1">
                    {guide.category}
                  </div>
                  <h4 className="text-[15px] sm:text-base font-black text-white leading-snug drop-shadow-md line-clamp-2 mb-2 group-hover:text-yellow-200 transition-colors">
                    {guide.title}
                  </h4>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-xs text-slate-300 font-medium">{guide.date}</span>
                    <span className="bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                      자세히보기 &gt;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
