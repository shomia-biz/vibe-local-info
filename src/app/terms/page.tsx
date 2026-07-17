import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "이용약관 | 모아팁스",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 공통 헤더 */}
      <header className="bg-white border-b border-slate-200 pt-16 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center justify-center px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-sm font-bold mb-6 border border-slate-200 transition-colors">
            <span className="mr-1">←</span> 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            이용약관
          </h1>
          <p className="text-slate-500 font-medium">최종 업데이트: 2026년 5월 24일</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        
        {/* 본문 카드 */}
        <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-sm border border-slate-100 text-slate-600 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900 mb-2">제1조 (목적)</h2>
          <p className="mb-6">본 약관은 '수도권 모아팁스'(이하 "모아팁스")가 제공하는 정보 서비스의 이용과 관련하여, 모아팁스와 이용자 간의 권리, 의무 및 책임 사항 등 기본적인 규칙을 정하는 것을 목적으로 합니다.</p>

          <h2 className="text-xl font-bold text-slate-900 mb-2">제2조 (용어의 정의)</h2>
          <ul className="list-disc pl-5 mb-6 space-y-1">
            <li><strong className="text-slate-900">"서비스"</strong>란 모아팁스가 공공데이터를 가공하여 웹사이트를 통해 제공하는 축제, 혜택, 생활 정보 콘텐츠 일체를 의미합니다.</li>
            <li><strong className="text-slate-900">"이용자"</strong>란 모아팁스 웹사이트에 접속하여 본 약관에 따라 서비스를 이용하는 모든 분을 말합니다.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mb-2">제3조 (서비스 내용 및 정보의 한계)</h2>
          <p className="mb-2">① 모아팁스는 공공데이터포털 및 지자체 공식 자료를 바탕으로 수도권 지역의 각종 문화행사 및 지원금 정보를 큐레이션하여 제공합니다.</p>
          <p className="mb-2">② 제공되는 정보는 정확성을 위해 최선을 다하고 있으나, 원본 데이터의 변경이나 API 연동 지연 등으로 인해 실제 사실과 일시적인 차이가 발생할 수 있습니다.</p>
          <p className="mb-6">③ 따라서 이용자는 지원금 신청 등 중대한 사안에 대해서 반드시 해당 기관의 공식 공고문을 재확인해야 합니다.</p>

          <h2 className="text-xl font-bold text-slate-900 mb-2">제4조 (약관의 효력 및 변경)</h2>
          <p className="mb-2">① 본 약관은 모아팁스 서비스 화면에 게시함으로써 효력이 발생합니다.</p>
          <p className="mb-6">② 관련 법령에 위배되지 않는 범위 내에서 약관이 개정될 수 있으며, 중요한 변경 사항은 적용일 7일 전(중대한 변경은 30일 전)부터 사이트에 미리 공지합니다.</p>

          <h2 className="text-xl font-bold text-slate-900 mb-2">제5조 (서비스 이용 및 광고 게재)</h2>
          <p className="mb-2">① 모아팁스는 별도의 회원가입 없이 누구나 무료로 이용할 수 있으며, 서비스 접속 시 본 약관에 동의한 것으로 간주합니다.</p>
          <p className="mb-6">② 서비스 화면에는 원활한 운영을 위해 제3자의 광고가 포함될 수 있습니다.</p>

          <h2 className="text-xl font-bold text-slate-900 mb-2">제6조 (이용자의 의무)</h2>
          <p className="mb-2">이용자는 다음 행위를 삼가야 합니다.</p>
          <ul className="list-disc pl-5 mb-6 space-y-1">
            <li>모아팁스의 콘텐츠를 상업적 목적으로 무단 복제, 배포, 크롤링(자동 수집)하는 행위</li>
            <li>정상적인 서비스 운영을 고의로 방해하거나 서버에 과부하를 주는 행위</li>
            <li>모아팁스 또는 제3자의 저작권 등 지식재산권을 침해하는 행위</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mb-2">제7조 (지식재산권의 귀속)</h2>
          <p className="mb-2">① 모아팁스가 자체 제작한 디자인, 텍스트, 이미지 등에 대한 지식재산권은 모아팁스에 있습니다.</p>
          <p className="mb-6">② 공공 API를 통해 제공받은 데이터의 권리는 해당 원본 제공 기관의 정책(공공누리 등)을 따릅니다.</p>

          <h2 className="text-xl font-bold text-slate-900 mb-2">제8조 (외부 링크 및 제휴 서비스 책임)</h2>
          <p className="mb-2">① 서비스 내 포함된 제3자 광고(Google AdSense 등) 및 제휴 링크(쿠팡 파트너스 등)를 통한 상품 구매나 거래는 전적으로 이용자와 해당 업체 간의 책임하에 이루어집니다.</p>
          <p className="mb-6">② 모아팁스는 연결된 외부 웹사이트가 제공하는 정보의 유효성이나 신뢰도에 대해 법적으로 보증하지 않습니다.</p>

          <h2 className="text-xl font-bold text-slate-900 mb-2">제9조 (면책 조항)</h2>
          <p className="mb-2">① 천재지변, 시스템 장애 등 불가항력적 사유로 서비스를 제공할 수 없는 경우 이에 대한 책임을 지지 않습니다.</p>
          <p className="mb-6">② 이용자가 모아팁스의 정보를 바탕으로 내린 결정으로 인해 발생한 손해나, 신청 기간 만료 등으로 인한 불이익에 대해 당사는 법적 책임을 지지 않습니다.</p>

          <h2 className="text-xl font-bold text-slate-900 mb-2">제10조 (서비스의 변경 및 중단)</h2>
          <p className="mb-6">운영상, 기술상의 필요나 외부 API 제공 기관의 사정에 따라 서비스의 일부 또는 전부가 예고 없이 변경되거나 중단될 수 있습니다.</p>

          <h2 className="text-xl font-bold text-slate-900 mb-2">제11조 (준거법 및 관할법원)</h2>
          <p className="mb-8">본 약관의 해석 및 이용자와의 분쟁에 대해서는 대한민국 법률을 따르며, 관할법원은 민사소송법에 따릅니다.</p>

          <div className="border-t border-slate-100 pt-6 mt-8">
            <h3 className="text-lg font-bold text-slate-900 mb-2">문의 및 연락처</h3>
            <p className="mb-2">📧 이메일: <a href="mailto:omnia.ahn.biz@gmail.com" className="text-cyan-600 hover:text-cyan-700 transition-colors font-medium">omnia.ahn.biz@gmail.com</a></p>
            <p>🌐 사이트: 수도권 모아팁스(<a href="https://moa-tips.com" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 transition-colors font-medium">moa-tips.com</a>)</p>
          </div>
        </div>

        {/* 하단 링크 */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-slate-400 font-medium">
          <Link href="/terms" className="text-slate-700 font-bold transition-colors">이용약관</Link>
          <Link href="/privacy" className="hover:text-slate-700 transition-colors">개인정보처리방침</Link>
          <Link href="/disclaimer" className="hover:text-slate-700 transition-colors">면책공고</Link>
          <Link href="/contact" className="hover:text-slate-700 transition-colors">광고문의</Link>
        </div>

      </div>
    </main>
  );
}
