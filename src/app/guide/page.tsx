import Link from 'next/link';
import { getSortedGuidesData } from '@/lib/guide';

export default function GuideListPage() {
  const allGuides = getSortedGuidesData();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          <span className="text-cyan-500">유용한 정보</span> Hub
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          생활에 힘이 되는 알짜 꿀팁과 가이드를 한곳에 모았습니다.
        </p>
      </div>

      {allGuides.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-lg">아직 등록된 정보가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allGuides.map((guide) => (
            <Link 
              key={guide.slug} 
              href={`/guide/${guide.slug}`}
              className="group flex flex-col bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-slate-100"
            >
              {/* 이미지 및 오버레이 텍스트 영역 */}
              <div className="aspect-[4/3] bg-slate-900 overflow-hidden relative">
                <img 
                  src={guide.thumbnail || 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=800&q=80'} 
                  alt={guide.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                
                {/* 하단 어두운 그라디언트 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                {/* 텍스트 오버레이 컨텐츠 */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end items-center text-center">
                  <div className="bg-black/50 text-yellow-400 text-xs font-bold px-3 py-1 rounded-md mb-3 border border-yellow-400/30">
                    {guide.category}
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-black text-white mb-4 leading-tight drop-shadow-lg break-keep">
                    {/* 첫 띄어쓰기를 기준으로 색상 분리 효과 (선택적) */}
                    <span className="text-yellow-400">{guide.title.split(' ')[0]}</span>{' '}
                    {guide.title.split(' ').slice(1).join(' ')}
                  </h2>

                  <div className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg transition-colors inline-flex items-center gap-1">
                    자세히보기 <span className="text-lg leading-none">›</span>
                  </div>
                </div>
              </div>

              {/* 하단 카드 메타 정보 */}
              <div className="p-5 flex items-center justify-between bg-white">
                <div className="text-sm font-bold text-slate-400">{guide.date}</div>
                <div className="text-sm text-slate-500 line-clamp-1 flex-1 ml-4 text-right">
                  {guide.summary}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
