import { getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';

export default function BlogPage() {
  const posts = getSortedPostsData();

  return (
    <main className="min-h-screen bg-[#FFFBF7] py-16">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">블로그 ✍️</h1>
          <p className="text-gray-600">우리 동네의 새로운 소식과 정보를 확인하세요.</p>
        </header>

        <div className="grid gap-8">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-orange-200">
              <p className="text-gray-500">아직 작성된 블로그 글이 없습니다. ✏️</p>
            </div>
          ) : (
            posts.map((post) => (
              <article 
                key={post.slug} 
                className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 hover:shadow-md transition-all group"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-semibold">
                        {post.category}
                      </span>
                      <span className="text-gray-400">{post.date}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
