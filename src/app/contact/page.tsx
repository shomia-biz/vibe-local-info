import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "광고문의 | 모아팁스",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 공통 헤더 */}
      <header className="bg-white border-b border-slate-200 pt-16 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center justify-center px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-sm font-bold mb-6 border border-slate-200 transition-colors">
            <span className="mr-1">←</span> 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            광고 및 제휴 문의
          </h1>
          <p className="text-slate-500 font-medium">최종 업데이트: 2026년 5월 24일</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        
        {/* 본문 카드 */}
        <div className="bg-white rounded-[32px] p-8 sm:p-12 shadow-sm border border-slate-100 text-slate-700 leading-relaxed text-center">
          
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner border border-slate-100">
            🤝
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-4">모아팁스와 함께 성장할 파트너를 찾습니다!</h2>
          
          <p className="mb-8 text-slate-600 font-medium">
            저희 사이트에 배너 광고를 게재하시거나, <br className="hidden sm:block"/>
            유익한 콘텐츠를 함께 기획할 다채로운 제휴 제안을 언제나 환영합니다. <br/>
            아래 이메일로 편하게 연락 주시면, 꼼꼼히 검토 후 신속하고 친절하게 회신해 드리겠습니다.
          </p>

          <div className="inline-block bg-[#F8FAFC] px-10 py-6 rounded-[24px] border border-slate-100 shadow-sm mb-10 transition-transform hover:-translate-y-1">
            <span className="block text-sm text-slate-500 font-bold mb-2">문의 이메일 주소</span>
            <p className="text-2xl hover:text-cyan-600 transition-colors font-black text-slate-900">omia.ahn.biz@gmail.com</p>
          </div>

          <div className="text-left bg-cyan-50 p-6 sm:p-8 rounded-[24px] text-sm text-slate-600 border border-cyan-100">
            <p className="font-bold text-slate-800 mb-3 text-base">💡 메일에 이런 내용을 포함해 주시면 더 빠른 안내가 가능해요!</p>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>담당자 성함 및 연락처</li>
              <li>광고/제휴를 원하시는 서비스에 대한 간단한 소개</li>
              <li>원하시는 광고 형태 및 구체적인 제안 내용</li>
            </ul>
          </div>
        </div>

        {/* 하단 링크 */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-slate-400 font-medium">
          <Link href="/terms" className="hover:text-slate-700 transition-colors">이용약관</Link>
          <Link href="/privacy" className="hover:text-slate-700 transition-colors">개인정보처리방침</Link>
          <Link href="/disclaimer" className="hover:text-slate-700 transition-colors">면책공고</Link>
          <Link href="/contact" className="text-slate-700 font-bold transition-colors">광고문의</Link>
        </div>

      </div>
    </main>
  );
}
