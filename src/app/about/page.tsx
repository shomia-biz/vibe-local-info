import Link from 'next/link';

export const metadata = {
  title: "소개 | 송파구 생활 정보",
  description: "송파구 생활 정보 사이트의 운영 목적과 데이터 출처를 소개합니다.",
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
              <strong>송파구 생활 정보</strong>는 지역 주민분들이 일상에서 놓치기 쉬운 소중한 혜택들을 한눈에 확인하실 수 있도록 돕는 커뮤니티형 정보 서비스입니다. 
              복잡한 공고문 대신, 누구나 이해하기 쉬운 설명으로 우리 동네의 축제, 행사, 지원금 정보를 신속하게 전달하는 것을 목표로 합니다.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">📊 데이터 출처</h2>
            <p className="text-gray-700 leading-relaxed">
              본 사이트에 게시되는 모든 기초 정보는 <strong>공공데이터포털(data.go.kr)</strong>에서 제공하는 신뢰할 수 있는 공식 데이터를 바탕으로 합니다. 
              정부 및 지자체의 API를 통해 수집된 객관적인 정보를 바탕으로 신뢰도 높은 콘텐츠를 구축하고 있습니다.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">🤖 콘텐츠 생성 방식</h2>
            <p className="text-gray-700 leading-relaxed">
              저희는 방대한 공공데이터를 빠르게 분석하여 주민분들께 전달하기 위해 <strong>인공지능(AI) 기술</strong>을 활용합니다. 
              수집된 원문 정보를 바탕으로 AI가 핵심 내용을 요약하고 읽기 편한 블로그 형태로 재구성합니다. 
              이를 통해 더 많은 혜택 정보를 더 빠르게 제공해 드릴 수 있습니다.
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
        </div>
      </div>
    </main>
  );
}
