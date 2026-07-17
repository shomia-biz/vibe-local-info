import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "면책공고 | 모아팁스",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 공통 헤더 */}
      <header className="bg-white border-b border-slate-200 pt-16 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center justify-center px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-sm font-bold mb-6 border border-slate-200 transition-colors">
            <span className="mr-1">←</span> 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            면책공고
          </h1>
          <p className="text-slate-500 font-medium">최종 업데이트: 2026년 5월 24일</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        
        {/* 본문 카드 */}
        <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-sm border border-slate-100 text-slate-600 leading-relaxed">
          <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
            <p className="font-bold text-slate-900 text-lg">
              모아팁스에서 제공하는 모든 정보는 정부 및 지자체의 공공데이터를 알기 쉽게 재구성한 '참고용' 자료입니다.
            </p>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">1. 정보의 정확성 한계</h2>
          <p className="mb-6">최신 정보를 신속하게 제공하기 위해 노력하고 있으나, 원본 데이터의 갑작스러운 변경이나 작성 과정에서의 오류로 인해 실제 사실과 차이가 있을 수 있습니다. 모아팁스는 이에 대한 법적 책임을 지지 않습니다.</p>

          <h2 className="text-xl font-bold text-slate-900 mb-2">2. 이용자의 판단과 책임</h2>
          <p className="mb-6">사이트에서 제공된 정보를 바탕으로 지원금을 신청하거나 행사에 참여하는 등의 결정은 전적으로 이용자 본인의 책임하에 이루어집니다. 이로 인해 발생한 직·간접적인 손해에 대해 당사는 책임지지 않습니다.</p>

          <h2 className="text-xl font-bold text-slate-900 mb-2">3. 공식 기관 재확인 필수</h2>
          <p className="mb-6">지원금 신청 등 이용자의 권리와 의무에 중대한 영향을 미치는 사안에 대해서는, 반드시 안내해 드린 <strong className="text-slate-900">'관련 공식 기관'의 홈페이지나 공고문을 통해 최종적으로 내용을 재확인</strong>하시기 바랍니다.</p>
        </div>

        {/* 하단 링크 */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-slate-400 font-medium">
          <Link href="/terms" className="hover:text-slate-700 transition-colors">이용약관</Link>
          <Link href="/privacy" className="hover:text-slate-700 transition-colors">개인정보처리방침</Link>
          <Link href="/disclaimer" className="text-slate-700 font-bold transition-colors">면책공고</Link>
          <Link href="/contact" className="hover:text-slate-700 transition-colors">광고문의</Link>
        </div>

      </div>
    </main>
  );
}
