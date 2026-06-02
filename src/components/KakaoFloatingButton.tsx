'use client';

import { useState, useEffect } from "react";

export default function KakaoFloatingButton() {
  const tooltipMessages = [
    "매주 소상공인 지원금 알림 받기 💬",
    "놓치기 아까운 우리 동네 혜택 🎁",
    "이번 주 마감 임박 공고 확인! ⏳"
  ];
  const [tooltipIndex, setTooltipIndex] = useState(0);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTooltipIndex((prev) => (prev + 1) % tooltipMessages.length);
    }, 4000); // 4초마다 텍스트 변경
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 5초 후에 말풍선을 숨김
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-[5.5rem] right-6 z-[9998] flex flex-col items-end gap-3 pointer-events-none">
      {showTooltip && (
        <div className="bg-white px-4 py-2 rounded-2xl shadow-lg border border-slate-100 font-bold text-sm text-slate-700 pointer-events-auto relative transition-transform hover:-translate-y-1">
          {tooltipMessages[tooltipIndex]}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-b border-r border-slate-100 transform rotate-45"></div>
        </div>
      )}
      <button 
        onClick={() => {
          window.open('http://pf.kakao.com/_CrWxjX', '_blank');
        }}
        className="w-14 h-14 bg-[#FEE500] hover:bg-[#FADA0A] text-[#371d1e] rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 pointer-events-auto"
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg" 
          alt="카카오톡 채널 추가" 
          className="w-8 h-8"
        />
      </button>
    </div>
  );
}
