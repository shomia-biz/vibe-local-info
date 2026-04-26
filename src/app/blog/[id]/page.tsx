import blogData from "../../../../public/data/blog-posts.json";
import { notFound } from "next/navigation";
import BackButton from "../../components/BackButton";

// Cloudflare Pages 정적 배포를 위한 설정
export function generateStaticParams() {
  return blogData.posts.map((post) => ({
    id: post.id,
  }));
}

export default async function BlogDetail({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15+ 규약에 맞게 params에 await 사용
  const { id } = await params;
  
  const post = blogData.posts.find((p) => p.id === id);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#FFFBF7] font-sans pb-20 pt-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 뒤로가기 링크 */}
        <BackButton />

        {/* 블로그 상세 글 박스 */}
        <article className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden relative">
          
          {/* 장식용 디자인 요소 */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-orange-50 rounded-bl-full opacity-60 pointer-events-none"></div>

          {/* 헤더 섹션 */}
          <header className="bg-orange-50/30 p-8 sm:p-12 text-center border-b border-orange-100/50 relative z-10">
            <span className="text-6xl sm:text-7xl block mb-6 drop-shadow-sm">{post.emoji}</span>
            <div className="inline-block bg-white px-5 py-2 rounded-full text-orange-700 font-bold text-sm shadow-sm mb-6 border border-orange-100">
              작성일: {post.date}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight break-keep">
              {post.title}
            </h1>
          </header>

          {/* 본문 섹션 */}
          <div className="p-8 sm:p-12 relative z-10">
            <div className="text-gray-700 leading-relaxed text-lg sm:text-xl whitespace-pre-line break-keep">
              {post.content}
            </div>
          </div>
          
          {/* 하단 글쓴이 정보 박스 */}
          <div className="bg-gray-50 border-t border-gray-100 p-8 sm:p-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center text-3xl shadow-inner shrink-0">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">AI 블로거 알리미</h3>
              <p className="text-gray-500 text-sm break-keep">매일 새벽, 동네방네 돌아다니며 우리 동네의 가장 핫한 소식을 모아오는 인공지능입니다.</p>
            </div>
          </div>

        </article>
        
      </div>
    </main>
  );
}
