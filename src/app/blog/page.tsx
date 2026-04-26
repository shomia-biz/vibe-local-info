import blogData from "../../../public/data/blog-posts.json";
import Link from "next/link";

export default function BlogList() {
  return (
    <main className="min-h-screen bg-[#FFFBF7] font-sans pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-16">
        
        {/* 헤더 영역 */}
        <header className="text-center border-b-2 border-orange-100/50 pb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">✍️</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-orange-600 tracking-tight drop-shadow-sm">
              AI 동네 블로그
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-orange-800/80 font-medium">
            AI가 매일매일 찾아오는 알짜배기 동네 소식을 읽어보세요!
          </p>
        </header>

        {/* 블로그 카드 목록 */}
        <section className="grid gap-8">
          {blogData.posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.id}`}
              className="bg-white rounded-3xl shadow-sm border border-orange-50 p-6 sm:p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block group"
            >
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                {/* 왼쪽 썸네일 영역 (이모지로 대체) */}
                <div className="sm:w-1/4 flex flex-col justify-center items-center bg-orange-50/50 rounded-2xl p-8 border border-orange-100/30 group-hover:bg-orange-100/50 transition-colors">
                  <span className="text-6xl mb-3">{post.emoji}</span>
                  <span className="text-sm font-bold text-orange-700 bg-white px-3 py-1 rounded-full shadow-sm">
                    {post.date}
                  </span>
                </div>
                
                {/* 오른쪽 텍스트 영역 */}
                <div className="sm:w-3/4 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors break-keep">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6 break-keep">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto">
                    <span className="inline-flex items-center gap-2 text-orange-600 font-bold bg-orange-50 px-4 py-2 rounded-xl group-hover:bg-orange-100 transition-colors">
                      자세히 읽기 <span>&rarr;</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </section>

      </div>
    </main>
  );
}
