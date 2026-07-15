'use client';
import { useState, useEffect } from 'react';

const COUPANG_ID = process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID;

export default function CoupangBanner() {
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);

  useEffect(() => {
    // 기존 배너(생활용품 등)와 새 배너(식품: 994552) 아이디 배열
    const bannerIds = [COUPANG_ID, "994552"].filter(Boolean) as string[];
    // 배열에서 랜덤하게 하나 선택
    const randomId = bannerIds[Math.floor(Math.random() * bannerIds.length)];
    setActiveWidgetId(randomId);
  }, []);

  if (!activeWidgetId || activeWidgetId === '나중에_입력') {
    return null;
  }

  // [임시 조치] 쿠팡 파트너스 승인 전까지 화면 출력 중단
  return null;

  // 배너 위젯 ID는 보통 6자리 이상의 '숫자'입니다. AF로 시작하는 파트너스 ID와 다릅니다.
  const isWidgetIdValid = /^\d+$/.test(activeWidgetId);

  return (
    <div className="my-8 w-full">
      <div className="bg-white rounded-2xl border border-orange-100 p-4 shadow-sm overflow-hidden text-center">
        <p className="text-[10px] text-gray-400 mb-3 tracking-widest uppercase">Recommended for you</p>
        
        {isWidgetIdValid ? (
          <div className="flex flex-col items-center">
            <iframe 
              src={`https://ads-partners.coupang.com/widgets.html?id=${activeWidgetId}&template=carousel&trackingCode=AF8906554&subId=blog`} 
              width="100%" 
              height="140" 
              frameBorder="0" 
              scrolling="no" 
              referrerPolicy="unsafe-url"
              title="Coupang Partners Banner"
            ></iframe>
          </div>
        ) : (
          <div className="py-6 px-4 bg-orange-50 rounded-xl border border-orange-100">
            <h3 className="text-orange-800 font-bold mb-2">⚠️ 배너 설정이 필요합니다</h3>
            <p className="text-orange-600 text-sm mb-4 break-keep">
              현재 입력된 값(<code>{activeWidgetId}</code>)은 배너 위젯 ID가 아닙니다. <br/>
              쿠팡 파트너스 홈페이지 &gt; 링크생성 &gt; <b>다이나믹 배너</b>에서 배너를 만드신 후, <b>배너 ID(숫자)</b>를 <code>.env.local</code> 파일의 <code>NEXT_PUBLIC_COUPANG_PARTNER_ID</code>에 입력해 주세요.
            </p>
          </div>
        )}

        <p className="text-[10px] text-gray-400 mt-3 text-center">
          "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다."
        </p>
      </div>
    </div>
  );
}
