import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "개인정보처리방침 | 모아팁스",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 공통 헤더 */}
      <header className="bg-white border-b border-slate-200 pt-16 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center justify-center px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-sm font-bold mb-6 border border-slate-200 transition-colors">
            <span className="mr-1">←</span> 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            개인정보처리방침
          </h1>
          <p className="text-slate-500 font-medium">최종 업데이트: 2026년 5월 24일</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        
        {/* 본문 카드 */}
        <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-sm border border-slate-100 text-slate-600 leading-relaxed">
          <p className="mb-4 text-slate-900 border-b border-slate-100 pb-4 font-medium">
            수도권 모아팁스(이하 "모아팁스" 또는 "사이트")은 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 및 관련 법령에 따라 아래와 같이 개인정보처리방침을 수립·공개합니다.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mb-2 mt-6">1. 수집하는 개인정보 항목</h2>
          <p className="mb-2">모아팁스는 별도의 회원가입을 요구하지 않으며, 이용자의 이름, 주소, 전화번호 등 개인을 식별할 수 있는 민감한 정보를 절대 수집하지 않습니다.</p>
          <p className="mb-6">다만, 서비스 품질 개선을 위해 페이지 방문 횟수, 체류 시간, 접속 기기 유형 등의 <strong className="text-slate-900">비식별 통계 데이터</strong>만을 자동 수집합니다.</p>

          <h2 className="text-xl font-bold text-slate-900 mb-2">2. 쿠키(Cookie) 사용</h2>
          <p className="mb-6">모아팁스와 제3자 광고/통계 서비스는 '쿠키'를 사용합니다. 쿠키란 웹사이트가 브라우저에 저장하는 작은 텍스트 파일로, 방문 기록을 기억하여 더 나은 환경을 제공합니다. 원치 않으실 경우 브라우저 설정에서 쿠키 저장을 거부할 수 있습니다.</p>

          <h2 className="text-xl font-bold text-slate-900 mb-2">3. Google AdSense 및 맞춤형 광고</h2>
          <p className="mb-4">모아팁스는 <strong className="text-slate-900">Google AdSense</strong>를 통해 맞춤형 광고를 제공합니다. Google을 포함한 제3자 업체는 쿠키를 활용해 사용자의 관심사에 맞는 광고를 게재합니다.</p>
          <ul className="list-disc pl-5 mb-6 space-y-1">
            <li><a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 hover:underline">Google 맞춤형 광고 비활성화 설정하기</a></li>
            <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 hover:underline">Google 개인정보처리방침 확인하기</a></li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mb-2">4. Google Analytics</h2>
          <p className="mb-4">사이트 방문 통계를 분석하기 위해 <strong className="text-slate-900">Google Analytics</strong>를 사용합니다. 수집된 모든 데이터는 철저히 익명으로 처리되며 특정 개인을 식별하는 데 사용되지 않습니다.</p>
          <ul className="list-disc pl-5 mb-6 space-y-1">
            <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 hover:underline">Google Analytics 데이터 수집 거부(Opt-out) 설정하기</a></li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mb-2">5. 쿠팡 파트너스 및 제휴 서비스</h2>
          <p className="mb-6">모아팁스는 <strong className="text-slate-900">쿠팡 파트너스</strong> 등 제휴 마케팅 프로그램에 참여하고 있습니다. 해당 제휴 링크를 통해 유효한 구매가 이루어질 경우 당사가 소정의 수수료를 제공받을 수 있으나, 이로 인해 사용자에게는 어떠한 추가 비용도 발생하지 않습니다.</p>

          <h2 className="text-xl font-bold text-slate-900 mb-2">6. 정보의 보유 기간 및 파기</h2>
          <p className="mb-6">수집 목적이 달성된 비식별 데이터는 즉시 파기하는 것을 원칙으로 합니다. (단, 관련 법령에 의해 보존이 필요한 경우는 해당 기간 동안 안전하게 보관합니다.)</p>

          <h2 className="text-xl font-bold text-slate-900 mb-2">7. 개인정보처리방침의 변경</h2>
          <p className="mb-8">본 방침은 법령이나 서비스 운영 정책에 따라 변경될 수 있으며, 내용 업데이트 시 사이트 내 공지를 통해 미리 안내해 드립니다.</p>

          <div className="border-t border-slate-100 pt-6 mt-8">
            <h3 className="text-lg font-bold text-slate-900 mb-2">문의 및 연락처</h3>
            <p className="mb-2">📧 이메일:<a href="mailto:omnia.ahn.biz@gmail.com" className="text-cyan-600 hover:text-cyan-700 transition-colors ml-1 font-medium">omnia.ahn.biz@gmail.com</a></p>
            <p>🌐 운영자: 수도권 모아팁스 (<a href="https://moa-tips.com" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 transition-colors font-medium">moa-tips.com</a>)</p>
          </div>
        </div>

        {/* 하단 링크 */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-slate-400 font-medium">
          <Link href="/terms" className="hover:text-slate-700 transition-colors">이용약관</Link>
          <Link href="/privacy" className="text-slate-700 font-bold transition-colors">개인정보처리방침</Link>
          <Link href="/disclaimer" className="hover:text-slate-700 transition-colors">면책공고</Link>
          <Link href="/contact" className="hover:text-slate-700 transition-colors">광고문의</Link>
        </div>

      </div>
    </main>
  );
}
