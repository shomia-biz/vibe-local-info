import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "광고문의 | 모아팁스",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FFFBF7] py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-800 font-medium mb-4">
            <span className="mr-1">←</span> 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">광고 및 제휴 문의</h1>
          <p className="text-gray-500">최종 업데이트: 2026년 5월 24일</p>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-gray-100 text-gray-700 leading-relaxed text-center">
          
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            🤝
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">모아팁스와 함께 성장할 파트너를 찾습니다!</h2>
          
          <p className="mb-8 text-gray-600">
            저희 사이트에 배너 광고를 싣고 싶으시거나, <br className="hidden sm:block"/>
            콘텐츠를 함께 만들어갈 제휴 등 다양한 제안을 환영합니다. <br/>
            아래 이메일로 편하게 연락 주시면, 꼼꼼히 검토 후 친절하게 안내해 드리겠습니다.
          </p>

          <div className="inline-block bg-gray-50 px-8 py-5 rounded-2xl border border-gray-200 shadow-sm mb-8">
            <span className="block text-sm text-gray-500 font-bold mb-1">문의 이메일 주소</span>
            <p className="text-xl hover:text-blue-900 transition-colors font-extrabold text-gray-900">omia.ahn.biz@gmail.com</p>
          </div>

          <div className="text-left bg-gray-50 p-6 rounded-xl text-sm text-gray-500">
            <p className="font-bold text-gray-700 mb-2">💡 문의 주실 때 이런 내용을 적어주시면 더 빨라요!</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>담당자님의 성함과 연락처</li>
              <li>광고나 제휴를 원하시는 서비스에 대한 간단한 소개</li>
              <li>원하시는 광고 형태나 제안 내용</li>
            </ul>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:font-bold text-blue-900">이용약관</Link>
            <Link href="/privacy" className="hover:font-bold text-blue-900">개인정보처리방침</Link>
            <Link href="/disclaimer" className="hover:font-bold text-blue-900">면책공고</Link>
            <Link href="/contact" className="font-bold text-blue-900">광고문의</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
