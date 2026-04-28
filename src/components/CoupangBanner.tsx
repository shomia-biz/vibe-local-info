'use client';

const COUPANG_ID = process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID;

export default function CoupangBanner() {
  if (!COUPANG_ID || COUPANG_ID === '나중에_입력') {
    return null;
  }

  // 실제 쿠팡 파트너스 배너 코드는 광고주마다 다르지만, 
  // 여기서는 ID를 기반으로 한 기본 배너 영역을 구성합니다.
  return (
    <div className="my-8 w-full">
      <div className="bg-white rounded-2xl border border-orange-100 p-4 shadow-sm overflow-hidden">
        <p className="text-[10px] text-gray-400 mb-3 tracking-widest uppercase text-center">Recommended for you</p>
        <div className="flex flex-col items-center">
          {/* 쿠팡 파트너스 다이내믹 배너 스크립트가 들어갈 자리 */}
          <iframe 
            src={`https://ads-partners.coupang.com/widgets.html?id=${COUPANG_ID}&template=carousel&trackingCode=AF1234567&subId=blog`} 
            width="100%" 
            height="140" 
            frameBorder="0" 
            scrolling="no" 
            referrerPolicy="unsafe-url"
            title="Coupang Partners Banner"
          ></iframe>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다."
          </p>
        </div>
      </div>
    </div>
  );
}
