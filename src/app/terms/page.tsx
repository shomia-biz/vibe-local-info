import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "이용약관 | 모아팁스",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FFFBF7] py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-800 font-medium mb-4">
            <span className="mr-1">←</span> 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">이용약관</h1>
          <p className="text-gray-500">최종 업데이트: 2026년 5월 24일</p>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-gray-100 text-gray-700 leading-relaxed">
          <h2 className="text-xl font-bold text-gray-900 mb-2">제1조 (목적)</h2>
          <p className="mb-6">본 약관은 수도권 모아팁스(이하 "모아팁스")이 제공하는 정보 서비스(이하 "서비스")를 이용자가 이용함에 있어, "모아팁스"과 이용자의 권리, 의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

          <h2 className="text-xl font-bold text-gray-900 mb-2">제2조 (용어의 정의)</h2>
          <ul className="list-none pl-0 mb-6 space-y-2">
            <li>① "서비스"란 "모아팁스"이 공공데이터 등을 활용하여 웹사이트를 통해 제공하는 축제·행사, 지원금·혜택 정보 및 생활 정보 콘텐츠 일체를 의미합니다.</li>
            <li>② "이용자"란 "모아팁스"의 웹사이트에 접속하여 본 약관에 따라 "모아팁스"이 제공하는 "서비스"를 이용하는 자를 말합니다.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mb-2">제3조 (서비스의 내용 및 정보의 한계)</h2>
          <p className="mb-2">① "모아팁스"은 공공데이터포털(data.go.kr) 및 각 지방자치단체의 공식 API, 공식 공고 등을 활용하여 수도권(서울·경기·인천) 지역의 다음 각 호의 정보를 제공합니다.</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>수도권 문화행사 및 축제 정보</li>
            <li>정부·지자체 지원금 및 혜택 정보</li>
            <li>블로그 형태의 생활 정보 콘텐츠</li>
          </ul>
          <p className="mb-2">② "모아팁스"이 제공하는 정보는 정확성을 위해 최선을 다하나, 원본 데이터의 변경, API 오류, 연동 지연 등으로 인해 실제 공고 내용과 일시적인 차이가 발생할 수 있습니다.</p>
          <p className="mb-6">③ 이용자는 지원금 신청, 행사 참여 등 본인의 권리·의무에 중대한 영향을 미치는 사안에 대해서는 반드시 해당 발행 기관의 공식 공고문을 재확인하여야 합니다.</p>

          <h2 className="text-xl font-bold text-gray-900 mb-2">제4조 (약관의 효력 및 변경)</h2>
          <ul className="list-none pl-0 mb-6 space-y-2">
            <li>① 본 약관은 "모아팁스"이 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
            <li>② "모아팁스"은 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
            <li>③ "모아팁스"이 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 이전(이용자에게 불리하거나 중대한 사항의 변경은 30일 이전)부터 적용일 전일까지 공지합니다.</li>
            <li>④ "모아팁스"이 전항에 따라 개정약관을 공지하면서 '이용자가 공지 기간 내에 거부 의사를 표시하지 않으면 동의한 것으로 본다'는 뜻을 명확하게 공지하였음에도 이용자가 명시적으로 거부 의사를 표시하지 아니한 경우, 이용자가 개정약관에 동의한 것으로 봅니다.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mb-2">제5조 (서비스 이용 및 광고의 게재)</h2>
          <ul className="list-none pl-0 mb-6 space-y-2">
            <li>① "모아팁스"의 서비스는 별도의 회원가입 없이 무료로 이용할 수 있습니다. 이용자가 서비스를 이용하는 경우 본 약관에 동의한 것으로 간주합니다.</li>
            <li>② "모아팁스"은 서비스의 운영과 관련하여 서비스 화면에 광고를 게재할 수 있습니다.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mb-2">제6조 (이용자의 의무)</h2>
          <p className="mb-2">이용자는 다음 각 호의 행위를 하여서는 안 됩니다.</p>
          <ul className="list-disc pl-5 mb-6 space-y-1">
            <li>"모아팁스"이 제공하는 정보 및 콘텐츠를 상업적 목적으로 무단 복제, 배포, 크롤링(매크로 수집), 전송 또는 판매하는 행위</li>
            <li>"모아팁스"의 정상적인 서비스 운영을 방해하거나 서버 및 시스템에 과부하를 일으키는 행위</li>
            <li>"모아팁스" 또는 제3자의 저작권 등 지식재산권을 침해하는 행위</li>
            <li>"모아팁스"이 제공하는 정보를 고의로 왜곡·변형하여 제3자를 기망하거나 오인하게 하는 행위</li>
            <li>기타 관련 법령 및 미풍양속에 반하는 행위</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mb-2">제7조 (지식재산권의 귀속)</h2>
          <ul className="list-none pl-0 mb-6 space-y-2">
            <li>① "모아팁스"이 자체적으로 작성한 블로그 콘텐츠, 텍스트, 디자인, 이미지, 로고 등에 대한 지식재산권은 "모아팁스"에 귀속됩니다.</li>
            <li>② 공공데이터포털 및 지자체 API를 통해 제공받은 공공데이터의 저작권 및 이용 권한은 해당 원본 데이터 제공 기관의 이용 정책(공공누리 등)을 따릅니다.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mb-2">제8조 (광고 및 외부 링크에 대한 책임)</h2>
          <ul className="list-none pl-0 mb-6 space-y-2">
            <li>① "모아팁스"은 Google AdSense, 쿠팡 파트너스 등 제3자의 광고 및 제휴 서비스를 포함하고 있습니다.</li>
            <li>② 서비스 내에 포함된 외부 웹사이트로의 링크는 이용자의 편의를 위해 제공되는 것이며, "모아팁스"은 연결된 외부 웹사이트의 독립성, 독자성 및 해당 사이트가 제공하는 정보·상품·서비스의 유효성에 대해 보증하거나 책임을 지지 않습니다.</li>
            <li>③ 광고주나 제휴 몰을 통한 상품 구매, 지원 신청 등 모든 거래 행위는 이용자와 해당 제3자 간의 책임 하에 이루어집니다.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mb-2">제9조 (면책 조항)</h2>
          <ul className="list-none pl-0 mb-6 space-y-2">
            <li>① "모아팁스"은 천재지변, 전시, 사변, 정부의 규제, 통신사업자의 서비스 중단, 디도스(DDoS) 공격, API 제공 기관의 시스템 장애 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우, 이로 인해 이용자에게 발생한 손해에 대해 책임을 지지 않습니다.</li>
            <li>② "모아팁스"은 고의 또는 중대한 과실이 없는 한, 이용자가 서비스를 통해 얻은 정보(오류, 누락, 지연된 정보 포함)를 신뢰하여 내린 결정이나 조치로 인해 발생한 손해에 대해 책임을 지지 않습니다.</li>
            <li>③ 이용자가 지원금 신청 기간을 초과하거나 서류 미비, 자격 요건 불충족 등으로 인해 발생한 불이익 및 혜택 미수령에 대하여 "모아팁스"은 책임을 지지 않습니다.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mb-2">제10조 (서비스의 변경 및 중단)</h2>
          <ul className="list-none pl-0 mb-6 space-y-2">
            <li>① "모아팁스"은 운영상, 기술상의 필요 또는 정부 정책 및 API 제공 기관의 사정에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.</li>
            <li>② 서비스의 중대한 변경 또는 중단이 있는 경우, "모아팁스"은 서비스 내 공지사항을 통해 사전에 이용자에게 고지합니다. 다만, 예측할 수 없는 시스템 장애 등의 긴급한 사유가 있는 경우에는 사후에 고지할 수 있습니다.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mb-2">제11조 (준거법 및 관할법원)</h2>
          <ul className="list-none pl-0 mb-8 space-y-2">
            <li>① 본 약관의 해석 및 "모아팁스"과 이용자 간의 분쟁에 대해서는 대한민국 법률을 준거법으로 합니다.</li>
            <li>② "모아팁스"과 이용자 간에 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원을 제1심 법원으로 합니다.</li>
          </ul>

          <div className="border-t border-gray-100 pt-6 mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2">문의 및 연락처</h3>
            <p className="mb-2">📧 이메일: <a href="mailto:omnia.ahn.biz@gmail.com" className="text-gray-700 hover:text-orange-600 transition-colors">omnia.ahn.biz@gmail.com</a></p>
            <p>🌐 사이트: 수도권 모아팁스(<a href="https://moa-tips.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-orange-600 transition-colors">moa-tips.com)</a></p>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <Link href="/terms" className="font-bold text-blue-900">이용약관</Link>
            <Link href="/privacy" className="hover:font-bold text-blue-900">개인정보처리방침</Link>
            <Link href="/disclaimer" className="hover:font-bold text-blue-900">면책공고</Link>
            <Link href="/contact" className="hover:font-bold text-blue-900">광고문의</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
