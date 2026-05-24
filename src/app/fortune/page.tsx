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
          <p className="text-slate-500 animate-pulse font-bold">운세 데이터를 불러오는 중입니다...</p>
        </div>
      ) : fortuneData ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10 text-center max-w-2xl mx-auto hover:shadow-lg transition-shadow">
          <div className="mb-6 inline-block px-5 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-black tracking-wide">
            {fortuneData.date} 운세
          </div>
          
          <p className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed mb-10 break-keep">
            "{fortuneData.general}"
          </p>
          
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200/60">
            <h3 className="text-sm font-black text-slate-400 mb-3 tracking-widest">오늘의 럭키 아이템</h3>
            <p className="text-2xl font-black text-rose-500 mb-8">{fortuneData.lucky_item}</p>
            <a 
              href={fortuneData.coupang_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block w-full sm:w-auto px-8 py-4 bg-rose-500 text-white font-black rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-600 hover:-translate-y-0.5 transition-all"
            >
              럭키 아이템 구경하기 🎁
            </a>
            <p className="text-[11px] font-medium text-slate-400 mt-5">
              이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
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
