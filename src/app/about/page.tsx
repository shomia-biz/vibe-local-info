import Link from 'next/link';

export const metadata = {
  title: "소개 | 수도권 생활 정보",
  description: "수도권 생활 정보 사이트의 운영 목적과 데이터 출처를 소개합니다.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FFFBF7] py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">소개</h1>
        <div className="prose prose-orange lg:prose-xl bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-orange-50 max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">🏠 사이트 운영 목적</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>'수도권 모아팁스'</strong>는 서울, 경기, 인천 주민분들의 든든한 정보 길잡이가 되고자 합니다. 
              복잡하게 흩어져 있는 지원금과 행사 소식을 한곳에 모아, 누구나 이해하기 쉬운 편안한 설명으로 신속하게 전달하는 것이 저희의 목표입니다.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">📊 데이터 출처</h2>
            <p className="text-gray-700 leading-relaxed">
              안심하고 정보를 활용하실 수 있도록, 모든 바탕 자료는 <strong>공공데이터포털(data.go.kr)</strong>과 정부 API에서 가져옵니다. 
              철저하게 공식적이고 객관적인 데이터만을 사용하여 신뢰를 더했습니다.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">🤖 콘텐츠 생성 방식</h2>
            <p className="text-gray-700 leading-relaxed">
              시시각각 변하는 수많은 혜택을 누구보다 빠르게 전달하기 위해 <strong>인공지능(AI) 기술</strong>을 활용하고 있습니다. 
              수집된 어려운 정책 자료를 AI가 읽기 쉽게 다듬고 요약하여, 한 편의 블로그 글처럼 편안하게 읽으실 수 있도록 돕고 있습니다.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-orange-100 text-center">
            <Link 
              href="/" 
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-md"
            >
              다양한 소식 보러가기
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:font-bold text-blue-900">이용약관</Link>
            <Link href="/privacy" className="hover:font-bold text-blue-900">개인정보처리방침</Link>
            <Link href="/disclaimer" className="hover:font-bold text-blue-900">면책공고</Link>
            <Link href="/contact" className="hover:font-bold text-blue-900">광고문의</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
