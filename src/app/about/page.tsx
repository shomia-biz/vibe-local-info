import Link from 'next/link';

export const metadata = {
  title: "소개 | 수도권 모아팁스",
  description: "수도권 모아팁스의 운영 목적과 데이터 출처를 소개합니다.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 헤더 영역 (메인 페이지와 톤앤매너 통일) */}
      <header className="bg-white border-b border-slate-200 pt-16 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 bg-cyan-50 text-cyan-600 rounded-full text-sm font-bold mb-6 border border-cyan-100">
            About Us
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight mb-6">
            수도권 모아팁스 <span className="text-cyan-500">소개</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto break-keep">
            서울, 경기, 인천 주민분들이 꼭 알아야 할 혜택을 빠르고 쉽게 전해드리는 라이프스타일 정보 큐레이션 서비스입니다.
          </p>
        </div>
      </header>

      {/* 본문 카드 영역 (헤더 위로 살짝 올라타는 세련된 레이아웃) */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        
        <div className="flex flex-col gap-6">
          {/* Section 1 */}
          <section className="bg-white rounded-[32px] p-8 sm:p-10 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                🏠
              </div>
              <h2 className="text-2xl font-black text-slate-800">사이트 운영 목적</h2>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              <strong className="text-slate-900 font-black">'수도권 모아팁스'</strong>는 서울, 경기, 인천 주민분들의 든든한 정보 길잡이가 되고자 합니다. 
              복잡하게 흩어져 있는 지원금과 행사 소식을 한곳에 모아, 누구나 이해하기 쉬운 편안한 설명으로 신속하게 전달하는 것이 저희의 목표입니다.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-[32px] p-8 sm:p-10 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl border border-blue-100">
                📊
              </div>
              <h2 className="text-2xl font-black text-slate-800">데이터 출처</h2>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              안심하고 정보를 활용하실 수 있도록, 모든 바탕 자료는 <strong className="text-slate-900 font-black">공공데이터포털(data.go.kr)</strong>과 정부 API에서 가져옵니다. 
              철저하게 공식적이고 객관적인 데이터만을 사용하여 신뢰를 더했습니다.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-[32px] p-8 sm:p-10 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl border border-orange-100">
                🤖
              </div>
              <h2 className="text-2xl font-black text-slate-800">콘텐츠 생성 방식</h2>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              시시각각 변하는 수많은 혜택을 누구보다 빠르게 전달하기 위해 <strong className="text-slate-900 font-black">인공지능(AI) 기술</strong>을 활용하고 있습니다. 
              수집된 어려운 정책 자료를 AI가 읽기 쉽게 다듬고 요약하여, 한 편의 블로그 글처럼 편안하게 읽으실 수 있도록 돕고 있습니다.
            </p>
          </section>
        </div>

        {/* CTA 버튼 */}
        <div className="mt-16 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-10 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full font-black text-lg shadow-lg hover:shadow-cyan-200 transition-all hover:-translate-y-1"
          >
            홈페이지로 돌아가기 <span className="ml-2">→</span>
          </Link>
        </div>

        {/* 하단 링크 */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-slate-400 font-medium">
          <Link href="/terms" className="hover:text-slate-700 transition-colors">이용약관</Link>
          <Link href="/privacy" className="hover:text-slate-700 transition-colors">개인정보처리방침</Link>
          <Link href="/disclaimer" className="hover:text-slate-700 transition-colors">면책공고</Link>
          <Link href="/contact" className="hover:text-slate-700 transition-colors">광고문의</Link>
        </div>

      </div>
    </main>
  );
}
