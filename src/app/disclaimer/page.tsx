import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "면책공고 | 모아팁스",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#FFFBF7] py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-800 font-medium mb-4">
            <span className="mr-1">←</span> 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">면책공고</h1>
          <p className="text-gray-500">최종 업데이트: 2026년 5월 24일</p>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-gray-100 text-gray-700 leading-relaxed">
          <p className="mb-8 font-bold text-gray-900 text-lg border-b border-gray-100 pb-4">
            모아팁스에서 제공하는 모든 정보는 정부 부처와 지자체의 공공데이터를 바탕으로 알기 쉽게 요약하여 제공하는 '참고용' 자료입니다.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mb-2">1. 정보의 정확성</h2>
          <p className="mb-6">저희는 최대한 정확하고 발 빠른 최신 정보를 제공하기 위해 최선을 다하고 있습니다. 하지만 수많은 정보를 다루다 보니 간혹 오류가 있거나 시일이 지나 내용이 변경될 수 있습니다. 이에 대해 모아팁스는 법적인 책임을 지지 않음을 알려드립니다.</p>

          <h2 className="text-xl font-bold text-gray-900 mb-2">2. 이용자의 판단과 책임</h2>
          <p className="mb-6">저희 사이트에서 제공된 정보를 바탕으로 지원금 신청, 행사 참여 등의 결정을 내리시는 것은 전적으로 이용자 본인의 판단에 따릅니다. 따라서 이로 인해 혹시라도 발생할 수 있는 직·간접적인 문제나 손해에 대해 책임지지 않습니다.</p>

          <h2 className="text-xl font-bold text-gray-900 mb-2">3. 공식 기관 확인의 중요성</h2>
          <p className="mb-6">지원금 신청이나 정책 참여 등 <strong>중요한 결정이나 신청을 하시기 전에는, 반드시 안내된 '관련 공식 기관' 홈페이지나 전화 문의를 통해 정확한 내용을 한 번 더 확인</strong>해 주시기를 강력히 권장합니다.</p>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <Link href="/terms" className="hover:font-bold text-blue-900">이용약관</Link>
          <Link href="/privacy" className="hover:font-bold text-blue-900">개인정보처리방침</Link>
          <Link href="/disclaimer" className="font-bold text-blue-900">면책공고</Link>
          <Link href="/contact" className="hover:font-bold text-blue-900">광고문의</Link>
        </div>
      </div>
    </main>
  );
}
