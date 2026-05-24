"use client";

import React, { useEffect, useState } from 'react';

interface FortuneData {
  date: string;
  general: string;
  lucky_item: string;
  coupang_url: string;
}

export default function FortunePage() {
  const [fortuneData, setFortuneData] = useState<FortuneData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetch('/data/today_fortune.json?t=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error('Fortune data not found');
        return res.json();
      })
      .then(data => {
        setFortuneData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 min-h-[60vh]">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8 text-center">🔮 오늘의 운세</h1>
      
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-500 animate-pulse font-bold">운세 카드를 가져오는 중입니다...</p>
        </div>
      ) : fortuneData ? (
        <div className="max-w-sm mx-auto perspective-[1000px]" style={{ perspective: '1000px' }}>
          <div 
            className={`relative w-full cursor-pointer ${isFlipped ? '' : 'hover:-translate-y-2'} transition-all duration-300`}
            onClick={() => setIsFlipped(true)}
            style={{ 
              transformStyle: 'preserve-3d', 
              transition: 'transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1)', 
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight: '480px'
            }}
          >
            {/* Front of the Card */}
            <div 
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl border-4 border-indigo-200/50 p-10 text-center flex flex-col items-center justify-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-7xl mb-8 animate-pulse">✨</div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-wide drop-shadow-md">
                오늘의 운세 카드
              </h2>
              <p className="text-indigo-100 mt-6 font-bold bg-white/20 px-6 py-2 rounded-full shadow-inner">
                클릭해서 뒤집기 👆
              </p>
            </div>

            {/* Back of the Card */}
            <div 
              className="absolute top-0 left-0 w-full h-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 text-center flex flex-col justify-between"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div>
                <div className="mb-6 inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black tracking-wide">
                  {fortuneData.date} 운세
                </div>
                <p className="text-lg font-bold text-slate-800 leading-relaxed mb-6 break-keep">
                  "{fortuneData.general}"
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200/60 mt-auto">
                <h3 className="text-xs font-black text-slate-400 mb-2 tracking-widest">🍀 오늘의 럭키 아이템</h3>
                <p className="text-xl font-black text-rose-500 mb-6">{fortuneData.lucky_item}</p>
                <a 
                  href={fortuneData.coupang_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block w-full px-6 py-3.5 bg-rose-500 text-white font-black rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  구경하기 🎁
                </a>
                <p className="text-[10px] font-medium text-slate-400 mt-4 leading-tight">
                  이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-600 font-medium">아직 오늘의 운세가 준비되지 않았습니다. 잠시 후 다시 확인해주세요!</p>
        </div>
      )}
    </main>
  );
}
