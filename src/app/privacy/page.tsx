import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "개인정보처리방침 | 모아팁스",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FFFBF7] py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-800 font-medium mb-4">
            <span className="mr-1">←</span> 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">개인정보처리방침</h1>
          <p className="text-gray-500">최종 업데이트: 2026년 5월 24일</p>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-gray-100 text-gray-700 leading-relaxed">
          <p className="mb-4 text-gray-900  border-b border-gray-100 pb-4">
            수도권 모아픽스(이하 "모아픽스" 또는 "사이트")은 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 및 관련 법령에 따라 아래와 같이 개인정보처리방침을 수립·공개합니다.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mb-2">1. 수집하는 개인정보 항목</h2>
          <p className="mb-4">모아팁스은 별도의 회원가입을 요구하지 않으며, 이용자의 이름·주소·전화번호 등 개인식별정보를 직접 수집하지 않습니다.</p>
          <p className="mb-2">다만, 서비스 품질 개선을 위해 아래 도구를 통해 <strong>비식별 통계 데이터</strong>를 자동 수집할 수 있습니다.</p>
          <ul className="list-disc pl-5 mb-6 space-y-1">
            <li>페이지 방문 횟수</li>
            <li>체류 시간 및 클릭 패턴</li>
            <li>접속 기기 및 브라우저 유형</li>
            <li>유입 경로 (검색어, 참조 URL 등)</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mb-2">2. 쿠키(Cookie) 사용</h2>
          <p className="mb-4">모아팁스 및 제3자 광고·통계 서비스는 쿠키를 사용합니다.</p>
          <p className="mb-4"><strong>쿠키란?</strong> 웹사이트가 이용자의 브라우저에 저장하는 소규모 텍스트 파일로, 이용자를 식별하거나 방문 기록을 저장하는 데 사용됩니다.</p>
          <p className="mb-6">이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다. 단, 쿠키를 거부할 경우 일부 서비스 이용이 제한될 수 있습니다.</p>

          <h2 className="text-xl font-bold text-gray-900 mb-2">3. Google AdSense 및 광고 서비스</h2>
          <p className="mb-4">모아팁스은 <strong>Google AdSense</strong>를 통해 광고를 게재합니다. Google을 포함한 제3자 광고 업체는 쿠키를 사용하여 이용자의 관심사에 기반한 맞춤형 광고를 제공합니다.</p>
          <ul className="list-disc pl-5 mb-6 space-y-1">
            <li>Google의 광고 쿠키 사용으로 인해 이용자의 이전 방문 정보가 활용될 수 있습니다.</li>
            <li>이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google 광고 설정</a>에서 맞춤형 광고를 비활성화할 수 있습니다.</li>
            <li>Google 개인정보처리방침: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://policies.google.com/privacy</a></li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mb-2">4. Google Analytics</h2>
          <p className="mb-4">모아팁스은 <strong>Google Analytics</strong>를 사용하여 사이트 방문 통계를 분석합니다. 수집된 데이터는 익명으로 처리되며 개인 식별에 사용되지 않습니다.</p>
          <p className="mb-6">Google Analytics 데이터 수집 거부: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://tools.google.com/dlpage/gaoptout</a></p>

          <h2 className="text-xl font-bold text-gray-900 mb-2">5. 쿠팡 파트너스 및 기타 제휴 서비스</h2>
          <p className="mb-6">모아팁스은 <strong>쿠팡 파트너스</strong> 등 제휴 마케팅 프로그램에 참여할 수 있습니다. 이를 통해 적격 구매 발생 시 수수료를 받을 수 있으며, 이용자에게 추가 비용은 발생하지 않습니다.</p>

          <h2 className="text-xl font-bold text-gray-900 mb-2">6. 개인정보의 보유 및 이용 기간</h2>
          <p className="mb-6">모아팁스은 이용자의 개인정보를 수집 목적 달성 후 즉시 파기합니다. 단, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>

          <h2 className="text-xl font-bold text-gray-900 mb-2">7. 개인정보처리방침 변경</h2>
          <p className="mb-6">본 방침은 법령·서비스 변경에 따라 업데이트될 수 있습니다. 변경 시 사이트 내 공지 또는 본 페이지를 통해 안내합니다.</p>

          <h2 className="text-xl font-bold text-gray-900 mb-2">8. 문의</h2>
          <p className="mb-8">개인정보와 관련한 문의사항은 아래로 연락해 주시기 바랍니다.</p>

          <div className="border-t border-gray-100 pt-6 mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2">문의 및 연락처</h3>
            <p className="mb-2">📧 이메일:<a href="mailto:omnia.ahn.biz@gmail.com" className="text-gray-700 hover:text-orange-600 transition-colors">omnia.ahn.biz@gmail.com</a></p>
            <p>🌐 운영자: 수도권 모아팁스 (<a href="https://moa-tips.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-orange-600 transition-colors">moa-tips.com</a>)</p>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:font-bold text-blue-900">이용약관</Link>
            <Link href="/privacy" className="font-bold text-blue-900">개인정보처리방침</Link>
            <Link href="/disclaimer" className="hover:font-bold text-blue-900">면책공고</Link>
            <Link href="/contact" className="hover:font-bold text-blue-900">광고문의</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
